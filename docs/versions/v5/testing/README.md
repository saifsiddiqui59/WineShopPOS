# V5 Testing / UAT / Qualification Status

Status: **CURRENT V5 PROD-PROMOTION TEST INDEX**

## Runtime-qualified candidate

`92d68ceac8fb5cef00e82d0a8eef7035edd8513d`

V5_29W terminal evidence reported:

- `CLEAN_SNAPSHOT_DRY_RUN=PASS`
- `FULL_TEST_BUILD_ENV=PASS`
- `V5_PUSH=PASS`
- `QA_DEPLOY=PASS`
- `PUBLIC_QA_RUNTIME=PASS`

That evidence qualifies the automated/build/public-QA transport stage for the
V5_29 runtime candidate. It does not convert source/static tests into human UAT.

## Test layers

1. unit/contract/static regression tests;
2. full Node test suite + lint/build/environment guard;
3. clean-snapshot patch validation for release executors;
4. public QA asset/runtime marker verification;
5. browser/Playwright workflow tests where available;
6. human UAT for camera/phone hardware, layout comfort and business workflow.

## V5_29 manual UAT

Manual UAT should explicitly confirm:
- Inventory paired-phone scan fills/filter search.
- focused Inventory search accepts USB/Bluetooth keyboard-wedge scanning.
- Current Stock has the intended larger desktop area.
- Purchase Receiving shows one `Confirm Pack`.
- unchanged vs changed pack keeps the correct internal audit classification.
- completed Purchase Verification presents the clear completion state and Posted
  Purchase Lines as the normal view.
- OCR/correction/landed-cost evidence stays behind Audit / Correction Tools.

Do not label manual UAT `PASS` merely because automated tests/build passed.

## Promotion requirement

The PROD promotion executor must rerun non-mutating source/build/environment
gates using the final promotion source, then perform authenticated PROD smoke/UAT
after deployment.
