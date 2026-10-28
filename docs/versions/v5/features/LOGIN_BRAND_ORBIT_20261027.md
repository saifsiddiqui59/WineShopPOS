# WineShopPOS — licensed photorealistic login-model continuation (28 October 2026)

Branch: feat/login-webgl-bottle-vortex-20261027; Draft PR #9; no production promotion.

## Decision
The previous dependency-free shader-geometry prototype is retained in source history but no longer mounted. It painted perfect cylinders and canvas labels: technically 3D but not product photography.

Three.js + GLTFLoader + physically based materials + PMREM studio environment is the DEV candidate. One canvas shares meshes and material textures; 26 orbiting groups desktop, 12 mobile. Curved multi-axis motion uses continuous time and depth/perspective. Under reduced motion, a single static frame is drawn. Visibility pause, GPU fallback, explicit FPS/P95/triangles/draw-call instrumentation.

## Licensed source assets
- Poly Haven: https://polyhaven.com/a/wine_bottles_01 (CC0, four original fictional wine labels, glTF + PBR images, 1K preview import; *not* Sula or any real manufacturer's pack shot).
- Innerscene wine, beer and can original GLBs (CC0, unbranded). Sources:
  - https://www.innerscene.com/tools/library/3d-parts/wine-bottle-original-drink-vessel-dff39232
  - https://www.innerscene.com/tools/library/3d-parts/beer-bottle-original-drink-vessel-1b0eeeac
  - https://www.innerscene.com/tools/library/3d-parts/drink-can-original-drink-vessel-c636c4a2

The dedicated branch-only importer downloads, validates and vendors all model bytes in public/login-brands/models. The application does not depend on external asset host/CDN at runtime. The importer must pass before browser rendering is expected to work. Models must remain unclaimed as any manufacturer's official bottles, until independently licensed.

## Promotion gates
- Source/build and GitHub checks green, actual glTF browser loading and no WebGL errors.
- Review uploaded desktop/mobile screenshots AND animated Playwright recording, not source checkmarks.
- Inspect frame-rate data from a real browser. CI SwiftShader results are not representative of hardware GPUs: test physical desktop/mobile hardware before approving 60 FPS.
- Real login demo, recovery and keyboard focus need user/UAT signoff. No production merge or deploy until approved.
- In particular, no production credentials, migrations, DB, invoice, AI Functions or storage-account changes are part of this PR.
