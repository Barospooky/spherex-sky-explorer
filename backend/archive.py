from pathlib import Path
import hashlib, io, json, sqlite3, threading
from urllib.parse import urlencode, urlparse
import httpx
import numpy as np
from astropy.io import fits, votable
from PIL import Image
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse

router = APIRouter(prefix='/api')
DATA = Path(__file__).resolve().parent / 'data'
CUTOUTS = DATA / 'cutouts'
CUTOUTS.mkdir(parents=True, exist_ok=True)
LOCK = threading.Lock()

def db():
    conn = sqlite3.connect(DATA / 'observations.sqlite3', timeout=30)
    conn.execute('PRAGMA journal_mode=WAL')
    conn.execute('CREATE TABLE IF NOT EXISTS observations (id TEXT PRIMARY KEY, metadata TEXT NOT NULL)')
    return conn

def fetch(url, limit):
    content = bytearray()
    with httpx.stream('GET', url, timeout=90, follow_redirects=False) as response:
        response.raise_for_status()
        for chunk in response.iter_bytes():
            content.extend(chunk)
            if len(content) > limit:
                raise ValueError('Archive response exceeds configured size limit')
    return bytes(content)

@router.get('/observations')
def search(ra: float = Query(ge=0, lt=360), dec: float = Query(ge=-90, le=90)):
    records, warnings = [], []
    for release in ('dr1', 'qr3'):
        try:
            url = 'https://irsa.ipac.caltech.edu/SIA?' + urlencode({'COLLECTION': 'spherex_' + release, 'POS': f'CIRCLE {ra} {dec} 0.001', 'MAXREC': 300})
            table = votable.parse_single_table(io.BytesIO(fetch(url, 20*1024*1024))).to_table(use_names_over_ids=True)
            for row in table:
                def value(name):
                    v = row[name] if name in table.colnames else None
                    if v is None or np.ma.is_masked(v): return None
                    if isinstance(v, bytes): return v.decode()
                    if isinstance(v, (float, np.floating)): return float(v) if np.isfinite(v) else None
                    return str(v)
                source = value('access_url')
                if not source: continue
                item = dict(id=hashlib.sha256(source.encode()).hexdigest(), source_url=source, release=release, obs_id=value('obs_id'), mjd=value('t_min'), band=value('energy_bandpassname'), em_min=value('em_min'), em_max=value('em_max'))
                records.append(item)
            if len(table) >= 300: warnings.append(release + ': result limit reached; this is a bounded sample.')
        except Exception as exc:
            warnings.append(f'{release}: {type(exc).__name__}: {exc}')
    with db() as conn:
        conn.executemany('INSERT OR REPLACE INTO observations VALUES (?, ?)', [(r['id'], json.dumps(r)) for r in records])
    records.sort(key=lambda r: r['mjd'] or 0)
    pair = []
    for a in records:
        for b in reversed(records):
            if a['band'] and a['band'] == b['band'] and a['mjd'] is not None and b['mjd'] is not None and b['mjd'] - a['mjd'] > 1 and a['em_min'] and b['em_min'] and min(a['em_max'], b['em_max']) > max(a['em_min'], b['em_min']):
                pair = [a['id'], b['id']]; break
        if pair: break
    return {'observations': records, 'suggested_pair': pair, 'warnings': warnings, 'pair_note': 'Candidate pair: same detector and overlapping archive spectral ranges, separated by more than one day. Local pixel wavelengths require verification.'}

@router.get('/cutouts/{observation_id}')
def cutout(observation_id: str, ra: float = Query(ge=0, lt=360), dec: float = Query(ge=-90, le=90), size: float = Query(default=0.05, ge=0.005, le=0.1)):
    with db() as conn:
        row = conn.execute('SELECT metadata FROM observations WHERE id=?', (observation_id,)).fetchone()
    if not row: raise HTTPException(404, 'Search for this observation first')
    item = json.loads(row[0]); source = item['source_url']; parsed = urlparse(source)
    if parsed.scheme != 'https' or parsed.netloc != 'irsa.ipac.caltech.edu' or not parsed.path.startswith('/ibe/data/spherex/') or parsed.query:
        raise HTTPException(422, 'Archive URL does not support the trusted cutout service')
    key = hashlib.sha256(f'{source}:{ra}:{dec}:{size}:v1'.encode()).hexdigest()
    path = CUTOUTS / (key + '.fits'); preview = CUTOUTS / (key + '.png')
    try:
        with LOCK:
            cached = path.exists() and preview.exists()
            if not path.exists():
                data = fetch(source + '?' + urlencode({'center': f'{ra},{dec}', 'size': size}), 32*1024*1024)
                with fits.open(io.BytesIO(data)) as hdus: hdus.verify('exception')
                temp = path.with_suffix('.tmp'); temp.write_bytes(data); temp.replace(path)
            if not preview.exists():
                with fits.open(path, memmap=False) as hdus:
                    science = next((h for h in hdus if h.name.upper() in ('IMAGE', 'SCI', 'SCIENCE') and h.data is not None and h.data.ndim == 2), None)
                    if science is None: raise ValueError('No recognized 2D science image extension')
                    array = np.asarray(science.data, dtype=float)
                    finite = np.isfinite(array)
                    if not finite.any(): raise ValueError('Cutout contains no finite science pixels')
                    low, high = np.percentile(array[finite], [1, 99])
                    scaled = np.arcsinh(10*np.clip((array-low)/max(high-low, 1e-20), 0, 1))/np.arcsinh(10)
                    pixels = (np.nan_to_num(scaled)*255).astype('uint8')
                    Image.fromarray(np.flipud(pixels)).save(preview)
        return {'preview_url': f'/api/files/{key}.png', 'fits_url': f'/api/files/{key}.fits', 'cached': cached, 'observation': item, 'processing': 'Native pixel orientation; vertical flip; independent 1-99 percentile asinh stretch. Not registered or suitable for quantitative brightness comparison.'}
    except Exception as exc:
        raise HTTPException(502, f'Cutout unavailable: {type(exc).__name__}: {exc}') from exc

@router.get('/files/{filename}')
def file(filename: str):
    stem, _, extension = filename.partition('.')
    if len(stem) != 64 or any(c not in '0123456789abcdef' for c in stem) or extension not in ('png', 'fits'):
        raise HTTPException(404)
    path = CUTOUTS / filename
    if not path.exists(): raise HTTPException(404)
    return FileResponse(path, media_type='image/png' if extension == 'png' else 'application/fits')

