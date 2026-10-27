# WineShopPOS Login Brand Echo — UI-only handoff

Scope: `src/pages/Login.jsx`, `src/pages/LoginBrandOrbit.jsx`,
`src/pages/login-brand-orbit.css` and `public/login-brands/*.svg`.

- Adds **10 original vector package illustrations** (beer/wine) directly under
  Vite's existing `public/login-brands/` directory. Brand names are identification text,
  **not official manufacturer trademarks/logos or product photography**.
- Displays the same artwork in **78 staggered Echo copies** of 10 different brand packages scattered all
  over the screen at varied sizes, overlapping and fading in quick waves—based on
  iMessage's dense, repeated-message Echo effect rather than an outward ring or orbit.
- Animation uses pure CSS transforms with negative staggered delays (no JS timers).
- Auth logic, Supabase calls, demo mode, recovery and route guards remain unchanged.
- Layers are decorative, `aria-hidden`, and do not receive pointer events.
- Scoped selectors are unique to the login form; other screens are untouched.
- Smaller devices display fewer particles; `prefers-reduced-motion` disables
  the animation and keeps a quiet static layout. No external hosts, paid services, or JavaScript animation loops.

## Check / release

1. On a candidate branch, run `node --test tests/login_brand_orbit.test.mjs`,
   `npm run docs:check`, `npm run lint`, `npm run build`.
2. Browser-qualify both login and Forgot Password on desktop/mobile with
   reduced motion and verify keyboard navigation / readable text.
3. For production, begin from current main, inject verified PROD Vite config,
   take a frontend rollback snapshot and build the **exact promoted source**.
4. Upload immutable assets before changing `index.html` and compare hashes
   on the live endpoint; avoid all database / Function / Supabase mutations.

Source CI is not deployment. A public HTTP 200 proves transport only;
authenticated functional verification is a separate gate.
