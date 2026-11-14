'use client';

import { useEffect, useState } from 'react';
import ArchiveExplorer from './ArchiveExplorer';

export default function Home() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState('');
  const [ra, setRa] = useState('');
  const [dec, setDec] = useState('');
  const [field, setField] = useState('10');
  const [notice, setNotice] = useState('');
  async function checkBackend() {
    setStatus('checking'); setError('');
    try {
      const response = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')}/api/health`, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.status !== 'ok' || data.project !== 'SPHEREx Sky Explorer') throw new Error('Unexpected health response');
      setStatus('connected');
    } catch (e) { setStatus('error'); setError(`${e instanceof Error ? e.message : 'Connection failed'}. Start the FastAPI server and check the API URL and allowed frontend origin.`); }
  }
  useEffect(() => { void checkBackend(); }, []);
  return <div className="min-h-screen">
    <a href="#workspace" className="skip-link">Skip to workspace</a>
    <header className="border-b border-slate-800 bg-[#101a29]">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <div className="flex items-center gap-3"><div aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-700/60 text-xl text-cyan-300">&#8982;</div><div><h1 className="text-lg font-semibold tracking-tight">SPHEREx <span className="font-normal text-slate-300">Sky Explorer</span></h1><p className="mt-1 text-xs text-slate-400">Explore the Universe Across Time and Wavelengths</p></div></div>
        <div className="flex items-center gap-4 text-xs"><span className="hidden text-slate-400 sm:inline">TEAM MADEO PUBLICO</span><span role="status" className="rounded-full border border-slate-700 px-3 py-2"><span aria-hidden="true" className={`mr-2 inline-block h-2 w-2 rounded-full ${status === 'connected' ? 'bg-emerald-400' : status === 'error' ? 'bg-amber-400' : 'bg-slate-400'}`} />{status === 'connected' ? 'Backend connected' : status === 'checking' ? 'Checking backend' : 'Backend offline'}</span></div>
      </div>
    </header>
    <main id="workspace" className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8"><ArchiveExplorer />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">OBSERVATION WORKSPACE</p><h2 className="mt-2 text-2xl font-semibold">Explore a patch of sky</h2><p className="mt-2 text-sm text-slate-400">Choose a position. Inspect observations. Compare changes over time.</p></div><span className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-400">Practice prototype</span></div>
      <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[290px_minmax(0,1fr)_250px]">
        <aside className="panel p-5" aria-label="Sky search">
          <h3 className="font-semibold">Sky coordinates</h3><p className="mt-2 text-xs leading-5 text-slate-400">Enter a position in decimal degrees.</p>
          <form className="mt-6 space-y-5" onSubmit={e => { e.preventDefault(); setNotice(`Position prepared: RA ${ra} deg, Dec ${dec} deg; field ${field} arcmin. Archive search is not connected yet. No observations have been requested.`); }}>
            <div><label htmlFor="ra">Right ascension <span className="text-slate-500">/ deg</span></label><input id="ra" type="number" min="0" max="359.999999999" step="any" required placeholder="0 to less than 360" value={ra} onChange={e => { setRa(e.target.value); setNotice(''); }} /></div>
            <div><label htmlFor="dec">Declination <span className="text-slate-500">/ deg</span></label><input id="dec" type="number" min="-90" max="90" step="any" required placeholder="-90 to 90" value={dec} onChange={e => { setDec(e.target.value); setNotice(''); }} /></div>
            <div><label htmlFor="field">Field of view <span className="text-slate-500">/ arcmin</span></label><select id="field" value={field} onChange={e => { setField(e.target.value); setNotice(''); }}><option value="5">5 arcmin</option><option value="10">10 arcmin</option><option value="20">20 arcmin</option></select></div>
            <button className="primary w-full" type="submit">Prepare sky position</button>
            <p className="text-xs leading-5 text-slate-400">Coordinate preparation is available. Observation search will be enabled when the archive is connected.</p>
            {notice && <p role="status" className="rounded-lg border border-cyan-900 bg-cyan-950/30 p-3 text-xs leading-5 text-cyan-200">{notice}</p>}
          </form>
          <div className="mt-6 border-t border-slate-800 pt-5"><label htmlFor="band">Wavelength / detector</label><select id="band" disabled><option>Awaiting archive metadata</option></select><p className="mt-2 text-xs leading-5 text-slate-400">Available bands will come from the selected observations.</p></div>
        </aside>
        <div className="min-w-0 space-y-5">
          <section className="panel overflow-hidden" aria-labelledby="viewer-heading">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4"><h3 id="viewer-heading" className="font-semibold">Sky viewer</h3><span className="text-xs text-slate-400">No imagery loaded</span></div>
            <div className="flex min-h-[360px] items-center justify-center bg-[#090f19] px-6 py-14 sm:min-h-[450px]">
              <div className="max-w-sm text-center"><svg aria-hidden="true" viewBox="0 0 80 80" className="mx-auto mb-6 h-20 w-20 text-slate-600" fill="none" stroke="currentColor"><circle cx="40" cy="40" r="25"/><circle cx="40" cy="40" r="10"/><path d="M40 4v20m0 32v20M4 40h20m32 0h20"/></svg><h4 className="text-lg font-medium text-slate-200">Your sky exploration starts here</h4><p className="mt-3 text-sm leading-6 text-slate-400">Prepare a sky position using the search panel. Real SPHEREx imagery will appear here once archive integration is available.</p><p className="mt-5 text-xs text-slate-500">Empty viewer &middot; no simulated observations</p></div>
            </div>
            <div className="border-t border-slate-800 p-5"><div className="mb-4 flex items-center justify-between"><h4 className="text-sm font-medium">Observation timeline</h4><span className="text-xs text-slate-400">0 frames</span></div><input aria-label="Observation frame" type="range" min="0" max="1" value="0" disabled className="timeline"/><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><button disabled className="secondary">Previous</button><button disabled className="secondary">Play</button><button disabled className="secondary">Next</button></div><p className="text-xs text-slate-400">Load observations to enable playback</p></div></div>
          </section>
          <section className="panel p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">Compare observations</h3><span className="text-xs text-slate-400">Requires two aligned visits</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{['First observation', 'Second observation'].map(label => <div key={label} className="rounded-lg border border-dashed border-slate-700 p-4"><p className="text-sm text-slate-300">{label}</p><p className="mt-2 text-xs text-slate-500">No observation selected</p></div>)}</div><button disabled className="secondary mt-4">Blink comparison</button></section>
        </div>
        <aside className="space-y-5 lg:col-span-2 xl:col-span-1" aria-label="Observation information">
          <section className="panel p-5"><h3 className="font-semibold">Observation details</h3><p className="mt-3 text-xs leading-5 text-slate-400">Select an archive observation to inspect its metadata.</p><dl className="mt-5 space-y-4 text-sm">{['Observation ID', 'Observed at', 'Detector', 'Data release'].map(label => <div key={label}><dt className="text-xs text-slate-400">{label}</dt><dd className="mt-1 text-slate-500">Not available</dd></div>)}</dl></section>
          <section className="panel p-5"><h3 className="font-semibold">Data &amp; provenance</h3><p className="mt-3 text-xs leading-5 text-slate-400">NASA SPHEREx archive integration is pending. No scientific data or results are displayed.</p><p className="mt-3 text-xs leading-5 text-slate-400">Source links and image processing details will accompany each observation.</p></section>
          <section className="panel p-5"><h3 className="text-sm font-semibold">Service connection</h3><p className="mt-3 text-xs leading-5 text-slate-400">Backend health is independent of archive availability.</p>{error && <p role="alert" className="mt-3 break-words text-xs leading-5 text-amber-200">{error}</p>}<button className="secondary mt-4 w-full" disabled={status === 'checking'} onClick={() => void checkBackend()}>{status === 'checking' ? 'Checking...' : 'Test backend connection'}</button></section>
        </aside>
      </div>
      <footer className="mt-8 flex flex-wrap justify-between gap-3 border-t border-slate-800 pt-5 text-xs text-slate-400"><p>NASA Space Apps Challenge 2026 &mdash; Team madeo publico</p><p>Practice project &middot; Not an official submission</p></footer>
    </main>
  </div>;
}

