# V3 Hosted Preview Qualification — 2026-09-05

Status: **PASS**

## Preview application identity

Application source SHA:
`10bac5ea4a0f038dde19494694b6d811eeb8766e`

Preview:
`https://wspv35c9453b6e9a1.z29.web.core.windows.net/v3-preview/`

Hosted `index.html` SHA-256:
`a2cb80eec3ad0168d7dbda25674d1755e28d7665165e73cadfb26ab413fbf8f0`

Corrected Vite JavaScript API build:
PASS.

## Browser qualification

DEV ADMIN login:
PASS.

Hosted Playwright:
- tests: 7
- passed: 7
- skipped: 0
- flaky: 0
- unexpected: 0

Current contract coverage:
1. public login;
2. active login without browser refresh;
3. POS / Products / Inventory & Product Stock;
4. Invoice Inbox friendly labels;
5. POS barcode/search UI plus scanner diagnostics under Admin → Hardware;
6. Admin Product Cleanup opens without deletion;
7. Admin Backup & Recovery loads restore history without schema error.

The POS browser test is intentionally read-only. Current V3 requires a valid
cashier shift before cart/billing activity, and scanner diagnostics are located
at Admin → Hardware → Scanner.

Combined hosted qualification:
**8/8 PASS** = 1 corrected hosted-build/runtime gate + 7 browser tests.

## Safety

- PROD/main writes: NONE
- Supabase operational writes by browser suite: NONE
- Azure writes in this executor: NONE
- Azure Function writes: NONE
- AI deployment: NONE
