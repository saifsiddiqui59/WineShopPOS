# WineShopPOS Login Bottle Vortex — Real 3D WebGL upgrade

**Scope:** Only `src/pages/LoginBrandOrbit.jsx`, `src/pages/bottle-vortex-webgl.js`,
`src/pages/login-brand-orbit.css`, plus login-only verification scripts.

## Why the previous animation was replaced

Earlier releases created 184 overlapping SVG product illustrations. Those were
**flat drawings**, expensive to animate as separate DOM elements, and did not
approach realistic bottle geometry. Do not describe the prior work as
photorealistic 3D.

## Current DEV candidate

- A **single WebGL2 canvas**, no new packages or paid GPU APIs.
- Real, parameterized **3D wine bottles, beer bottles and cans** made from lathe
  meshes with separate glass, foil and brand-label shading.
- Ten original textual brand/collection labels created at runtime, rather than
  scraping or hotlinking manufacturer photography. These are not licensed
  official manufacturer label reproductions.
- 32 3D instances on desktop / 18 on smaller screens; actual depth, changing
  perspective and rotating glass surfaces, while avoiding 184 DOM elements.
- Pixel ratio caps (desktop 1.35, mobile 1.1), visibility pause, reduced-motion
  support (one static frame), context failure fallback and cleanup.
- All existing login, demo, Supabase authentication and password-reset logic
  unchanged. No cross-page CSS selectors or remote third-party assets.

**Limitations:** Procedurally shaded glass is **real 3D geometry** but is not
a professional product photograph or an exact branded glass/label reproduction.
For licensed photographic product packs, obtain the rights and supply the
specific product assets before replacing any existing production image.

## Verification and release policy

1. Source/lint/docs/build tests must pass without any real DEV/PROD secrets.
2. Browser Playwright test must show a working WebGL2 renderer (or an explicitly
   reported unsupported browser), 32/18 models, 10 label designs, frame
   progression, visually changing canvas, mobile layout, and reduced motion.
3. Inspect desktop/mobile screenshots and **actual browser-recorded video**;
   source-level checks and WebGL initialization alone are not visual sign-off.
4. The production website is currently intentionally disabled per user request.
   **Do not auto-reenable it merely by merging DEV code.** Only after a
   verified production promotion, correct PROD Vite configuration, existing
   index backup, Azure Blob safety checks, and user-directed restart.
5. Keep Supabase/DEV, Invoice/AI Azure Functions, Logic App and all business
   records untouched throughout this login-only redesign.
