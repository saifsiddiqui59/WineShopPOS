# Remove Help/User Manual From QA and PROD UI — 2026-09-05

Status: **PASS**

## Scope

Removed Help/User Manual exposure from the application UI in QA and PROD.

Changed:
- user menu: `Help / About` -> `About`;
- Account tab: `Help / About` -> `About`;
- removed `Open Full User Manual` from the Account About panel.

Preserved:
- About/version/support information;
- current Windows setup download UI;
- underlying `public/manual/` files;
- legacy `/help` route compatibility.

## QA

- branch: `V3`
- deployed source SHA: `54794c4e25d75183cbefda5821cac866e0e4b0c4`
- verified removal base ancestor: `c8580a53c1a37cd174a82efa431d9154db9168ee`
- URL: `https://wspv35c9453b6e9a1.z29.web.core.windows.net/v3-preview/`
- storage account: `wspv35c9453b6e9a1`
- artifact index SHA-256: `45211f887eb7d757d5b437390313b7673d4f6a255a6ff85cb45b5800b4f3dfe2`
- authenticated UI verification: PASS
- rollback copy: `/e/WineShopPOS_RELEASE_EVIDENCE/QA_HELP_MANUAL_UI_PREDEPLOY_20260905T125141Z`

## PROD

- branch: `main`
- pre-patch current base SHA: `464a2afcad3433c8bc3741d721add199c7dcdb4d`
- deployed source SHA: `661610b203e231dadf740bd07871795a97b23d13`
- URL: `https://wineshoppos.z29.web.core.windows.net/`
- storage account: `wineshoppos`
- artifact index SHA-256: `b46d431efe058e164cfeea2ced92c1f3e784fa0c605764c65d4cd8efeda489c3`
- authenticated UI verification: PASS
- rollback copy: `/e/WineShopPOS_RELEASE_EVIDENCE/PROD_HELP_MANUAL_UI_PREDEPLOY_20260905T125531Z`

## Recovery history

1. Script 68 used the wrong lint mechanism (`npx eslint`) instead of the
   repository's `npm run lint` -> `oxlint`.
2. Script 69 pushed the QA removal commit but captured noisy `git commit`
   stdout together with the SHA.
3. Script 70 used an exact Git archive without supplying the branch identity
   required by environment isolation.
4. Script 71 used a stale exact-head requirement and stopped when legitimate
   newer Windows setup commits advanced V3/main.
5. Script 72 derived current state, preserved the newer Windows setup feature,
   enforced the removal invariant, built exact artifacts with `BRANCH_NAME`,
   and completed QA then PROD.

## Non-scope

- database writes: NONE
- Edge Function writes: NONE
- Owner AI writes: NONE
- destructive Git cleanup: NONE

Azure Storage used the project's verified in-memory key-auth fallback.
No storage key or user password is stored in this evidence.
