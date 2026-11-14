'use client';
import { useEffect, useState } from 'react';
import ArchiveExplorer from './ArchiveExplorer';
export default function Home(){
 const [status,setStatus]=useState('Checking backend');
 async function check(){setStatus('Checking backend');try{const r=await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://127.0.0.1:8000'}/api/health`,{signal:AbortSignal.timeout(10000)});const d=await r.json();if(!r.ok||d.status!=='ok'||d.project!=='SPHEREx Sky Explorer')throw Error();setStatus('Backend connected');}catch{setStatus('Backend unavailable - start FastAPI on port 8000');}}
 useEffect(()=>{void check();},[]);
 return <><a className="skip-link" href="#workspace">Skip to workspace</a><header className="border-b border-blue-100 bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6"><div><h1 className="text-xl font-semibold tracking-tight">SPHEREx <span className="font-normal text-slate-500">| Sky Discovery Lab</span></h1><p className="mt-1 text-sm text-slate-500">Explore the sky. Compare epochs. Investigate change.</p></div><button className="secondary" onClick={()=>void check()} aria-label="Check backend connection">{status}</button></div></header><main id="workspace" className="mx-auto max-w-7xl px-5 py-8"><ArchiveExplorer/></main><footer className="mx-auto max-w-7xl border-t border-blue-100 px-6 py-6 text-xs text-slate-500">Scientific data: NASA SPHEREx / Caltech-IPAC IRSA. Independent exploration tool; candidate annotations are not discoveries.</footer></>;
}
