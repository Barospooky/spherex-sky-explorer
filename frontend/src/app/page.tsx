'use client';

import { useEffect, useState } from 'react';
import ArchiveExplorer from './ArchiveExplorer';

export default function Home() {
  const [backendError, setBackendError] = useState(false);

  async function check() {
    try {
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/health`,
        { signal: AbortSignal.timeout(5000) }
      );
      const d = await r.json();
      if (!r.ok || d.status !== 'ok' || d.project !== 'SPHEREx Sky Explorer') {
        throw new Error();
      }
      setBackendError(false);
    } catch {
      setBackendError(true);
    }
  }

  useEffect(() => {
    void check();
  }, []);

  return (
    <>
      <a className="skip-link" href="#workspace">
        Skip to workspace
      </a>

      {backendError && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-center text-xs text-amber-800">
          ⚠️ Backend is unavailable. Please ensure the FastAPI server is running on port 8000.
          <button
            onClick={() => void check()}
            className="ml-3 underline font-medium hover:text-amber-900"
          >
            Retry
          </button>
        </div>
      )}

      <header className="border-b border-blue-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-sm">
              🔭
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                SPHEREx <span className="font-normal text-slate-500">| Sky Discovery Lab</span>
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Explore the sky &middot; Compare epochs &middot; Investigate celestial change
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              NASA IRSA DR1 &amp; QR3
            </span>
          </div>
        </div>
      </header>

      <main id="workspace" className="mx-auto max-w-7xl px-5 py-8">
        <ArchiveExplorer />
      </main>

      <footer className="mx-auto max-w-7xl border-t border-blue-100 px-6 py-6 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <span>Scientific data: NASA SPHEREx / Caltech-IPAC IRSA &middot; Independent exploration tool</span>
        <span>Candidate annotations are exploration hypotheses, not confirmed discoveries.</span>
      </footer>
    </>
  );
}
