# V5 Security / Promotion Status

Status: **CURRENT V5 PROD-PROMOTION SECURITY INDEX**

## Current controls

- V5/non-main is DEV/QA only; `main` is PROD only.
- browser authorization is not trusted as the sole control; stock-changing
  operations are enforced through server/database authorization and transactions.
- shop isolation is based on authenticated user/shop membership.
- Product Master identity guards validate barcode and size server-side during
  atomic receiving.
- purchase-originated Product Master/barcode creation rolls back when the
  purchase transaction fails.
- completed purchase corrections are audited and protect consumed FIFO history.
- paired phone scanning transmits barcode values only; the authenticated PC keeps
  billing/stock authority.
- offline purchase recovery is encrypted locally; online server draft remains
  authoritative.
- automatic Product Image workflow is independent of inventory identity.
- no paid image/enrichment provider is silently enabled.

## Mandatory PROD promotion gates

- compare exact `main..V5` changes.
- reconcile migration list against live PROD; no blind migration push.
- use PROD Supabase/API values only for the main build.
- fail if DEV Supabase ref `juhcypzoacauzmtzqnwd` appears in PROD artifact.
- fail if V5 DEV Invoice API appears in PROD artifact.
- preserve production frontend rollback before overwrite.
- verify authenticated role/shop/POS/purchase flows after deployment.
- record deployed SHA and artifact hash only after successful verification.

No V5 documentation-preparation step itself changes PROD.
