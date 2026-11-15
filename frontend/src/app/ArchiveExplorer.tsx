'use client';
<<<<<<< HEAD
import { useEffect, useState } from 'react';
type Observation={id:string;obs_id:string;release:string;mjd:number|null;band:string|null;source_url:string;observed_at?:string};
type Preview={preview_url:string;fits_url:string;processing:string;observation:Observation};
const api=(process.env.NEXT_PUBLIC_API_URL||'http://127.0.0.1:8000').replace(/\/$/,'');
export default function ArchiveExplorer(){
 const [ra,setRa]=useState('');const [dec,setDec]=useState('');const [records,setRecords]=useState<Observation[]>([]);const [selected,setSelected]=useState(['','']);const [position,setPosition]=useState('');const [frames,setFrames]=useState<Preview[]>([]);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('Enter ICRS coordinates to search real DR1 and QR3 observations.');const [aligned,setAligned]=useState(false);const [frame,setFrame]=useState(0);const [playing,setPlaying]=useState(false);const [tab,setTab]=useState('sky');const lab=tab==='lab';const [deep,setDeep]=useState(false);const [side,setSide]=useState(true);const [notes,setNotes]=useState('');const [wipe,setWipe]=useState(false);const [split,setSplit]=useState(50);const [rejections,setRejections]=useState<string[]>([]);
 useEffect(()=>{if(!playing)return;const timer=setInterval(()=>setFrame(f=>(f+1)%2),800);return()=>clearInterval(timer);},[playing]);
 async function request(path:string){const r=await fetch(api+path,{signal:AbortSignal.timeout(600000)});const d=await r.json();if(!r.ok)throw Error(typeof d.detail==='string'?d.detail:`Request failed (${r.status})`);return d;}
 function reset(){setWipe(false);setPlaying(false);setAligned(false);setFrames([]);setFrame(0);}
 async function search(){
  reset();setRejections([]);setBusy(true);setRecords([]);setSelected(['','']);setMessage('Searching archive metadata...');
  let summary='';
  try{
   const q=new URLSearchParams({ra,dec,deep:String(deep)}).toString();
   const d=await request('/api/observations?'+q);
   const selection=d.suggested_pair.length===2?d.suggested_pair:[d.observations[0]?.id||'',''];
   setPosition(q);setRecords(d.observations);setSelected(selection);
   summary=`${d.observations.length} observations${d.search_complete===false?' (incomplete archive search)':''}. ${d.warnings.join(' ')}`;
   if(tab==='sky'&&selection[0]){
    setMessage(`${summary} Loading the selected observation's FITS preview...`);
    const preview:Preview=await request(`/api/cutouts/${selection[0]}?${q}&size=0.05`);
    setFrames([preview]);setMessage(`${summary} Loaded ${preview.observation.obs_id}. ${preview.processing}`);
   }else setMessage(`${summary} ${d.observations.length?'Select epochs to inspect or compare.':d.search_complete===false?'The archive search failed for one or more collections; zero returned records does not mean this region is empty. Retry, or uncheck deep-field collections to search wide-field data.':'No observations found in the searched collections. Try another sky position.'}`);
  }catch(e){setMessage(`${summary} ${String(e)} Use Load selected observation to retry if search results are available.`);}
  finally{setBusy(false);}
 }
 async function automatic(targetRa=ra,targetDec=dec){setBusy(true);setPlaying(false);setAligned(false);setMessage('Testing a bounded sample: up to 24 small cutouts across detectors and wide/deep collections; rejected pairs are recorded.');try{const d=await request(`/api/compatible-pair?${new URLSearchParams({ra:targetRa,dec:targetDec,deep:String(deep)})}`);setRejections(d.attempts.map((a:{first:string;second:string;reason:string})=>`${a.first} / ${a.second}: ${a.reason}`));if(d.comparison){setFrames(d.comparison.frames);setAligned(true);setFrame(0);setPosition(new URLSearchParams({ra:targetRa,dec:targetDec}).toString());setRecords(d.comparison.frames.map((f:Preview)=>f.observation));setSelected(d.comparison.frames.map((f:Preview)=>f.observation.id));setSide(true);setWipe(false);setTab('time');setMessage(`${d.comparison.valid_pixels} shared valid pixels. ${d.comparison.processing} ${d.ranking||''} ${d.warnings.join(' ')} Rejected candidates: ${d.attempts.length}.`);}else{setMessage(`${d.message} ${d.warnings.join(' ')} ${d.attempts.map((a:{first:string;second:string;reason:string})=>`${a.first} / ${a.second}: ${a.reason}`).join(' | ')}`);}}catch(e){setMessage(String(e));}finally{setBusy(false);}}
 async function load(compare:boolean){reset();setBusy(true);setMessage(compare?'Aligning sky coordinates and checking local wavelengths...':'Loading small FITS cutouts; transient archive failures are retried.');try{if(compare){const d=await request(`/api/comparison?first=${selected[0]}&second=${selected[1]}&${position}`);setFrames(d.frames);setAligned(true);setMessage(`${d.valid_pixels} shared valid pixels. ${d.processing}`);}else{const result:Preview[]=[];for(const id of selected.slice(0,tab==='sky'?1:2)){result.push(await request(`/api/cutouts/${id}?${position}&size=0.05`));setFrames([...result]);}setMessage(result[0].processing);}}catch(e){setMessage(String(e));}finally{setBusy(false);}}
 function exportNotes(){const blob=new Blob([JSON.stringify({classification:'unverified user candidate notes',position,observations:frames.map(f=>f.observation),notes,aligned,rejections},null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='candidate-notes.json';a.click();URL.revokeObjectURL(u);}
 return <><nav className="mb-7 flex flex-wrap gap-3" aria-label="Workspace">{[['sky','Sky Explorer'],['time','Time Comparison'],['lab','Planet X Lab']].map(([id,label])=><button key={id} className="secondary" aria-pressed={tab===id} onClick={()=>{setPlaying(false);setTab(id);}}>{label}</button>)}</nav><div className="mb-7"><p className="text-xs font-semibold uppercase tracking-widest text-blue-600">{lab?'Candidate investigation':'NASA infrared archive'}</p><h2 className="mt-2 text-3xl font-semibold">{lab?'Investigate a changing sky':'A new view across time'}</h2><p className="muted mt-3">{lab?'Inspect aligned epochs and record hypotheses. This tool does not identify or confirm Planet X.':'Search a sky position, select observations, and inspect real spectral images.'}</p></div><section className="panel mission-intro mb-6 p-5"><figure><img src="/images/spherex.webp" alt="NASA illustration of the SPHEREx spacecraft" width="400" height="600"/><figcaption className="mt-2 text-xs text-slate-500">Artist's concept &mdash; not an observation. Courtesy NASA/JPL-Caltech. <a className="underline" href="https://www.jpl.nasa.gov/images/spherex-poster/">Source</a></figcaption></figure><div><h3 className="text-xl font-semibold">{lab?'Why observe the same sky again?':'An infrared survey of the universe'}</h3><p className="muted mt-3">{lab?'Multiple epochs help distinguish possible motion from stationary stars, noise and instrumental artifacts. Planet Nine is hypothetical; this lab supports investigation, not discovery claims.':'SPHEREx observes the sky in infrared wavelengths to investigate galaxies and the ingredients of planetary systems. The viewer below uses genuine archive FITS data, separate from this mission illustration.'}</p><p className="muted mt-3">{lab?'A moving feature needs repeated measurements and independent checks. A pair of images alone cannot establish a planet.':'Coordinates use the ICRS celestial frame. RA spans 0 to 360 degrees; declination spans -90 to +90 degrees.'}</p></div></section><div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]"><aside className="panel p-5"><h3 className="font-semibold">Find observations</h3><form className="mt-5 space-y-5" onSubmit={e=>{e.preventDefault();void search();}}><label>Right ascension / degrees<input required type="number" min="0" max="359.999999" step="any" value={ra} onChange={e=>setRa(e.target.value)}/></label><label>Declination / degrees<input required type="number" min="-90" max="90" step="any" value={dec} onChange={e=>setDec(e.target.value)}/></label><label className="flex items-center gap-2"><input style={{width:16,margin:0}} type="checkbox" checked={deep} onChange={e=>setDeep(e.target.checked)}/>Search deep-field collections</label><p className="muted">DR1 + QR3<br/>Cutout field: 3 arcminutes</p><button disabled={busy} className="primary w-full">{busy?'Working...':'Search archive'}</button></form>{<button className="secondary mt-4 w-full" disabled={busy||!ra||!dec||Number(ra)<0||Number(ra)>=360||Math.abs(Number(dec))>90} onClick={()=>void automatic()}>Find compatible pair</button>}<button className="secondary mt-3 w-full" disabled={busy} onClick={()=>{setRa('127.69444');setDec('-39.17760');setDeep(false);reset();setRecords([]);setSelected(['','']);setMessage('Example region selected: RA 127.69444, Dec -39.17760. Click Find compatible pair to validate real archive observations.');}}>Use previously verified sky region</button>{records.length>0&&<div className="mt-6 space-y-4 border-t border-blue-100 pt-5">{(tab==='sky'?[0]:[0,1]).map(i=><label key={i}>Epoch {i+1}<select aria-label={`Epoch ${i+1}`} disabled={busy} value={selected[i]} onChange={e=>{reset();setSelected(selected.map((s,j)=>j===i?e.target.value:s));}}><option value="">Select observation</option>{records.map(r=><option value={r.id} key={r.id}>{r.release.toUpperCase()} | {r.observed_at||`MJD ${r.mjd}`} UTC | {r.band} | {r.obs_id}</option>)}</select></label>)}<button className="secondary w-full" disabled={busy||!selected[0]||(tab!=='sky'&&(!selected[1]||selected[0]===selected[1]))} onClick={()=>void load(false)}>{tab==='sky'?'Load selected observation':'Inspect native cutouts'}</button><button hidden={tab==='sky'} className="primary w-full" disabled={busy||selected.some(s=>!s)||selected[0]===selected[1]} onClick={()=>void load(true)}>Align &amp; compare epochs</button></div>}</aside><div className="min-w-0 space-y-5"><section className="panel overflow-hidden"><div className="flex justify-between border-b border-blue-100 p-5"><h3 className="font-semibold">Sky viewer</h3><span className="text-xs text-slate-500">{aligned?'WCS aligned':'Native preview'}</span></div><div className="p-5">{aligned&&wipe?<div className="mx-auto max-w-lg"><div className="relative aspect-square"><img className="sky-image absolute inset-0" src={api+frames[0].preview_url} alt={`Before: ${frames[0].observation.obs_id}`}/><img className="sky-image absolute inset-0" style={{clipPath:`inset(0 ${100-split}% 0 0)`}} src={api+frames[1].preview_url} alt={`After: ${frames[1].observation.obs_id}`}/></div><label className="mt-3">Before / after reveal<input type="range" className="w-full" min="0" max="100" value={split} onChange={e=>setSplit(Number(e.target.value))}/></label></div>:frames.length===0?<div className="flex min-h-80 items-center justify-center rounded-lg bg-blue-50 p-10 text-center"><div><h4 className="text-xl">{busy?'Loading archive data...':'Your observations appear here'}</h4><p className="muted mt-3">Sky Explorer loads one selected preview after search. To view another record, select it and click Load selected observation. No simulated imagery is used.</p></div></div>:<div className={`grid gap-4 ${frames.length===1||aligned&&!side?'':'sm:grid-cols-2'}`}>{(aligned&&!side?[frames[frame]]:frames).map(p=><figure key={p.observation.id} className={aligned&&!side?'mx-auto w-full max-w-md':''}><img className="sky-image rounded-lg" src={api+p.preview_url} alt={`SPHEREx ${p.observation.obs_id}`} onError={()=>{setPlaying(false);setMessage('Image loading failed. Retry loading the selected observations.');}}/><figcaption className="muted mt-3 break-words">{p.observation.release.toUpperCase()} / {p.observation.observed_at||`MJD ${p.observation.mjd}`} UTC<br/>{p.observation.band} / {p.observation.obs_id}<br/><a className="underline" href={api+p.fits_url}>FITS cutout</a> &middot; <a className="underline" href={p.observation.source_url}>IRSA source</a></figcaption></figure>)}</div>}</div><div className="border-t border-blue-100 p-5"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-semibold">Epoch timeline</h4><button className="secondary" disabled={!aligned||busy} onClick={()=>{setPlaying(false);setWipe(true);}}>Before / after</button>{aligned&&<button className="secondary" onClick={()=>{setWipe(false);setPlaying(false);setSide(true);}}>Side by side</button>}<button className="secondary" disabled={!aligned||busy} onClick={()=>{setWipe(false);setSide(false);setPlaying(!playing);}}>{playing?'Pause':'Blink epochs'}</button></div><div className="my-3 flex flex-wrap gap-2"><button className="secondary" disabled={!aligned||busy} onClick={()=>{setWipe(false);setPlaying(false);setSide(false);setFrame(0);}}>Previous</button><button className="secondary" disabled={!aligned||busy} onClick={()=>{setWipe(false);setPlaying(false);setSide(false);setFrame(1);}}>Next</button></div>{aligned&&<p className="muted mb-3">Two real epochs separated by {((Date.parse(frames[1].observation.observed_at+'Z')-Date.parse(frames[0].observation.observed_at+'Z'))/86400000).toFixed(3)} days. Playback alternates these images only; no intermediate frames.</p>}<input className="w-full" type="range" aria-label="Selected epoch" min="0" max="1" value={frame} disabled={!aligned} onChange={e=>{setPlaying(false);setWipe(false);setSide(false);setFrame(Number(e.target.value));}}/><div className="flex justify-between text-xs text-slate-500">{aligned?frames.map(f=><span key={f.observation.id}>{f.observation.observed_at||`MJD ${f.observation.mjd}`} UTC / {f.observation.obs_id}</span>):<span>Load a compatible aligned pair to enable playback.</span>}</div></div></section><p role="status" className="panel p-4 text-sm leading-6">{message}</p><details className="panel p-4"><summary>Pair validation diagnostics ({rejections.length} rejected)</summary><ul className="mt-3 space-y-2 text-xs break-words">{rejections.map((reason,i)=><li key={i}>{reason}</li>)}</ul></details>{lab&&<section className="panel p-5"><h3 className="font-semibold">Candidate notebook</h3><p className="muted mt-2">Validated difference images are unavailable until PSF matching and uncertainty propagation are implemented.</p><p className="muted mt-2">Check persistent sources, artifacts, wavelength coverage and multiple epochs before interpreting apparent motion. Alignment is not PSF matching or discovery confirmation.</p><label className="mt-4">Investigation notes<textarea rows={4} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Describe the feature and alternative explanations. Notes are temporary until exported."/></label><button className="secondary mt-4" disabled={!frames.length||!notes.trim()} onClick={exportNotes}>Export notes with observation provenance</button></section>}</div></div></>;
=======

import { useEffect, useState } from 'react';

type Observation = {
  id: string;
  obs_id: string;
  release: string;
  mjd: number | null;
  band: string | null;
  source_url: string;
  observed_at?: string;
};

type Preview = {
  preview_url: string;
  fits_url: string;
  processing: string;
  observation: Observation;
};

const api = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

function getGapDays(start?: string, end?: string): string {
  if (!start || !end) return '0.000';
  const sStr = start.endsWith('Z') || start.includes('+') ? start : start + 'Z';
  const eStr = end.endsWith('Z') || end.includes('+') ? end : end + 'Z';
  const s = Date.parse(sStr);
  const e = Date.parse(eStr);
  if (isNaN(s) || isNaN(e)) return '0.000';
  return ((e - s) / 86400000).toFixed(3);
}

export default function ArchiveExplorer() {
  const [ra, setRa] = useState('');
  const [dec, setDec] = useState('');
  const [targetName, setTargetName] = useState('');
  const [resolving, setResolving] = useState(false);

  const [records, setRecords] = useState<Observation[]>([]);
  const [selected, setSelected] = useState<[string, string]>(['', '']);
  const [position, setPosition] = useState('');
  const [frames, setFrames] = useState<Preview[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    'Enter ICRS coordinates, choose a preset, or search by astronomical target name to explore real SPHEREx observations.'
  );

  const [aligned, setAligned] = useState(false);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [blinkSpeed, setBlinkSpeed] = useState<number>(800);
  const [tab, setTab] = useState<'sky' | 'time' | 'lab'>('sky');
  const lab = tab === 'lab';

  const [deep, setDeep] = useState(false);
  const [side, setSide] = useState(true);
  const [notes, setNotes] = useState('');
  const [wipe, setWipe] = useState(false);
  const [split, setSplit] = useState(50);
  const [rejections, setRejections] = useState<string[]>([]);

  // Astronomical Visual Controls
  const [colormap, setColormap] = useState<'gray' | 'heat' | 'invert'>('gray');
  const [zoom, setZoom] = useState<number>(1);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [showAdjustments, setShowAdjustments] = useState(false);

  // Planet X Lab Scientific Checklist
  const [candidateType, setCandidateType] = useState('moving_point');
  const [checklist, setChecklist] = useState({
    displacement: false,
    identicalBand: true,
    backgroundCheck: false,
    maskCheck: false,
  });

  // Automatic blink comparator timer with adjustable speed
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setFrame((f) => (f + 1) % 2), blinkSpeed);
    return () => clearInterval(timer);
  }, [playing, blinkSpeed]);

  async function request(path: string) {
    const r = await fetch(api + path, { signal: AbortSignal.timeout(600000) });
    const d = await r.json();
    if (!r.ok) throw new Error(typeof d.detail === 'string' ? d.detail : `Request failed (${r.status})`);
    return d;
  }

  function reset() {
    setWipe(false);
    setPlaying(false);
    setAligned(false);
    setFrames([]);
    setFrame(0);
  }

  // Quick Preset Selector
  function applyPreset(name: string) {
    reset();
    setRecords([]);
    setSelected(['', '']);
    if (name === 'verified_d5') {
      setRa('127.69444');
      setDec('-39.17760');
      setDeep(false);
      setTargetName('Verified Pair (SPHEREx-D5)');
      setMessage('Preset loaded: Verified Multi-Epoch Region (RA 127.69444, Dec -39.17760). Click Find compatible pair.');
    } else if (name === 'm31') {
      setRa('10.68471');
      setDec('41.26875');
      setDeep(false);
      setTargetName('Andromeda Galaxy (M31)');
      setMessage('Preset loaded: Andromeda Galaxy M31 (RA 10.68471, Dec 41.26875).');
    } else if (name === 'betelgeuse') {
      setRa('88.79294');
      setDec('7.40706');
      setDeep(false);
      setTargetName('Betelgeuse (Alpha Orionis)');
      setMessage('Preset loaded: Betelgeuse in Orion (RA 88.79294, Dec 7.40706).');
    } else if (name === 'nep_deep') {
      setRa('270.00000');
      setDec('66.56000');
      setDeep(true);
      setTargetName('North Ecliptic Pole (Deep Field)');
      setMessage('Preset loaded: North Ecliptic Pole Deep Survey (RA 270.0, Dec 66.56, Deep Enabled).');
    }
  }

  // Resolve target by astronomical name (SIMBAD / CDS Sesame)
  async function resolveTarget() {
    if (!targetName.trim()) return;
    setResolving(true);
    setMessage(`Resolving "${targetName.trim()}" in astronomical databases...`);
    try {
      const d = await request(`/api/resolve?name=${encodeURIComponent(targetName.trim())}`);
      setRa(String(d.ra));
      setDec(String(d.dec));
      setMessage(`Resolved "${d.name}": RA ${d.ra}°, Dec ${d.dec}°. Ready to search.`);
    } catch (e) {
      setMessage(`Resolution failed: ${String(e)}`);
    } finally {
      setResolving(false);
    }
  }

  async function search() {
    reset();
    setRejections([]);
    setBusy(true);
    setRecords([]);
    setSelected(['', '']);
    setMessage('Searching archive metadata...');
    let summary = '';
    try {
      const q = new URLSearchParams({ ra, dec, deep: String(deep) }).toString();
      const d = await request('/api/observations?' + q);
      const selection: [string, string] =
        d.suggested_pair.length === 2 ? d.suggested_pair : [d.observations[0]?.id || '', ''];
      setPosition(q);
      setRecords(d.observations);
      setSelected(selection);
      summary = `${d.observations.length} observations${d.search_complete === false ? ' (incomplete archive search)' : ''}. ${d.warnings.join(' ')}`;

      if (tab === 'sky' && selection[0]) {
        setMessage(`${summary} Loading the selected observation's FITS preview...`);
        const preview: Preview = await request(`/api/cutouts/${selection[0]}?${q}&size=0.05`);
        setFrames([preview]);
        setMessage(`${summary} Loaded ${preview.observation.obs_id}. ${preview.processing}`);
      } else {
        setMessage(
          `${summary} ${
            d.observations.length
              ? 'Select epochs to inspect or compare.'
              : d.search_complete === false
              ? 'The archive search failed for one or more collections; zero returned records does not mean this region is empty. Retry, or uncheck deep-field collections to search wide-field data.'
              : 'No observations found in the searched collections. Try another sky position.'
          }`
        );
      }
    } catch (e) {
      setMessage(`${summary} ${String(e)} Use Load selected observation to retry if search results are available.`);
    } finally {
      setBusy(false);
    }
  }

  async function automatic(targetRa = ra, targetDec = dec) {
    setBusy(true);
    setPlaying(false);
    setAligned(false);
    setMessage('Testing a bounded sample: up to 24 small cutouts across detectors and wide/deep collections; rejected pairs are recorded.');
    try {
      const d = await request(`/api/compatible-pair?${new URLSearchParams({ ra: targetRa, dec: targetDec, deep: String(deep) })}`);
      setRejections(d.attempts.map((a: { first: string; second: string; reason: string }) => `${a.first} / ${a.second}: ${a.reason}`));
      if (d.comparison) {
        setFrames(d.comparison.frames);
        setAligned(true);
        setFrame(0);
        setPosition(new URLSearchParams({ ra: targetRa, dec: targetDec }).toString());
        setRecords(d.comparison.frames.map((f: Preview) => f.observation));
        setSelected([d.comparison.frames[0].observation.id, d.comparison.frames[1].observation.id]);
        setSide(true);
        setWipe(false);
        setTab('time');
        setMessage(
          `${d.comparison.valid_pixels} shared valid pixels. ${d.comparison.processing} ${d.ranking || ''} ${d.warnings.join(' ')} Rejected candidates: ${d.attempts.length}.`
        );
      } else {
        setMessage(
          `${d.message} ${d.warnings.join(' ')} ${d.attempts
            .map((a: { first: string; second: string; reason: string }) => `${a.first} / ${a.second}: ${a.reason}`)
            .join(' | ')}`
        );
      }
    } catch (e) {
      setMessage(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function load(compare: boolean) {
    reset();
    setBusy(true);
    setMessage(compare ? 'Aligning sky coordinates and checking local wavelengths...' : 'Loading small FITS cutouts; transient archive failures are retried.');
    try {
      if (compare) {
        const d = await request(`/api/comparison?first=${selected[0]}&second=${selected[1]}&${position}`);
        setFrames(d.frames);
        setAligned(true);
        setMessage(`${d.valid_pixels} shared valid pixels. ${d.processing}`);
      } else {
        const result: Preview[] = [];
        for (const id of selected.slice(0, tab === 'sky' ? 1 : 2)) {
          result.push(await request(`/api/cutouts/${id}?${position}&size=0.05`));
          setFrames([...result]);
        }
        setMessage(result[0].processing);
      }
    } catch (e) {
      setMessage(String(e));
    } finally {
      setBusy(false);
    }
  }

  function exportNotes() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            project: 'SPHEREx Sky Explorer — Planet X Lab',
            classification: 'unverified user candidate notes',
            candidate_type: candidateType,
            verification_checklist: checklist,
            target: {
              name: targetName || 'Direct coordinates',
              ra,
              dec,
              query_position: position,
            },
            observations: frames.map((f) => ({
              id: f.observation.id,
              obs_id: f.observation.obs_id,
              release: f.observation.release,
              band: f.observation.band,
              observed_at: f.observation.observed_at,
              source_url: f.observation.source_url,
              preview_url: f.preview_url,
              fits_url: f.fits_url,
            })),
            notes,
            aligned,
            rejections,
            exported_at: new Date().toISOString(),
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = `candidate-${candidateType}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(u);
  }

  // Combined astronomical filter string
  const getImageFilter = () => {
    let base = 'none';
    if (colormap === 'heat') base = 'contrast(1.3) sepia(1) saturate(5) hue-rotate(320deg)';
    if (colormap === 'invert') base = 'invert(1)';
    const adjustment = `brightness(${brightness}%) contrast(${contrast}%)`;
    return base === 'none' ? adjustment : `${base} ${adjustment}`;
  };

  return (
    <>
      {/* Workspace Navigation */}
      <nav className="mb-7 flex flex-wrap gap-3" aria-label="Workspace">
        {[
          ['sky', 'Sky Explorer'],
          ['time', 'Time Comparison'],
          ['lab', 'Planet X Lab'],
        ].map(([id, label]) => (
          <button
            key={id}
            className="secondary"
            aria-pressed={tab === id}
            onClick={() => {
              setPlaying(false);
              setTab(id as 'sky' | 'time' | 'lab');
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Page Heading */}
      <div className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          {lab ? 'Candidate investigation' : 'NASA infrared archive'}
        </p>
        <h2 className="mt-2 text-3xl font-semibold">
          {lab ? 'Investigate a changing sky' : 'A new view across time'}
        </h2>
        <p className="muted mt-3">
          {lab
            ? 'Inspect aligned epochs and record hypotheses. This tool does not identify or confirm Planet X.'
            : 'Search a sky position, select observations, and inspect real spectral images.'}
        </p>
      </div>

      {/* Mission Introduction Banner */}
      <section className="panel mission-intro mb-6 p-5">
        <figure>
          <img
            src="/images/spherex.webp"
            alt="NASA illustration of the SPHEREx spacecraft"
            width="400"
            height="600"
          />
          <figcaption className="mt-2 text-xs text-slate-500">
            Artist&apos;s concept &mdash; not an observation. Courtesy NASA/JPL-Caltech.{' '}
            <a className="underline" href="https://www.jpl.nasa.gov/images/spherex-poster/">
              Source
            </a>
          </figcaption>
        </figure>
        <div>
          <h3 className="text-xl font-semibold">
            {lab ? 'Why observe the same sky again?' : 'An infrared survey of the universe'}
          </h3>
          <p className="muted mt-3">
            {lab
              ? 'Multiple epochs help distinguish possible motion from stationary stars, noise and instrumental artifacts. Planet Nine is hypothetical; this lab supports investigation, not discovery claims.'
              : 'SPHEREx observes the sky in infrared wavelengths to investigate galaxies and the ingredients of planetary systems. The viewer below uses genuine archive FITS data, separate from this mission illustration.'}
          </p>
          <p className="muted mt-3">
            {lab
              ? 'A moving feature needs repeated measurements and independent checks. A pair of images alone cannot establish a planet.'
              : 'Coordinates use the ICRS celestial frame. RA spans 0 to 360 degrees; declination spans -90 to +90 degrees.'}
          </p>
        </div>
      </section>

      {/* SPHEREx 6-Detector Spectral Band Guide */}
      <details className="panel p-4 mb-6 cursor-pointer">
        <summary className="font-semibold text-sm text-slate-800">
          SPHEREx 6-Detector Spectral Band Guide (0.75 – 5.0 μm)
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs text-slate-600">
          <div className="rounded-lg bg-blue-50/60 p-2.5 border border-blue-100">
            <span className="font-semibold text-blue-800">D1 &amp; D2 (0.75 – 1.6 μm)</span>
            <p className="mt-1">Near-infrared stellar light, bright reference stars, and distant cosmic expansion signatures.</p>
          </div>
          <div className="rounded-lg bg-indigo-50/60 p-2.5 border border-indigo-100">
            <span className="font-semibold text-indigo-800">D3 &amp; D4 (1.6 – 3.8 μm)</span>
            <p className="mt-1">Biogenic ingredients: interstellar water ice (H₂O) and carbon dioxide (CO₂) absorption bands.</p>
          </div>
          <div className="rounded-lg bg-amber-50/60 p-2.5 border border-amber-100">
            <span className="font-semibold text-amber-800">D5 &amp; D6 (3.8 – 5.0 μm)</span>
            <p className="mt-1">Cold thermal emission: ultra-cool brown dwarfs and hypothetical outer solar system bodies (Planet Nine).</p>
          </div>
        </div>
      </details>

      {/* Main Workspace Grid */}
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Left Sidebar Controls */}
        <aside className="panel p-5">
          <h3 className="font-semibold">Find observations</h3>

          {/* Quick Target Presets Dropdown */}
          <div className="mt-4 border-b border-blue-100 pb-4">
            <label>
              Quick target presets
              <select
                className="mt-1 text-xs"
                onChange={(e) => {
                  if (e.target.value) applyPreset(e.target.value);
                }}
                defaultValue=""
              >
                <option value="" disabled>Choose a preset celestial target...</option>
                <option value="verified_d5">Verified Multi-Epoch Field (SPHEREx-D5, 6.18d gap)</option>
                <option value="m31">Andromeda Galaxy (M31)</option>
                <option value="betelgeuse">Betelgeuse in Orion (Alpha Orionis)</option>
                <option value="nep_deep">North Ecliptic Pole (Deep Survey)</option>
              </select>
            </label>
          </div>

          {/* Astronomical Name Resolver */}
          <div className="mt-4 border-b border-blue-100 pb-4">
            <label>
              Search by object name
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. M31, Betelgeuse, Jupiter"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void resolveTarget();
                    }
                  }}
                />
                <button
                  type="button"
                  className="secondary mt-2 px-3 py-2 text-xs whitespace-nowrap"
                  disabled={resolving || !targetName.trim()}
                  onClick={() => void resolveTarget()}
                >
                  {resolving ? '...' : 'Resolve'}
                </button>
              </div>
            </label>
            <p className="muted text-xs mt-1">Queries SIMBAD / CDS Sesame astronomical database</p>
          </div>

          {/* Coordinate Search Form */}
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void search();
            }}
          >
            <label>
              Right ascension / degrees
              <input
                required
                type="number"
                min="0"
                max="359.999999"
                step="any"
                value={ra}
                onChange={(e) => setRa(e.target.value)}
              />
            </label>
            <label>
              Declination / degrees
              <input
                required
                type="number"
                min="-90"
                max="90"
                step="any"
                value={dec}
                onChange={(e) => setDec(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                style={{ width: 16, margin: 0 }}
                type="checkbox"
                checked={deep}
                onChange={(e) => setDeep(e.target.checked)}
              />
              Search deep-field collections
            </label>
            <p className="muted">
              DR1 + QR3
              <br />
              Cutout field: 3 arcminutes
            </p>
            <button disabled={busy} className="primary w-full">
              {busy ? 'Working...' : 'Search archive'}
            </button>
          </form>

          {/* Automatic Compatible Pair Discovery */}
          <button
            className="secondary mt-4 w-full"
            disabled={busy || !ra || !dec || Number(ra) < 0 || Number(ra) >= 360 || Math.abs(Number(dec)) > 90}
            onClick={() => void automatic()}
          >
            Find compatible pair
          </button>

          {/* Preset Verified Region */}
          <button
            className="secondary mt-3 w-full"
            disabled={busy}
            onClick={() => {
              applyPreset('verified_d5');
            }}
          >
            Use previously verified sky region
          </button>

          {/* Epoch Selector Dropdowns */}
          {records.length > 0 && (
            <div className="mt-6 space-y-4 border-t border-blue-100 pt-5">
              {(tab === 'sky' ? [0] : [0, 1]).map((i) => (
                <label key={i}>
                  Epoch {i + 1}
                  <select
                    aria-label={`Epoch ${i + 1}`}
                    disabled={busy}
                    value={selected[i]}
                    onChange={(e) => {
                      reset();
                      const next = [...selected] as [string, string];
                      next[i] = e.target.value;
                      setSelected(next);
                    }}
                  >
                    <option value="">Select observation</option>
                    {records.map((r) => (
                      <option value={r.id} key={r.id}>
                        {r.release.toUpperCase()} | {r.observed_at || `MJD ${r.mjd}`} UTC | {r.band} | {r.obs_id}
                      </option>
                    ))}
                  </select>
                </label>
              ))}

              <button
                className="secondary w-full"
                disabled={busy || !selected[0] || (tab !== 'sky' && (!selected[1] || selected[0] === selected[1]))}
                onClick={() => void load(false)}
              >
                {tab === 'sky' ? 'Load selected observation' : 'Inspect native cutouts'}
              </button>

              <button
                hidden={tab === 'sky'}
                className="primary w-full"
                disabled={busy || selected.some((s) => !s) || selected[0] === selected[1]}
                onClick={() => void load(true)}
              >
                Align &amp; compare epochs
              </button>
            </div>
          )}
        </aside>

        {/* Right Main Viewer Panel */}
        <div className="min-w-0 space-y-5">
          <section className="panel overflow-hidden">
            {/* Sky Viewer Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 p-5">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">Sky viewer</h3>
                <span className="text-xs text-slate-500">{aligned ? 'WCS aligned' : 'Native preview'}</span>
              </div>

              {/* Viewer Tools Toolbar */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {/* Zoom Selector */}
                <div className="flex items-center gap-1">
                  <span className="muted font-semibold">Zoom:</span>
                  {[1, 2, 3].map((z) => (
                    <button
                      key={z}
                      type="button"
                      className={`px-2 py-1 rounded text-xs ${zoom === z ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                      onClick={() => setZoom(z)}
                    >
                      {z}x
                    </button>
                  ))}
                </div>

                {/* Colormap Controls */}
                <div className="flex items-center gap-1">
                  <span className="muted font-semibold">Palette:</span>
                  <button
                    type="button"
                    className={`px-2 py-1 rounded text-xs ${colormap === 'gray' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    onClick={() => setColormap('gray')}
                  >
                    Grayscale
                  </button>
                  <button
                    type="button"
                    className={`px-2 py-1 rounded text-xs ${colormap === 'heat' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    onClick={() => setColormap('heat')}
                  >
                    Heatmap
                  </button>
                  <button
                    type="button"
                    className={`px-2 py-1 rounded text-xs ${colormap === 'invert' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    onClick={() => setColormap('invert')}
                  >
                    Inverted
                  </button>
                </div>

                {/* Adjustments Toggle */}
                <button
                  type="button"
                  className="secondary text-xs px-2 py-1"
                  onClick={() => setShowAdjustments(!showAdjustments)}
                >
                  {showAdjustments ? 'Hide Sliders' : 'Contrast / Brightness'}
                </button>
              </div>
            </div>

            {/* Optional Contrast & Brightness Sliders Panel */}
            {showAdjustments && (
              <div className="bg-slate-50 border-b border-blue-100 px-5 py-3 grid gap-4 sm:grid-cols-2 text-xs">
                <label>
                  Brightness ({brightness}%)
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                  />
                </label>
                <label>
                  Contrast ({contrast}%)
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                  />
                </label>
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-blue-600 underline"
                    onClick={() => {
                      setBrightness(100);
                      setContrast(100);
                    }}
                  >
                    Reset adjustments to 100%
                  </button>
                </div>
              </div>
            )}

            {/* Images Canvas Area */}
            <div className="p-5 overflow-auto">
              {aligned && wipe ? (
                <div className="mx-auto max-w-lg">
                  <div
                    className="relative aspect-square overflow-hidden rounded-lg"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}
                  >
                    <img
                      className="sky-image absolute inset-0"
                      style={{ filter: getImageFilter() }}
                      src={api + frames[0].preview_url}
                      alt={`Before: ${frames[0].observation.obs_id}`}
                    />
                    <img
                      className="sky-image absolute inset-0"
                      style={{
                        clipPath: `inset(0 ${100 - split}% 0 0)`,
                        filter: getImageFilter(),
                      }}
                      src={api + frames[1].preview_url}
                      alt={`After: ${frames[1].observation.obs_id}`}
                    />
                  </div>
                  <label className="mt-3">
                    Before / after reveal
                    <input
                      type="range"
                      className="w-full"
                      min="0"
                      max="100"
                      value={split}
                      onChange={(e) => setSplit(Number(e.target.value))}
                    />
                  </label>
                </div>
              ) : frames.length === 0 ? (
                <div className="flex min-h-80 items-center justify-center rounded-lg bg-blue-50 p-10 text-center">
                  <div>
                    <h4 className="text-xl">{busy ? 'Loading archive data...' : 'Your observations appear here'}</h4>
                    <p className="muted mt-3">
                      Sky Explorer loads one selected preview after search. To view another record, select it and click Load selected observation. No simulated imagery is used.
                    </p>
                  </div>
                </div>
              ) : (
                <div className={`grid gap-4 ${frames.length === 1 || (aligned && !side) ? '' : 'sm:grid-cols-2'}`}>
                  {(aligned && !side ? [frames[frame]] : frames).map((p) => (
                    <figure key={p.observation.id} className={aligned && !side ? 'mx-auto w-full max-w-md' : ''}>
                      <div className="overflow-hidden rounded-lg">
                        <img
                          className="sky-image rounded-lg"
                          style={{
                            filter: getImageFilter(),
                            transform: `scale(${zoom})`,
                            transformOrigin: 'center center',
                            transition: 'transform 0.2s',
                          }}
                          src={api + p.preview_url}
                          alt={`SPHEREx ${p.observation.obs_id}`}
                          onError={() => {
                            setPlaying(false);
                            setMessage('Image loading failed. Retry loading the selected observations.');
                          }}
                        />
                      </div>
                      <figcaption className="muted mt-3 break-words">
                        {p.observation.release.toUpperCase()} / {p.observation.observed_at || `MJD ${p.observation.mjd}`} UTC
                        <br />
                        {p.observation.band} / {p.observation.obs_id}
                        <br />
                        <a className="underline" href={api + p.fits_url}>
                          FITS cutout
                        </a>{' '}
                        &middot;{' '}
                        <a className="underline" href={p.observation.source_url}>
                          IRSA source
                        </a>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>

            {/* Epoch Timeline & Comparator Controls */}
            <div className="border-t border-blue-100 p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold">Epoch timeline</h4>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    className="secondary"
                    disabled={!aligned || busy}
                    onClick={() => {
                      setPlaying(false);
                      setWipe(true);
                    }}
                  >
                    Before / after
                  </button>
                  {aligned && (
                    <button
                      className="secondary"
                      onClick={() => {
                        setWipe(false);
                        setPlaying(false);
                        setSide(true);
                      }}
                    >
                      Side by side
                    </button>
                  )}
                  <button
                    className="secondary"
                    disabled={!aligned || busy}
                    onClick={() => {
                      setWipe(false);
                      setSide(false);
                      setPlaying(!playing);
                    }}
                  >
                    {playing ? 'Pause' : 'Blink epochs'}
                  </button>

                  {/* Blink Speed Selector */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className="muted">Speed:</span>
                    {[
                      [1200, 'Slow'],
                      [800, '1x'],
                      [400, 'Fast'],
                    ].map(([spd, lbl]) => (
                      <button
                        key={spd}
                        type="button"
                        className={`px-1.5 py-0.5 rounded text-xs ${blinkSpeed === spd ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                        onClick={() => setBlinkSpeed(Number(spd))}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="my-3 flex flex-wrap gap-2">
                <button
                  className="secondary"
                  disabled={!aligned || busy}
                  onClick={() => {
                    setWipe(false);
                    setPlaying(false);
                    setSide(false);
                    setFrame(0);
                  }}
                >
                  Previous
                </button>
                <button
                  className="secondary"
                  disabled={!aligned || busy}
                  onClick={() => {
                    setWipe(false);
                    setPlaying(false);
                    setSide(false);
                    setFrame(1);
                  }}
                >
                  Next
                </button>
              </div>

              {aligned && frames.length >= 2 && (
                <p className="muted mb-3">
                  Two real epochs separated by {getGapDays(frames[0].observation.observed_at, frames[1].observation.observed_at)} days. Playback alternates these images only; no intermediate frames.
                </p>
              )}

              <input
                className="w-full"
                type="range"
                aria-label="Selected epoch"
                min="0"
                max="1"
                value={frame}
                disabled={!aligned}
                onChange={(e) => {
                  setPlaying(false);
                  setWipe(false);
                  setSide(false);
                  setFrame(Number(e.target.value));
                }}
              />

              <div className="flex justify-between text-xs text-slate-500">
                {aligned ? (
                  frames.map((f) => (
                    <span key={f.observation.id}>
                      {f.observation.observed_at || `MJD ${f.observation.mjd}`} UTC / {f.observation.obs_id}
                    </span>
                  ))
                ) : (
                  <span>Load a compatible aligned pair to enable playback.</span>
                )}
              </div>
            </div>
          </section>

          {/* Status Bar */}
          <p role="status" className="panel p-4 text-sm leading-6">
            {message}
          </p>

          {/* Diagnostics Accordion */}
          <details className="panel p-4">
            <summary>Pair validation diagnostics ({rejections.length} rejected)</summary>
            <ul className="mt-3 space-y-2 text-xs break-words">
              {rejections.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </details>

          {/* Planet X Lab Notebook */}
          {lab && (
            <section className="panel p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Planet X &amp; Transient Candidate Notebook</h3>
                <p className="muted mt-1">
                  Systematic verification worksheet for moving objects, variable stars, and outer solar system candidates.
                </p>
              </div>

              {/* Observation Provenance Summary */}
              <div className="rounded-lg bg-blue-50/70 p-3 text-xs text-slate-700">
                <span className="font-semibold">Target Coordinates:</span>{' '}
                {ra && dec ? `RA ${Number(ra).toFixed(4)}°, Dec ${Number(dec).toFixed(4)}°` : 'None selected'}{' '}
                {targetName ? `(${targetName})` : ''} &middot;{' '}
                <span className="font-semibold">Loaded Epochs:</span> {frames.length}{' '}
                {aligned ? '(WCS TAN Aligned)' : '(Unregistered)'}
              </div>

              {/* Candidate Classification */}
              <label>
                Candidate classification
                <select
                  className="mt-1"
                  value={candidateType}
                  onChange={(e) => setCandidateType(e.target.value)}
                >
                  <option value="moving_point">Moving Point Source (Planet X / Asteroid Candidate)</option>
                  <option value="variable_star">Variable Star / Flux Fluctuation</option>
                  <option value="transient_nova">Transient / Supernova Candidate</option>
                  <option value="instrument_artifact">Suspected Artifact (Diffraction Spike / Cosmic Ray / Glint)</option>
                </select>
              </label>

              {/* Scientific Verification Checklist */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Multi-Epoch Verification Checklist
                </p>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2 font-normal cursor-pointer">
                    <input
                      type="checkbox"
                      style={{ width: 16, margin: 0 }}
                      checked={checklist.displacement}
                      onChange={(e) => setChecklist({ ...checklist, displacement: e.target.checked })}
                    />
                    Apparent celestial displacement observed between Epoch 1 &amp; Epoch 2
                  </label>
                  <label className="flex items-center gap-2 font-normal cursor-pointer">
                    <input
                      type="checkbox"
                      style={{ width: 16, margin: 0 }}
                      checked={checklist.identicalBand}
                      onChange={(e) => setChecklist({ ...checklist, identicalBand: e.target.checked })}
                    />
                    Confirmed on identical detector bandpass &amp; overlapping spectral range
                  </label>
                  <label className="flex items-center gap-2 font-normal cursor-pointer">
                    <input
                      type="checkbox"
                      style={{ width: 16, margin: 0 }}
                      checked={checklist.backgroundCheck}
                      onChange={(e) => setChecklist({ ...checklist, backgroundCheck: e.target.checked })}
                    />
                    Stationary background reference stars remain fixed across frames
                  </label>
                  <label className="flex items-center gap-2 font-normal cursor-pointer">
                    <input
                      type="checkbox"
                      style={{ width: 16, margin: 0 }}
                      checked={checklist.maskCheck}
                      onChange={(e) => setChecklist({ ...checklist, maskCheck: e.target.checked })}
                    />
                    Quality mask verified (ruled out saturated pixels, glints, and MSKN flags)
                  </label>
                </div>
              </div>

              {/* Notes Input */}
              <label>
                Investigation notes &amp; hypothesis
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the candidate feature, estimated angular motion, and alternative explanations. Notes remain temporary until exported."
                />
              </label>

              <button
                className="secondary w-full sm:w-auto"
                disabled={!frames.length || !notes.trim()}
                onClick={exportNotes}
              >
                Export candidate report with observation provenance (.json)
              </button>
            </section>
          )}
        </div>
      </div>
    </>
  );
>>>>>>> origin/main
}
