# WineShopPOS Login Brand Echo — UI-only handoff

Scope: `src/pages/Login.jsx`, `src/pages/LoginBrandOrbit.jsx`,
`src/pages/login-brand-orbit.css` and `public/login-brands/*.svg`.

- Adds **10 original vector package illustrations** (beer/wine) directly under
  Vite's existing `public/login-brands/` directory. Brand names are identification text,
  **not official manufacturer trademarks/logos or product photography**.
- Displays the same artwork in **184 layered Echo copies** of 10 different brand packages moving across the
  screen on distinct **clockwise 3D spiral curves** at varied sizes, with depth
  shifts from -640px to +280px across four planes. Each copy sweeps through
  four XYZ waypoints with rotation, grows toward the viewer and overlaps many
  other copies for dense iMessage-like repetition rather than sparse stickers.
- Animation uses pure CSS 3D transforms, a perspective field, metal/glass light
  reflections, luminous swirling background shafts, and 32 tiny glints. It is
  a **3D-style browser effect**, not imported 3D product geometry. No JS timers,
  WebGL dependency, external image hosts, or paid services.
- Auth logic, Supabase calls, demo mode, recovery and route guards remain unchanged.
- Layers are decorative, `aria-hidden`, and do not receive pointer events.
- Scoped selectors are unique to the login form; other screens are untouched.
- Smaller devices display fewer particles; `prefers-reduced-motion` disables
  the animation and keeps a quiet static layout. No external hosts, paid services, or JavaScript animation loops.

## Check / release

1. On a candidate branch, run `node --test tests/login_brand_orbit.test.mjs`,
   `npm run docs:check`, `npm run lint`, `npm run build`.
2. Browser-qualify desktop/mobile/reduced-motion. Require 184 mounted products,
   at least 40 simultaneously visible bottles on desktop from three different
   depth planes, actual matrix3d CSS transforms, 24-particle time-separated
   motion checks, clockwise waypoints, and recorded browser video. Also check login
   and Forgot Password keyboard navigation / readable text.
3. For production, begin from current main, inject verified PROD Vite config,
   take a frontend rollback snapshot and build the **exact promoted source**.
4. Upload immutable assets before changing `index.html` and compare hashes
   on the live endpoint; avoid all database / Function / Supabase mutations.

Source CI is not deployment. A public HTTP 200 proves transport only;
authenticated functional verification is a separate gate.
