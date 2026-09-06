# V4 Testing / UAT Status

Status: CURRENT V4 PRE-PROD TEST INDEX

## Runtime-qualified candidate

`81107e0833abe4d2c7a09d5bd0d75bb924b7634a`

## Final DEV gate

Top-level:
`PASS=18 WARN=0 FAIL=0 BLOCKERS=0`

Detailed V4 legal + three-client Realtime/concurrency/oversell UAT:
`PASS=26 WARN=0 FAIL=0`

Evidence:
`/e/WineShopPOS_RELEASE_EVIDENCE/V4_FINAL_PREPROD_GATE_20260906T080132Z`

The final gate verified, among other controls:

- V4 DEV binding and PROD-ref exclusion.
- main, V3 and V4 candidate immutability during UAT.
- legal notice disable/verification in DEV.
- three independent Realtime client subscriptions.
- stock propagation.
- concurrent quantity-two sale attempts at stock two produced exactly one
  success and one insufficient-stock block.
- inventory never became negative.
- synthetic sale cleanup and stock restoration.

## Automated suites

- `scripts/v4-commercial-readiness-regression.mjs`
- `scripts/v4-platform-control-ux-regression.mjs`
- `tests/e2e/v4-commercial-readiness.spec.mjs`

V4_14 is documentation/governance-only. It must prove runtime tree and build
artifact identity rather than re-running mutation-heavy UAT unnecessarily.
