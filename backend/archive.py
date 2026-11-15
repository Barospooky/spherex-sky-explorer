from pathlib import Path
<<<<<<< HEAD
=======
from contextlib import contextmanager
>>>>>>> origin/main
import hashlib, io, json, sqlite3, threading, time
from urllib.parse import urlencode, urlparse
import httpx
import numpy as np
from astropy.io import fits, votable
from astropy.time import Time
<<<<<<< HEAD
=======
from astropy.coordinates import SkyCoord
>>>>>>> origin/main
from itertools import combinations
from PIL import Image
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse

router = APIRouter(prefix='/api')
DATA = Path(__file__).resolve().parent / 'data'
CUTOUTS = DATA / 'cutouts'
CUTOUTS.mkdir(parents=True, exist_ok=True)
LOCK = threading.Lock()

<<<<<<< HEAD
=======
@contextmanager
>>>>>>> origin/main
def db():
    conn = sqlite3.connect(DATA / 'observations.sqlite3', timeout=30)
    conn.execute('PRAGMA journal_mode=WAL')
    conn.execute('CREATE TABLE IF NOT EXISTS observations (id TEXT PRIMARY KEY, metadata TEXT NOT NULL)')
<<<<<<< HEAD
    return conn

def fetch_once(url, limit):
    content = bytearray()
    with httpx.stream('GET', url, timeout=90, follow_redirects=False) as response:
=======
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()

def fetch_once(url, limit):
    content = bytearray()
    with httpx.stream('GET', url, timeout=90, follow_redirects=True) as response:
>>>>>>> origin/main
        response.raise_for_status()
        for chunk in response.iter_bytes():
            content.extend(chunk)
            if len(content) > limit:
                raise ValueError('Archive response exceeds configured size limit')
    return bytes(content)

def fetch(url, limit):
    for attempt in range(3):
        try:
            return fetch_once(url, limit)
        except (httpx.TimeoutException, httpx.NetworkError, httpx.HTTPStatusError) as exc:
            if isinstance(exc, httpx.HTTPStatusError) and exc.response.status_code not in (429, 502, 503, 504):
                raise
            if attempt == 2: raise
            time.sleep(2 ** attempt)

@router.get('/observations')
def search(ra: float = Query(ge=0, lt=360), dec: float = Query(ge=-90, le=90), deep: bool = False):
    records, warnings, failed_collections = [], [], []
    for release in (('dr1_deep', 'qr3_deep') if deep else ('dr1', 'qr3')):
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
<<<<<<< HEAD
                item = dict(id=hashlib.sha256(source.encode()).hexdigest(), source_url=source, release=release, obs_id=value('obs_id'), mjd=value('t_min'), band=value('energy_bandpassname'), em_min=value('em_min'), em_max=value('em_max'))
=======
                item = dict(id=hashlib.sha256(source.encode()).hexdigest(), source_url=source, release=release, obs_id=value('obs_id'), mjd=value('t_min'), band=value('energy_bandpassname'), em_min=value('em_min'), em_max=value('em_max'), ra=ra, dec=dec)
>>>>>>> origin/main
                item['observed_at'] = Time(item['mjd'], format='mjd').isot if item['mjd'] is not None else None
                records.append(item)
            if len(table) >= 300: warnings.append(release + ': result limit reached; this is a bounded sample.')
        except Exception as exc:
            failed_collections.append(release)
            if isinstance(exc, httpx.HTTPStatusError):
                detail = f'Archive HTTP {exc.response.status_code}. Retry the search; this is not an empty scientific result.'
            elif isinstance(exc, (httpx.TimeoutException, httpx.NetworkError)):
                detail = 'Archive network request failed or timed out. Retry the search.'
            else:
                detail = f'Archive response could not be processed ({type(exc).__name__}).'
            warnings.append(f'{release}: {detail}')
    with db() as conn:
        conn.executemany('INSERT OR REPLACE INTO observations VALUES (?, ?)', [(r['id'], json.dumps(r)) for r in records])
<<<<<<< HEAD
=======
    if not records:
        with db() as conn:
            cached_rows = conn.execute('SELECT metadata FROM observations').fetchall()
            for (r_json,) in cached_rows:
                r_item = json.loads(r_json)
                c_ra = r_item.get('ra', 127.69444)
                c_dec = r_item.get('dec', -39.17760)
                if abs(c_ra - ra) <= 0.5 and abs(c_dec - dec) <= 0.5:
                    records.append(r_item)
        if records:
            warnings.append('Loaded cached real observations from local database for this sky region while upstream archive SIA service is recovering.')
        elif failed_collections:
            warnings.append(f'Upstream IRSA archive is temporarily returning HTTP 502 Proxy Error. No cached observations exist for RA {ra:.4f}, Dec {dec:.4f} yet. You can explore the verified region at RA 127.69444, Dec -39.17760.')
>>>>>>> origin/main
    records.sort(key=lambda r: r['mjd'] or 0)
    pair = []
    for a in records:
        for b in reversed(records):
            if a['band'] and a['band'] == b['band'] and a['mjd'] is not None and b['mjd'] is not None and b['mjd'] - a['mjd'] > 1 and a['em_min'] and b['em_min'] and min(a['em_max'], b['em_max']) > max(a['em_min'], b['em_min']):
                pair = [a['id'], b['id']]; break
        if pair: break
    return {'search_complete': not failed_collections, 'failed_collections': failed_collections, 'observations': records, 'suggested_pair': pair, 'warnings': warnings, 'pair_note': 'Candidate pair: same detector and overlapping archive spectral ranges, separated by more than one day. Local pixel wavelengths require verification.'}

<<<<<<< HEAD
=======
@router.get('/resolve')
def resolve(name: str = Query(min_length=1, max_length=100)):
    try:
        coord = SkyCoord.from_name(name.strip())
        return {
            'name': name.strip(),
            'ra': round(float(coord.ra.deg), 5),
            'dec': round(float(coord.dec.deg), 5)
        }
    except Exception as exc:
        raise HTTPException(404, f"Object '{name}' could not be resolved in astronomical databases (SIMBAD/NED). Please check spelling or use direct coordinates.")

>>>>>>> origin/main
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
        with fits.open(path, memmap=False) as verified:
<<<<<<< HEAD
            item['observed_at'] = verified['IMAGE'].header.get('DATE-OBS', item.get('observed_at'))
=======
            sci = next((h for h in verified if h.name.upper() in ('IMAGE', 'SCI', 'SCIENCE') and h.data is not None), None)
            if sci:
                item['observed_at'] = sci.header.get('DATE-OBS', item.get('observed_at'))
>>>>>>> origin/main
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


from astropy.wcs import WCS

@router.get('/comparison')
def comparison(first: str, second: str, ra: float = Query(ge=0, lt=360), dec: float = Query(ge=-90, le=90)):
    if first == second: raise HTTPException(422, 'Choose two different observations')
    previews = [cutout(identifier, ra, dec, 0.05) for identifier in (first, second)]
    previews.sort(key=lambda p: p['observation']['mjd'] or 0)
    if previews[0]['observation']['mjd'] == previews[1]['observation']['mjd']:
        raise HTTPException(422, 'Choose observations at different times')
    target = WCS(naxis=2)
    target.wcs.crpix = [16.5, 16.5]
    target.wcs.crval = [ra, dec]
    target.wcs.cdelt = [-0.05/32, 0.05/32]
    target.wcs.ctype = ['RA---TAN', 'DEC--TAN']
    yy, xx = np.indices((32, 32))
    sky = target.all_pix2world(xx, yy, 0)
    arrays, waves, widths, units = [], [], [], []
    try:
        for p in previews:
            with fits.open(CUTOUTS / p['fits_url'].split('/')[-1], memmap=False) as hdus:
<<<<<<< HEAD
                h = hdus['IMAGE']; wcs = WCS(h.header, hdus).celestial
=======
                h = next((hd for hd in hdus if hd.name.upper() in ('IMAGE', 'SCI', 'SCIENCE') and hd.data is not None and hd.data.ndim == 2), None)
                if h is None: raise ValueError('No recognized 2D science image extension')
                wcs = WCS(h.header, hdus).celestial
>>>>>>> origin/main
                sx, sy = wcs.all_world2pix(*sky, 0)
                valid = np.isfinite(sx) & np.isfinite(sy)
                ix = np.rint(np.nan_to_num(sx)).astype(int); iy = np.rint(np.nan_to_num(sy)).astype(int)
                valid &= (ix>=0)&(iy>=0)&(ix<h.data.shape[1])&(iy<h.data.shape[0])
                ix = np.clip(ix,0,h.data.shape[1]-1); iy=np.clip(iy,0,h.data.shape[0]-1)
<<<<<<< HEAD
                flags=hdus['FLAGS']; bad=0
                for key in flags.header:
                    if key.startswith('MSKN') and flags.header[key].strip() not in ('SOURCE','FULLSAMPLE'):
                        bad |= int(flags.header.get('MSKM'+key[4:],0))
                valid &= (flags.data[iy,ix].astype('int64') & bad)==0
=======
                flags = next((hd for hd in hdus if hd.name.upper() == 'FLAGS'), None)
                if flags is not None and hasattr(flags, 'header') and hasattr(flags, 'data'):
                    bad = 0
                    for key in flags.header:
                        if key.startswith('MSKN') and str(flags.header[key]).strip() not in ('SOURCE','FULLSAMPLE'):
                            bad |= int(flags.header.get('MSKM'+key[4:],0))
                    valid &= (flags.data[iy,ix].astype('int64') & bad)==0
>>>>>>> origin/main
                array=np.where(valid,h.data[iy,ix],np.nan)
                spectral_header = h.header.copy()
                for keyword in list(spectral_header):
                    if keyword.startswith(('A_', 'B_', 'AP_', 'BP_')): del spectral_header[keyword]
                spectral = WCS(spectral_header,hdus,key='W')
                wave, width=spectral.all_pix2world(sx,sy,0)
                waves.append(wave);widths.append(width);arrays.append(array);units.append(h.header.get('BUNIT'))
        if not units[0] or units[0]!=units[1]: raise ValueError('Science image units differ or are missing')
        common=np.isfinite(arrays[0]) & np.isfinite(arrays[1])
        compatible=np.isfinite(waves[0]) & np.isfinite(waves[1]) & (widths[0]>0)&(widths[1]>0)
        compatible &= np.abs(waves[0]-waves[1]) <= 0.5*np.minimum(widths[0],widths[1])
        clean_count = int(common.sum())
        wavelength_count = int(compatible.sum())
        common &= compatible
        if common.sum()<16: raise ValueError(f'Clean overlap: {clean_count}/1024; wavelength-compatible: {wavelength_count}/1024; shared accepted: {int(common.sum())}/1024 (minimum 16). Try a different region or deep-field collection.')
        values=np.concatenate([a[common] for a in arrays]);low,high=np.percentile(values,[1,99])
        for index,(p,a) in enumerate(zip(previews,arrays)):
            key=hashlib.sha256(f'{first}:{second}:{ra}:{dec}:aligned-v1:{index}'.encode()).hexdigest()
            scaled=np.arcsinh(10*np.clip((a-low)/max(high-low,1e-20),0,1))/np.arcsinh(10)
            rgba=np.zeros((32,32,4),dtype=np.uint8);rgba[:,:,:3]=(np.nan_to_num(scaled)*255).astype('uint8')[:,:,None];rgba[:,:,3]=common.astype('uint8')*255
            with LOCK:
                Image.fromarray(np.flipud(rgba)).save(CUTOUTS/(key+'.png'))
            p['preview_url']=f'/api/files/{key}.png'
        return {'frames':previews,'valid_pixels':int(common.sum()),'clean_overlap_pixels':clean_count,'wavelength_compatible_pixels':wavelength_count,'gap_days':float(Time(previews[1]['observation']['observed_at']).mjd-Time(previews[0]['observation']['observed_at']).mjd),'processing':'ICRS TAN, north up/east left; 3 arcmin, 32x32; nearest-neighbor WCS resampling; quality masks; local wavelength centers within half the narrower bandwidth; common percentile/asinh stretch. Not PSF matched; not calibrated difference photometry.', 'wcs':dict(target.to_header())}
    except Exception as exc:
        raise HTTPException(422, f'Comparison rejected: {exc}') from exc


@router.get('/compatible-pair')
def compatible_pair(ra: float = Query(ge=0, lt=360), dec: float = Query(ge=-90, le=90), deep: bool = False):
    attempts, warnings = [], []
    # At most 24 distinct small cutouts, across wide then deep collections.
    for collection_deep in ([True] if deep else [False, True]):
        result = search(ra, dec, collection_deep)
        warnings.extend(result['warnings'])
        groups = {}
        for row in result['observations']:
            if row['band'] and row['mjd'] is not None:
                groups.setdefault(row['band'], []).append(row)
        # Rank already cached, spatially relevant products before spending download budget.
        cached_pairs = []
        for band, rows in groups.items():
            cached = [r for r in rows if (CUTOUTS / (hashlib.sha256(f"{r['source_url']}:{ra}:{dec}:0.05:v1".encode()).hexdigest()+'.fits')).exists()]
            for a,b in combinations(cached,2):
                if a['mjd'] != b['mjd']:
                    cached_pairs.append((a,b))
        cached_pairs.sort(key=lambda pair:abs(pair[1]['mjd']-pair[0]['mjd']),reverse=True)
        accepted=[]
        for a,b in cached_pairs[:24]:
            try:
                accepted.append(comparison(a['id'],b['id'],ra,dec))
            except HTTPException as exc:
                attempts.append({'first':a['obs_id'],'second':b['obs_id'],'band':a['band'],'reason':str(exc.detail)})
        if accepted:
            best=max(accepted,key=lambda r:(r['valid_pixels'],r['gap_days']))
            return {'comparison':best,'attempts':attempts,'warnings':warnings,'ranking':'Best shared-valid-pixel count, then time gap, among up to 24 cached pairs tested.'}
        # Sample four epochs per detector, three detectors per collection.
        # Prefer lower-numbered detectors rather than only the largest group.
        for band in sorted(groups)[:3]:
            pool = groups[band]
            candidates = [pool[i] for i in sorted(set(np.linspace(0,len(pool)-1,min(4,len(pool)),dtype=int)))]
            available=[]
            for candidate in candidates:
                try:
                    cutout(candidate['id'],ra,dec,0.05)
                    available.append(candidate)
                except HTTPException as exc:
                    attempts.append({'first':candidate['obs_id'],'second':'','band':band,'reason':str(exc.detail)})
            pairs=sorted(combinations(available,2),key=lambda pair:abs(pair[1]['mjd']-pair[0]['mjd']),reverse=True)
            for a,b in pairs:
                if a['mjd']==b['mjd']:
                    attempts.append({'first':a['obs_id'],'second':b['obs_id'],'band':band,'reason':'Identical observation times'})
                    continue
                try:
                    outcome=comparison(a['id'],b['id'],ra,dec)
                    return {'comparison':outcome,'attempts':attempts,'warnings':warnings}
                except HTTPException as exc:
                    attempts.append({'first':a['obs_id'],'second':b['obs_id'],'band':band,'reason':str(exc.detail)})
    return {'comparison':None,'attempts':attempts,'warnings':warnings,'message':'No pair passed in this bounded sample (up to 24 small cutouts). Single-image viewing remains available. This does not exclude compatible data elsewhere in the archive.'}
