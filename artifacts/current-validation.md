# Real-epoch validation

2025W45_2A_0496_2: FITS DATE-OBS 2025-11-08T19:07:28.734
2025W46_2A_0302_2: FITS DATE-OBS 2025-11-14T23:28:06.371

824 common pixels accepted on the 32x32 ICRS grid. Criteria unchanged: finite science, conservative artifact mask, local wavelength centers within half the narrower bandwidth, minimum 16 accepted pixels. Shared percentile/asinh scaling. Deep-field sample rejected: 708-854 clean overlapping pixels, zero wavelength-compatible pixels. See JSON files for each tested observation and rejection.
Limitations: nearest-neighbor resampling, no PSF matching, no propagated uncertainties, no discovery or calibrated difference-image claim.

Browser PASS: live search, single FITS-derived PNG decoded, validated pair images decoded, blink changes source, Planet X Lab notes, desktop and mobile screenshots, no horizontal mobile overflow. Production build and TypeScript PASS. API health/invalid coordinates/missing ID PASS. Simulated 422/429/503/timeouts retry policies PASS. Initial browser selector timeout fixed with explicit aria-label. FITS timestamps differ by tens of milliseconds from rounded archive MJD; cutout responses now prefer FITS DATE-OBS.
