# Submission preparation - review before submitting

Project title: SPHEREx & Planet X | Sky Discovery Lab
Team: madeo publico

## High-level summary
SPHEREx & Planet X | Sky Discovery Lab makes genuine NASA SPHEREx infrared observations accessible through a browser. Users search the IRSA archive, inspect FITS-derived previews, and compare observations taken at different times. Comparisons require shared sky coverage, valid quality-masked pixels, and compatible local wavelengths. An educational Planet X Lab lets users record unverified investigation notes and export observation provenance. The application does not identify or confirm Planet X.

## Detailed description
The Next.js interface connects to a Python FastAPI backend. Bounded metadata searches query IRSA SIA2 DR1 and QR3 collections, including optional deep fields. SQLite stores metadata; small FITS cutouts and PNG previews are cached to avoid repeated downloads. Astropy reads science arrays, WCS, quality flags, and local spectral information. Accepted comparisons use a common 32 x 32 celestial coordinate grid and shared intensity scaling. Users can inspect side-by-side, before/after, and blink views of two actual epochs. No intermediate observations are generated.

Planet X Lab provides investigation notes and JSON provenance export. Apparent differences can result from noise, masks, instrumental artifacts, differing point-spread functions, or spectral differences. These previews are not PSF-matched or uncertainty-propagated difference images and cannot establish motion or a planetary discovery.

## NASA data and credits
- NASA SPHEREx data via Caltech/IPAC IRSA SIA2: https://irsa.ipac.caltech.edu/SIA
- Archive interface documentation: https://caltech-ipac.github.io/spherex-archive-documentation/spherex-data-access/
- Mission illustration credits: frontend/public/images/CREDITS.md
- Independent application; no NASA endorsement claimed.

## Verification executed on November 15, 2026
- Next.js production build and its TypeScript checks passed.
- FastAPI health, invalid coordinate, and invalid file-route checks passed.
- Cached genuine FITS comparison and PNG routes passed.
- Observations: 2025W45_2A_0496_2 (2025-11-08T19:07:28.734 UTC) and 2025W46_2A_0302_2 (2025-11-14T23:28:06.371 UTC).
- RA 127.69444, Dec -39.17760. Shared valid pixels: 824; clean overlap: 824; wavelength-compatible grid pixels before the clean-pixel intersection: 1024. Gap: 6.180991 days.
- Browser render and navigation passed; desktop/mobile screenshots saved under artifacts/merge-repair-*.png. No mobile horizontal overflow or JavaScript page errors detected.
- Fresh archive availability and browser blink playback were not retested in this repair session. Do not represent these as newly passed tests.

## Links to supply
- Final project: https://github.com/Barospooky/spherex-sky-explorer (publish the repaired code before submitting; local changes are not yet pushed).
- Demo: insert a publicly accessible demo link; localhost is not accessible to judges.
- Optional hosted application: insert only after deploying and testing it.

## AI disclosure draft
OpenAI Codex assisted with code implementation, merge-conflict repair, debugging, validation, and drafting documentation. The team must review the final implementation and submission text. Add any other AI tools used. Scientific image previews derive from archive FITS data, not AI-generated astronomy.

## Suggested 30-second demo script
0-5 seconds: Introduce the problem: exploring repeat infrared observations with provenance.
5-12 seconds: Show a real observation, its ID, UTC time, and IRSA source.
12-22 seconds: Show the validated pair, shared-pixel diagnostics, and blink/side-by-side controls.
22-30 seconds: Show investigation notes/export and state: educational investigation, not a Planet X discovery.
Record actual working behavior; do not simulate success during an archive outage.

## Submission checklist
Open your team Project tab while signed in, review the current form and official guide, fill the title/summary/description, final-project and demo links, NASA/data credits and AI disclosure, review terms, and submit. Verify the submitted status afterward. Public links must open without sign-in. Declare pre-event work honestly if the form or rules request it; this project began as a preparation starter.

Official pages consulted:
https://www.spaceappschallenge.org/2026/
https://github.com/nasa/spaceapps/discussions/1973
https://github.com/nasa/spaceapps/discussions/1991
The official 2026 overview lists submission closing November 15 at 11:59 PM local time. Confirm the applicable event timezone on your team/event page. The editable team page and current submission-guide page could not be opened through the research tool; check their exact fields directly.
