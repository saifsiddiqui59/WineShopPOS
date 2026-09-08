# WineShopPOS V5 — Current State and Continuation

**START HERE IN A NEW CHAT.**

Status: **ACTIVE DEV / QA — HUMAN UAT IN PROGRESS**

## Authority

Use this order when deciding the current project state:

1. current `V5` Git source;
2. current migrations / Supabase schema;
3. verified V5 QA deployment;
4. this current-state document;
5. older implementation/release documents only as historical context.

Do **not** reset the project to old V3/V4 chapters.

## Repository and environment

- Repository: `saifsiddiqui59/WineShopPOS`
- Branch: `V5`
- V5_13B starting parent: `59a800d043050e8566adb7a38377c537e221bd7f`
- V5 QA preview: `https://wspv5qa3a5e8018.z29.web.core.windows.net/`
- DEV Supabase: `WineshopPOS_DEV`
- DEV project ref: `juhcypzoacauzmtzqnwd`
- DEV URL: `https://juhcypzoacauzmtzqnwd.supabase.co`
- PROD frontend: `https://wineshoppos.z29.web.core.windows.net/`
- PROD Supabase ref: `uiurgplnsgmawvxhjzzp`

V5 is PROD-derived code bound to DEV/QA runtime. Existing DEV business data is retained.
PROD must remain untouched until explicit promotion authorization.

## Completed before V5_13

- dedicated DEV Invoice API;
- V5 preview with visible `QA / DEV · V5 · NOT PROD` badge;
- OCR original-invoice evidence safety;
- OCR retry/detail improvements;
- Sr No, Size (ml), column selector and sticky OCR table header;
- Suggested Product Name;
- Product Image candidate preview;
- mobile product-photo capture;
- mobile barcode scanner with native BarcodeDetector + free ZXing fallback;
- Purchase Receiving Workspace, offline draft and receive-idempotency framework;
- Price/Bottle >= MRP hard safety block;
- India/Global Product Image chooser.

## V5_13D human-UAT corrections

### Product form / subcategory

The browser datalist-based subcategory path is replaced with a controlled select plus
`Other / Custom` text input. This is specifically to remove the UAT crash:

`Cannot read properties of undefined (reading 'length')`

### Product Image for first-time products

A first-time Product can choose/verify a Product Image in the same Add Product flow.
The selected candidate is previewed before save and securely imported immediately
after Product Master creation. OCR-created products also get one existing free-only
automatic image lookup attempt after creation when no candidate was selected.

User wording is **Product Image**. Do not use `No candidate image`.

No paid provider or automatic paid fallback is allowed.

### Shop invoice size rules

When explicit printed/OCR size is available, it always wins.

Only when size is absent, apply these reviewable shop defaults in this precedence:

1. package explicitly identified as **CAN** -> **500 ml**
2. otherwise **24 bottles/case** -> **330 ml**
3. otherwise **12 bottles/case** -> **650 ml**
4. otherwise size remains unresolved for review

Do not invent 750 ml as a generic default.

### Pack / MRP sanity

If current Bottles/Case causes Price/Bottle to reach or exceed MRP:

- calculate the minimum pack that makes Price/Bottle **below** MRP;
- choose the next common pack from `6, 12, 18, 24, 30, 36, 48`;
- auto-apply it as a **reviewable suggestion**, not final evidence;
- recalculate Final Bottles and Price/Bottle;
- show the warning under **Bottles/Case**;
- user may change Bottles/Case;
- Confirm Line remains blocked only while final Price/Bottle is still >= MRP.

Never hide the problem by capping Price/Bottle.

### POS Billing

The existing USB/keyboard scanner path remains authoritative and unchanged.
POS also exposes a collapsible **Mobile Barcode Scanner** panel, patterned after
Customer & Offers, with **Scan Product** using the existing free mobile scanner.

## Safe executor workflow for every continuation

Before mutation:

1. `git fetch origin V5 main`
2. verify local HEAD == origin/V5
3. read `docs/RELEASE_EXECUTOR_FAILURE_REGISTER.md` in full
4. require clean **tracked** worktree
5. run `git fsck --full`
6. snapshot PROD bindings/frontend read-only
7. back up only executor-owned files

Never automatically use destructive cleanup:
`git reset --hard`, `git clean`, `git stash`, `git checkout .`,
`git restore .`, `git pull --rebase`, `git add .`, or `git add -A`.

Stage only explicit owned paths.

## Remaining manual UAT after V5_13D automation

1. Subcategory: select predefined value, select Other / Custom, save/edit product.
2. First-time OCR product: Product Image choice in same creation flow and return to invoice.
3. Invoice 15983 end-to-end.
4. Invoice 16845 end-to-end, including pack suggestions and financial totals.
5. Mobile barcode scanner on a physical phone.
6. POS mobile Scan Product and existing physical USB scanner.
7. Offline draft -> reconnect -> SYNCING/SYNCED.
8. Receive reconnect/idempotency: no duplicate stock.
9. Cross-shop negative access for invoice/product/image/purchase data.

V5 is not considered fully closed until the applicable human UAT passes.
