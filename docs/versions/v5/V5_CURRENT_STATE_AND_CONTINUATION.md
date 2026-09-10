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
- Current V5 baseline before V5_16: `d58098f4eecfc5c85729d4ac41f9c789bcf6e8ef`
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

POS scanner wording is intentionally separated:

- **Camera Scan on This Device** uses the camera attached to the current phone,
  tablet or PC running WineShopPOS.
- **Phone as Barcode Scanner** pairs a separate phone to the PC POS using a
  temporary QR and existing Supabase Realtime Broadcast.
- **Quick Products** is collapsible to reduce cashier-screen clutter.

The separate phone has no billing authority. It sends barcode numbers only;
the authenticated PC still runs the existing product lookup, shift, stock and
cart logic.

## V5_14 Phone -> PC scanner

V5_14 adds a Barcode-to-PC style workflow without a new backend resource:

PC:
`Phone as Barcode Scanner -> Connect Phone Scanner -> QR`

Phone:
`scan QR -> Start Scanning -> barcode -> existing Supabase Realtime -> PC processBarcode()`

Security:
- 192-bit temporary pairing secret;
- 10-minute expiry;
- no product/customer/inventory data exposed by the phone page;
- phone cannot complete a sale;
- disconnect/new pairing stops the old PC listener;
- no new paid service or automatic paid fallback.

Canonical feature document:
`docs/versions/v5/features/POS_PHONE_TO_PC_BARCODE_SCANNER.md`

## V5_16 Combined Product Image + Phone Scanner repair

Human UAT showed OCR -> Add Product still displayed `No image` until a manual
Product Image lookup was started.

V5_16 changes the new-product flow:

- Product Image preview auto-loads from existing product discovery as soon as
  name/brand/size are available;
- preview is non-mutating;
- after Product Master creation, if no uploaded/confirmed image was supplied,
  Add Product runs the exact same `autoFindProductImage({replace:false})` path
  used by the Products page;
- the image operation finishes before returning to OCR / Products;
- Product Master is refreshed after image persistence;
- barcode remains unchanged;
- no new paid service/resource is added.

### Open scanner UAT issue

**Phone as Barcode Scanner repair implemented / HUMAN RETEST REQUIRED.**

The latest human UAT reported that the phone-to-PC scanner was not working,
the flow was confusing, dark-mode help text was difficult to read and scanner
tabs/panels were not visually clear. V5_16 repairs the concrete HashRouter
deep-link defect and adds acknowledged retry/dedupe behavior. Human retest is
still required before marking the phone-scanner workflow passed.

Canonical Product Image feature:
`docs/versions/v5/features/PRODUCT_IMAGE_AUTO_ENRICHMENT.md`

Phone scanner V5_16 repair:
- QR uses HashRouter route `#/phone-scanner?...`;
- phone reads query with React Router `useSearchParams`;
- barcode send retries up to three times waiting for PC acknowledgement;
- duplicate event IDs replay acknowledgement and do not add the product twice;
- scanner UX is one clear tab panel: Barcode Scanner / This Device Camera / Use Phone;
- dark-mode scanner and module tabs use high-contrast styling;
- existing USB scanner and native/ZXing camera scanner are preserved;
- no new paid service or backend resource.

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

## Remaining manual UAT after V5_16 automation

1. Subcategory: select predefined value, select Other / Custom, save/edit product.
2. First-time OCR product: Product Image choice in same creation flow and return to invoice.
3. Invoice 15983 end-to-end.
4. Invoice 16845 end-to-end, including pack suggestions and financial totals.
5. Mobile barcode scanner on a physical phone.
6. Camera Scan on This Device and existing physical USB scanner.
7. Phone as Barcode Scanner: QR pairing, known/unknown barcode, repeat scan,
   disconnect and expired-session negative test.
8. Offline draft -> reconnect -> SYNCING/SYNCED.
9. Receive reconnect/idempotency: no duplicate stock.
10. Cross-shop negative access for invoice/product/image/purchase data.

V5 is not considered fully closed until the applicable human UAT passes.

## V5_17 — Mobile camera barcode recognition repair

Starting parent:
`d7beca07986fe48c7dbc79be937e594b49ae5b46`

Human UAT after V5_16D:
- phone/mobile camera opens;
- barcode recognition still failed on a real product barcode.

V5_17 repairs the shared camera recognition component:
- high-resolution rear-camera ZXing is primary;
- native BarcodeDetector gets a center-ROI second pass;
- native -> ZXing switch reduced to 3.2s;
- continuous autofocus + conservative zoom assist when supported;
- manual Zoom + / Zoom -, Torch, camera switching and typed barcode preserved;
- no paid service/resource.

Phone -> PC HashRouter pairing and ACK/dedupe logic from V5_16 remain unchanged.
Physical USB/Bluetooth scanner path remains unchanged.

Manual UAT remains mandatory before marking mobile scanning passed.

## V5_19 — current continuation checkpoint

Starting parent:
`41755f157e330cd0eb3cb8667ee6ea063389d25c`

V5_19 is a combined QA change with three scopes.

### 1. Mobile barcode decoder

- dedicated ZXing `BrowserMultiFormatOneDReader`;
- enlarged center ROI;
- wide + tight + high-contrast + inverted + rotated passes;
- `BrowserMultiFormatReader` fallback;
- native BarcodeDetector preserved;
- environment-facing camera requested first;
- manual zoom/torch/camera switch/typed barcode preserved;
- no forced automatic zoom;
- no paid recognition provider.

### 2. Global separate-phone scanner

The current V5_19 design supersedes the historical 10-minute POS-owned pairing
contract for QA.

- pairing setup: `Operations -> Phone Scanner`;
- authenticated Layout mounts `GlobalPhoneScannerHost`;
- 192-bit pairing token + random session id;
- PC pairing persists until Disconnect/Replace;
- phone pairing persists until Forget This PC;
- phone events enter `ScannerContext.injectScan()`;
- retry + acknowledgement + event-id dedupe remain;
- dedupe cache is bounded;
- phone has no product/customer/inventory table access and no billing authority;
- physical USB/Bluetooth scanner remains unchanged;
- POS This Device Camera remains unchanged.

### 3. Add Product simplification

- duplicate top Product verification action removed;
- one `Find Product / Image` action remains;
- existing `OcrProductImagePreview` automatic preview preserved;
- existing secure `importCandidateImage` flow preserved;
- existing post-save `autoFindProductImage({ replace:false })` preserved;
- barcode capture attribute remains exactly once;
- barcode is not modified by image processing.

### V5_19 first-executor recovery

The first V5_19 executor stopped before commit because an older continuity test
still required `PhoneToPcScannerPanel` in POS. V5_19D updates the semantic legacy
contracts for the intentional global-scanner architecture, fixes the nested-route test contract, and scopes the direct-table mutation guard to Supabase while preserving the
underlying scanner, Product Image, purchase, OCR and environment safety gates.

Manual real-device UAT remains mandatory.

Source-of-truth precedence remains:
`CURRENT V5 SOURCE + CURRENT MIGRATIONS + VERIFIED V5 DEPLOYMENT > OLD DOCUMENTATION`.

## V5_20C_PRE_SAVE_IMAGE_OCR_SCANNER_20260909

Starting parent: `bd7a1fa8f5a26ccfe9b1fa12cec291b87d8d2449`.

Current V5 QA contract:
- Add Product internet Product Image search works before barcode/save using name + brand + size.
- The exact selected pre-save image is applied only after Product Master creation and is identity/barcode verified.
- Saved Product image India/Global chooser remains.
- OCR linked lines expose Edit Product; Save/Cancel return to the invoice review.
- Mobile scanner keeps the V5_19 1D ROI decoder but is full-screen and uses pinch zoom instead of Zoom +/-.
- Phone Scanner UI is simplified while persistent global Realtime pairing/ACK/dedupe remains.
- USB/Bluetooth keyboard-wedge scanner remains unchanged.
- DEV Edge + V5 QA frontend are the only deployment targets.
- PROD remains unchanged.

## V5_21 real-device scanner startup checkpoint — 2026-09-09

Human UAT after V5_20E found the simplified camera could remain indefinitely at
`Opening camera…`.

V5_21 starts local ZXing immediately after MediaStream attachment. Camera tuning,
rear-camera refinement, enumeration and native BarcodeDetector setup are optional
asynchronous enhancements. A 7-second watchdog exposes Retry instead of an
indefinite opening state.

Frontend-only V5 QA change; no Function App/Edge Function/schema/PROD mutation.

## V5_22 Purchase identity / repeated commercial lines — 2026-09-09

Human UAT on real Kapil Alcotech invoice 16845 proved two separate requirements:

1. Financial reconciliation + pack validation do not prove Product Master identity.
   Invoice-size evidence is now preserved separately; a 500 ml invoice row cannot
   become READY against a 330 ml Product Master.
2. Repeated Product Master IDs are not inherently duplicates. Different
   MRP/rate/amount/pack/batch rows remain separate legitimate purchase lines.
   Only identical-looking rows enter a human `Keep Separate` review.

Physical barcode mismatch never overwrites a known Product Master barcode.
DEV `receive_purchase_v2` now supports repeated Product Master purchase lines and
independently blocks hard size/barcode identity mismatches.

V5_22 remains DEV/QA only until human UAT passes on invoice 16845.

<!-- V5_23A_ATOMIC_PURCHASE_PRODUCT_CREATION_20260909 -->
## V5_23A — Atomic purchase Product creation + OCR learning

Purchase/OCR no longer creates a Product Master while the invoice is only being
reviewed. Unmatched rows are prepared as `pendingProduct` draft data. Existing
Product Masters may still be selected normally.

At `Approve & Receive Stock`, `receive_purchase_v3` is the single database
commit boundary for:
- supplier resolution/creation when needed by Purchase Receiving;
- pending Product Master creation;
- missing existing Product Master barcode assignment from verified scan;
- purchase header/items;
- inventory increase;
- stock movements;
- landed-cost finalization and audit.

Any exception rolls back the transaction, so a failed/cancelled/unsubmitted purchase
does not create the prepared Product Master and does not assign its pending barcode.

Normal Add Product/Product Master administration outside purchasing is unchanged.

OCR learning is centralized in `src/lib/ocrLearningRules.js`. Contextual rules
include numeric-size `MI/M1 -> ml` correction, so explicit OCR evidence such as
`500 MI` resolves to 500 ml before CAN/24/12-pack fallback heuristics can run.
<!-- /V5_23A_ATOMIC_PURCHASE_PRODUCT_CREATION_20260909 -->

<!-- V5_24_CONNECTIVITY_DRAFT_STABILITY_20260909 -->
## V5_24 — Connectivity + Purchase draft stability hotfix

Scope is intentionally narrow and frontend-only.

- Global ONLINE/OFFLINE display uses actual DEV Supabase reachability rather than trusting `navigator.onLine`.
- Purchase Receiving uses the same backend reachability rule and no longer disables Approve & Receive Stock solely because the browser reports offline.
- A meaningful local encrypted draft is still retained before a receive attempt.
- Blank manual Receive Stock workspaces do not create local drafts.
- Existing cleanup removes only decryptable, truly-empty `manual:` drafts; meaningful/ingestion/unknown rows are preserved.
- ShopContext refresh no longer refuses server refresh solely because `navigator.onLine` is false.
- V5_23 `receiveStock` -> `receive_purchase_v3`, OCR normalization, Product Master/barcode atomicity and purchase identity logic are unchanged.
- No database migration, Function App code change or PROD mutation is part of V5_24.

Human UAT after deployment:
1. Header changes CHECKING -> ONLINE when DEV Supabase is reachable even if `navigator.onLine` is false.
2. Opening/refreshing a blank manual Receive Stock page does not increase local draft count.
3. Any remaining local draft count represents preserved meaningful/ingestion/unknown rows, not blindly deleted data.
4. Resume invoice 16845 V5_23 atomic purchase UAT.
<!-- /V5_24_CONNECTIVITY_DRAFT_STABILITY_20260909 -->

<!-- V5_25_PURCHASE_PHONE_SCANNER_AND_LAYOUT_20260909 -->
## V5_25 — Purchase Receiving phone barcode routing + full-width workspace

Human UAT exposed a scanner-source UX gap in Purchase Receiving.

Current contract:
- `Camera This Device` explicitly opens the camera on the laptop/phone/tablet
  where the WineShopPOS browser is running.
- `Scan with Phone` arms the selected receiving row for the persistent phone
  paired under Operations -> Phone Scanner.
- While `Prepare New Product` is open, a `PHONE_REMOTE` barcode automatically
  fills the Barcode draft field.
- USB/keyboard-wedge barcode capture remains available through the same
  ScannerContext; the Prepare barcode input has scanner-capture semantics.
- The global phone transport, ACK/dedupe, pairing secret and phone authority model
  are unchanged.
- Selected Line sidebar is removed; Purchase Receiving uses the full table width.
- Prepared Product/barcode is still draft-only until `receive_purchase_v3`
  succeeds atomically.
- V5_24 backend connectivity and blank-draft behavior remain unchanged.
- No migration, Function/Edge change or PROD mutation.

Human UAT:
1. Open Prepare Product and scan from paired phone -> Barcode field fills.
2. Use Scan with Phone on an existing no-barcode Product -> pending assignment only.
3. Existing known barcode + different phone scan -> mismatch remains blocked.
4. Camera This Device opens only when explicitly selected.
5. USB scanner remains functional.
6. No Selected Line sidebar; table occupies full receiving workspace.
<!-- /V5_25_PURCHASE_PHONE_SCANNER_AND_LAYOUT_20260909 -->

<!-- V5_26_PURCHASE_VERIFICATION_SIMPLIFICATION_20260909 -->
## V5_26 — Purchase verification simplification + optional new-product details

Human UAT on invoice 16845 exposed a false post-receipt Pack Quantity REVIEW after
V5_23 atomic pending Product creation. Pending rows correctly retain resolved pack
decisions but intentionally have no Product Master ID before receive_purchase_v3 commits.

V5_26:
- reconciles existing Product Master rows by exact Product ID + commercial pack;
- reconciles atomic pending rows one-for-one using created Product identity when
  available plus pack/quantity/value checks;
- resolves audited corrections by purchase_item_id so one repeated line cannot
  accidentally resolve all rows sharing the same Product Master;
- keeps mismatched identity, size, barcode, pack, quantity or value unresolved;
- shows Posted Purchase Lines as the normal completed receipt;
- hides OCR/correction/landed-cost tools after successful pack verification unless
  the user explicitly opens Audit / Correction Tools;
- keeps correction tools automatically visible for a genuine unresolved pack;
- changes new-product details from mandatory Prepare Product to optional
  Edit New Product Details. A reviewed unmatched row can stage pending Product data
  on barcode scan, Assign Later, or pack confirmation;
- links an existing Product Master when a scanned barcode already belongs to it.

Unchanged:
- receive_purchase_v3, migrations and database write logic;
- OCR normalization and pack inference rules;
- Product Image;
- phone scanner transport/ACK/dedupe;
- inventory/FIFO write path;
- PROD.

Manual QA:
1. Invoice 16845 receipt -> Pack Quantity VERIFIED and Inventory Receipt 996 bottles.
2. Normal completed receipt -> Posted Purchase Lines visible; three audit/correction
   tables hidden by default.
3. Open Audit / Correction Tools -> retained OCR/correction tools remain usable.
4. New unmatched line -> Scan with Phone without opening Edit New Product Details;
   pending only until successful receive.
5. Failed/cancelled receive -> no Product Master/barcode creation.
6. Successful receive -> Product + purchase + inventory commit atomically.
<!-- /V5_26_PURCHASE_VERIFICATION_SIMPLIFICATION_20260909 -->
