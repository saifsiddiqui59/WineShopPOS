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

## October 28 cinematic optimization follow-up
Compared the rendered GitHub Actions screenshot with the user's reference: earlier assets formed two stiff columns and lacked near/far perspective, photographic highlights and a strong gold light tunnel. New renderer batches every repeated source mesh using InstancedMesh (instead of 26 complete cloned hierarchies), preserves texture maps and PBR environment reflections, disables expensive KHR_materials_transmission prepasses in the multi-object background, and uses distinct foreground/near/middle/far helix poses. Adds CSS copper-gold atmosphere. The production site remains untouched. Must inspect fresh desktop/mobile/screenshots and browser video before quality acceptance; measured SwiftShader CI FPS is not a hardware benchmark.

## Photorealism regression correction
First instanced screenshot was inspected: pale opaque bottles and an oversized foreground can were unacceptable. Tint physically based original glass by named glass/liquid materials (green, amber and ruby) with glossy clearcoat, avoid costly full transmission, anchor three hero bottle positions at the desktop edges, and keep complete silhouettes above/below the mobile form. Explicitly NOT declaring this photorealistic until new screenshots and recording inspected.

## October 28 — Vertical cyclone, full-screen density and stable animation
The customer explicitly rejected the prior XY carousel. Motion now spirals around the **screen-vertical Y spine**, using **Z as physical depth** and Z-axis roll/banking: a true cylindrical cyclone, not flat rings orbiting a card. 44 desired instances on desktop and 24 on mobile (with automatic medium/low quality fallbacks when actual frame intervals show a slow device). Preallocated transforms remove per-frame matrix allocations; the per-pixel background shader is simplified; FPS statistics are throttled to every 8 samples. Source GLBs and labels remain commercially cleared CC0/generic; no authentication changes, paid GPU, Azure changes, or PROD deployment. The exact source/CI/video and visual quality must be rechecked. SwiftShader FPS is not proof of 60 FPS hardware smoothness.
