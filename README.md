# SPHEREx Sky Explorer — practice starter

Next.js App Router, TypeScript, Tailwind CSS and FastAPI. NASA Space Apps Challenge 2026 preparation; not an official submission.

## Start backend — PowerShell terminal 1
```powershell
Set-Location D:\NASA_SPACE_APPS\spherex-sky-explorer\backend
# Only if the environment is missing:
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe --version
.\.venv\Scripts\python.exe -m pip install -r requirements.txt --retries 5 --timeout 60
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
Health: http://127.0.0.1:8000/api/health
API documentation: http://127.0.0.1:8000/docs

## Start frontend — PowerShell terminal 2
```powershell
Set-Location D:\NASA_SPACE_APPS\spherex-sky-explorer\frontend
if (!(Test-Path .env.local)) { Copy-Item .env.local.example .env.local }
npm install
npm run dev
```
Open http://localhost:3000. Reuse the existing project server if it is already running. Environment changes require restarting that project's frontend server.

## Verify
```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
Set-Location D:\NASA_SPACE_APPS\spherex-sky-explorer\frontend
npm run build
```
The dashboard checks NEXT_PUBLIC_API_URL + /api/health with a ten-second timeout. Connected requires HTTP success and the expected status and project fields. Retry with Test backend connection.

## Data boundaries
All selection controls are explicitly demo placeholders. The CSS sky gradient is decorative, not NASA imagery. No observations, dates, wavelengths or scientific results are invented. frontend/src/app/archive.ts defines the future archive adapter contract. Implement it only after confirming an archive's documented access method; preserve provenance URLs, original units and missing metadata. No API keys or additional dependencies are needed now.

## Troubleshooting
- API unavailable: start the backend and check the health URL directly. Confirm .env.local contains NEXT_PUBLIC_API_URL=http://127.0.0.1:8000.
- CORS: use localhost:3000 or 127.0.0.1:3000; both are allowed by backend/main.py.
- Installation errors: inspect the actual pip message. For DNS/connectivity errors, test `Test-NetConnection files.pythonhosted.org -Port 443` and retry the install command. Do not disable TLS verification.
- Busy port: inspect `Get-NetTCPConnection -State Listen -LocalPort 3000,8000` and its owning process before acting. Do not terminate unrelated processes.
- Missing Python: use `py -0p` to locate Python 3.13. Invoke the virtual environment executable directly; activation is unnecessary.

## Live archive integration
The Live SPHEREx archive panel searches official IRSA SIA2 DR1 and QR3 wide-survey collections. The older workspace below remains a prototype. Search is metadata-only, bounded to 300 rows per collection and 20 MiB per response. Warnings identify partial results and collection failures. Empty results never become simulated data.

Endpoints:
- GET /api/observations?ra=127.69444&dec=-39.17760
- GET /api/cutouts/{observation_id}?ra=127.69444&dec=-39.17760&size=0.05
- GET /api/files/{cache_key}.png (or .fits)

SQLite metadata: backend/data/observations.sqlite3. FITS and PNG cache: backend/data/cutouts. Keys include source URL, coordinates, size and rendering version. Downloads are restricted to trusted IRSA cutout URLs, capped at 32 MiB, with 90-second network timeouts. No bulk FITS download occurs. Single-process locking avoids simultaneous duplicate downloads; multiple workers and distributed deployment require shared job locking and cache eviction. Cache disk usage currently requires operator monitoring.

Candidate pairs use the same detector, overlapping spectral bounds, and more than one day separation. These do not establish matching wavelengths at the target pixel. Previews use recognized science extensions with finite pixels, a vertical flip and independent percentile/asinh stretches. They are not WCS-registered, photometric measurements, or evidence of object motion. Use side-by-side inspection only.

Official interface: https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-access/


## Sky Discovery Lab update
The primary interface is now a unified light-themed search/viewer. Native inspection is distinct from Align & compare epochs. Planet X Lab provides temporary user notes and JSON export with observation provenance; it does not detect or confirm planets.

GET /api/comparison?first=ID&second=ID&ra=RA&dec=DEC loads two small cutouts and maps them onto a common ICRS TAN grid (32 x 32, three arcminutes). Celestial SIP corrections are retained; spectral lookup uses raw pixel coordinates. Nearest-neighbor resampling avoids implying new resolution. Quality flags other than SOURCE and FULLSAMPLE are excluded conservatively. Only common finite pixels with local wavelength centers within half the narrower bandwidth are shown. At least 16 shared pixels are required. Both frames use a common percentile/asinh stretch. These are exploration previews, not PSF-matched or uncertainty-propagated scientific differences.

Transient network errors and HTTP 429/502/503/504 receive up to three attempts with bounded backoff. A persistent upstream failure is still reported; the application never silently substitutes a different observation. The formerly failing 2025W47_2A_0043_1 cutout was successfully retrieved during verification. Cached images avoid repeated archive calls.


## Current verification and imagery
See artifacts/verification.md for exact executed checks, observation IDs and FITS times. The three workspaces share real archive state. Sky Explorer supports a single selected observation independently of pair compatibility. Time Comparison offers a bounded six-cutout/fifteen-pair automatic search, with optional DR1/QR3 deep fields and explicit rejection counts. Metadata timestamps are rendered in UTC.
Mission illustration attribution and reuse policy are documented in frontend/public/images/CREDITS.md. Planet Nine third-party artwork was omitted because reuse permission was not verified. Desktop/mobile screenshots exist in artifacts; mobile visual validation remains incomplete.
