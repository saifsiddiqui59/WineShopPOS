# WineShopPOS Release Engineering

This directory is the cross-version production release entry point.

## Mandatory read order for V4+

1. `RELEASE_EXECUTOR_FAILURE_REGISTER.md`
2. `END_TO_END_RELEASE_TESTING_AND_PROMOTION_PLAYBOOK.md`
3. `../../versions/v3/releases/V3_TO_PROD_RELEASE_RETROSPECTIVE_2026-09-05.md`

## Roles

- Failure register: permanent failure classes/prevention.
- Playbook: reusable E2E release state machine.
- Retrospective: release-specific history and lessons.

Do not merge these roles. Procedure and historical evidence have different lifecycles.

Canonical rule:

`CURRENT SOURCE + CURRENT MIGRATIONS + VERIFIED DEPLOYMENT > OLD DOCUMENTATION`

Every continuation must re-read live state.
