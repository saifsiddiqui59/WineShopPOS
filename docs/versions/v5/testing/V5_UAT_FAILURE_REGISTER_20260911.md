# WineShopPOS V5 UAT — Pending Failure Register

Purpose: capture newly discovered V5 master-certification runner failures immediately, without modifying the active V5 branch during UAT. After UAT is complete, these entries should be merged into `docs/RELEASE_EXECUTOR_FAILURE_REGISTER.md`.

## 2026-09-11 — Git Bash shell base64 decode failure

- Stage: Full master certification preflight / embedded runner transport
- Symptom: `base64: invalid input`
- Root cause: test runner relied on Git Bash `base64` decoding for environment/embedded content, which was brittle on this Windows/Git Bash execution path.
- Resolution: remove shell base64 dependency; use Node.js `Buffer.from(..., "base64")` for embedded binary decoding and direct Node parsing for environment values.
- Permanent prevention:
  - Do not use Git Bash `base64 -d` for runner-critical transport.
  - Prefer Node.js for decoding embedded assets on this project.
  - Validate outer Bash, embedded Bash, and embedded Node syntax before delivery.
- Safe continuation: rerun with R3 or later.
- Classification: test-runner defect, not WineShopPOS application failure.

## 2026-09-11 — OCR file upload locator matched two inputs

- Stage: Real invoice OCR UAT, invoice 16845
- Symptom: Playwright strict-mode violation for `locator('input[type="file"]')`; two inputs matched.
- Root cause: WineShopPOS has both a hidden/global product-image file input and the Invoice OCR upload input.
- Resolution: select only the OCR input whose `accept` contains `application/pdf`; assert exactly one matching upload input before `setInputFiles`.
- Permanent prevention:
  - Never use generic `input[type="file"]` in WineShopPOS E2E tests.
  - Scope by semantic role/accept contract and assert uniqueness before upload.
- Safe continuation: no stock was received; rerun from the existing unreceived OCR state.
- Classification: test-runner selector defect, not application failure.

## 2026-09-11 — Supplier label fuzzy match selected unrelated controls

- Stage: Purchase Receiving normalization, invoice 16845
- Symptom: Playwright strict-mode violation for `getByLabel("Supplier")`; matched navigation, Supplier combobox, and Cash / Supplier Discount.
- Root cause: non-exact accessible-name matching was used for a short generic field name.
- Resolution: use exact semantic selector `getByRole("combobox", { name: "Supplier", exact: true })`; convert string `getByLabel(...)` selectors in the invoice runner to exact matching; add a pre-mutation locator audit for all critical receiving fields.
- Permanent prevention:
  - Use exact accessible names for WineShopPOS form controls.
  - Prefer semantic roles for short/generic names such as Supplier.
  - Before destructive/financial mutations, assert each critical locator resolves to exactly one control.
- Safe continuation: supplier and OCR draft may exist in DEV; Approve & Receive was not reached.
- Classification: test-runner selector defect, not application failure.

## Integration rule

Do not modify/push the canonical V5 failure register while an active local UAT run requires `local HEAD == origin/V5`, because advancing the remote branch would invalidate the runner preflight. Merge these entries into the canonical register after the current UAT cycle or before generating the next release/deployment executor.

## 2026-09-11 — Pending-product Barcode label included helper text

- Stage: Purchase Receiving line preparation, invoice 16845, line 1/15.
- Symptom: Playwright timed out on `.product-image-chooser-modal.getByLabel("Barcode optional", { exact: true })`.
- Root cause: the `<label>` contains both the visible `Barcode optional` text and nested helper `<small>` text, so the input's accessible name is longer than exactly `Barcode optional`.
- Current-source evidence: the barcode input has a dedicated `data-scanner-capture="barcode"` attribute intended for scanner capture.
- Resolution: select `input[data-scanner-capture="barcode"]` inside the pending-product modal and assert exactly one match before filling the synthetic EAN-13.
- Permanent prevention:
  - Do not use an exact accessible-name selector when a WineShopPOS label contains nested helper text that contributes to the accessible name.
  - Prefer stable application-specific semantic attributes such as `data-scanner-capture="barcode"` for scanner fields.
  - Keep an exactly-one locator guard before any barcode assignment.
- Safe continuation: invoice 16845 remains unreceived; Product Master/inventory were not committed. Reuse the same 32 synthetic EAN-13 QA barcodes.
- Classification: test-runner selector defect, not application failure.

## 2026-09-11 — Supplier auto-confirm path hid Existing Supplier selector

- Stage: Real Invoice OCR UAT, invoice B-3339.
- Symptom: Playwright timed out waiting for `Existing Supplier`.
- Root cause: current V5 automatically confirms a supplier when exactly one 100% supplier match is found. In that state, `confirmedSupplier` is set and the `Existing Supplier` selector is intentionally not rendered.
- Resolution:
  - wait for either `Confirmed supplier:` or the `Existing Supplier` selector;
  - if V5 auto-confirms, verify the confirmed supplier matches the expected physical-invoice supplier and continue;
  - only use the dropdown/create-supplier flow when the auto-confirm state does not appear.
- Permanent prevention:
  - E2E tests must model mutually exclusive UI states instead of assuming one control always appears.
  - For supplier confirmation, treat `AUTO_CONFIRMED`, `EXISTING_SELECTOR`, and `CREATE_SUPPLIER` as valid branches.
  - Verify the supplier identity before proceeding in every branch.
- Safe continuation:
  - Invoice 16845 had already PASSed, including duplicate/idempotency protection.
  - B-3339 failed before Receive Stock.
  - Future reruns must revalidate already-received invoices and skip the receive mutation instead of requiring all test invoices to be new.
- Classification: test-runner state-model defect, not WineShopPOS application failure.

## 2026-09-11 — Master UAT rerun must resume after partial success

- Stage: Full three-invoice sequence after 16845 successfully received and B-3339 later failed.
- Risk: a naïve rerun would fail `target must be new` checks for 16845 or, worse, attempt to process a successful invoice twice.
- Resolution: if a target invoice already exists exactly once in DEV, revalidate its purchase total, purchase items, barcodes/product identities, stock movements, linked RECEIVED invoice evidence, and duplicate-file protection, then skip all receipt mutation for that invoice.
- Permanent prevention:
  - destructive multi-stage UAT must be resumable and idempotent at every completed checkpoint;
  - successful earlier stages become `REVALIDATED_ALREADY_RECEIVED`, not errors;
  - never receive the same physical invoice a second time during continuation.
- Classification: UAT continuation/resume rule.

## 2026-09-11 — Premature server READY_TO_RECEIVE assertion after final UI mutations

- Stage: Purchase Receiving normalization, invoice B-3339 after all 14 lines were prepared.
- Symptom: UI preparation completed, but the runner immediately read `invoice_ingestions.review_status=NEEDS_REVIEW` and failed because it expected `READY_TO_RECEIVE`.
- Current V5 behavior: Purchase Receiving computes `ready` from the current React state, then autosaves the authoritative server draft through a 700 ms debounce. The sync badge can still show an older `SYNCED` state briefly after the latest mutations.
- Root cause: the runner treated a visible `SYNCED` badge as proof that the final READY draft had already completed its debounced server save.
- Resolution:
  - require the current UI footer to show `Ready to Receive`;
  - then poll the authoritative ingestion row for up to 30 seconds until `READY_TO_RECEIVE`;
  - fail immediately if `SYNC ERROR` appears;
  - only after the server reaches READY require the UI sync badge to be `SYNCED`;
  - verify the online SYNCED strip does not regress to showing the global local-draft count.
- Permanent prevention:
  - never use a stale/previous UI sync label as the sole synchronization primitive after mutations;
  - for debounced persistence, assert local/UI readiness first and then poll the authoritative backend state;
  - distinguish eventual-consistency settling from a real application failure.
- Safe continuation:
  - Invoice 16845 remains PASS and must only be revalidated on rerun.
  - B-3339 was not received; Approve & Receive Stock was not clicked.
  - Resume the existing B-3339 NEEDS_REVIEW ingestion with R8 or later.
- Classification: test-runner synchronization defect unless the server still remains NEEDS_REVIEW after the new 30-second settle window while the UI is Ready to Receive.

## 2026-09-11 — Fresh OCR supplier-state locator was not source-scoped

- Stage: Fresh OCR flow, invoice 16805.
- Symptom: runner reported that neither auto-confirmed supplier state nor Existing Supplier selector became visible.
- Current V5 source contract: once `result` exists, the `1. Confirm Supplier` panel renders exactly one of two branches: a success message for `confirmedSupplier`, or a supplier `<select>` with Use Existing/Create Supplier controls.
- Root cause: runner still depended on page-global text/accessibility matching instead of scoping to the current V5 supplier panel; it also started supplier interaction as soon as the panel heading appeared rather than waiting for `analyze()` to finish its metadata/product/supplier work.
- Resolution:
  - scope supplier state detection to the panel containing heading `1. Confirm Supplier`;
  - identify the fallback supplier control by the panel's single `<select>` rather than `getByLabel("Existing Supplier")`;
  - wait for the Analyze button to return from `Analyzing...` to `Analyze Invoice` before supplier interaction;
  - if neither branch exists, include the actual supplier-panel text in the failure so the next failure can be classified as app-state vs harness-state.
- Permanent prevention:
  - scope E2E selectors to the owning feature panel/modal;
  - do not depend on page-global accessible names for state machines with mutually exclusive branches;
  - wait for feature-level async completion, not just first render of a heading.
- Safe continuation:
  - 16845 PASS and B-3339 PASS must be revalidated only on rerun;
  - 16805 was not received and can safely resume or re-run OCR evidence.
- Classification: test-runner state/selector defect unless the source-scoped R9 diagnostic proves the V5 panel itself violates its two-branch render contract.

## 2026-09-11 — Invoice 16805 lost one physical OCR line

- Stage: Real OCR/UAT for Metri Spirits invoice 16805.
- Symptom: existing DEV OCR evidence contains **2 normalized item lines**, while the physical invoice visibly contains **3 product rows**.
- Expected physical rows:
  1. DING DONGS FORTIFIED WINE
  2. DYNAMITE XXX FORTIFIED WINE
  3. GO LIMLET FORTIFIED WINE
- Printed commercial values: each row MRP 60, rate about 2637.30, line amount 2637; product subtotal 7911; printed invoice total 8044.
- Classification: **application/OCR data defect**, not a Playwright locator/timing defect, if `invoice_ingestions.normalized_invoice.items` is confirmed to contain only two rows.
- Safety:
  - do not receive invoice 16805 while a physical line is missing;
  - preserve original evidence/ingestion;
  - do not delete and recreate the ingestion merely to make UAT pass;
  - PROD remains untouched.
- Diagnostic: run `DIAGNOSE_V5_16805_OCR.sh` and capture the stored normalized items and review draft.
- Fix decision:
  - OCR output has 2 → repair OCR/table extraction or normalization;
  - OCR output has 3 but stored normalized invoice has 2 → repair persistence;
  - normalized invoice has 3 but receiving has 2 → repair draft/receiving hydration.
- Permanent prevention: invoice 16805 becomes a permanent 3-row regression fixture; certification must require all three lines before receive.
- Safe continuation: 16845 and B-3339 remain PASS/revalidate-only. Stop full certification at 16805 until this defect is diagnosed and fixed.
