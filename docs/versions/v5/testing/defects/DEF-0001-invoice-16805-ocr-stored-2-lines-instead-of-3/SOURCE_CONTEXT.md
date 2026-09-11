# DEF-0001 Source and Evidence Context

## Environment

- Repository: `saifsiddiqui59/WineShopPOS`
- Branch: `V5`
- DEV Supabase ref: `juhcypzoacauzmtzqnwd`
- PROD ref: `uiurgplnsgmawvxhjzzp`
- PROD must remain untouched.

## Original failing run

Evidence directory reported by the V5 UAT:

`C:\Users\Shoyeb\WineShopPOS_V5_UAT\20260911_072719`

The setup script copies available sanitized `.log`, `.json`, `.md`, and `.txt` files from that evidence directory into this defect folder. Binary screenshots/traces stay local; the manifest records their hashes.

## Important distinction

Earlier V5 automation failures were predominantly test-harness defects. They are kept separately under:

`docs/versions/v5/testing/harness/HARNESS_FAILURES.md`

They do not consume application defect serial numbers.

This DEF is a real persisted OCR-data mismatch discovered by the test.
