# V3 Backup & Recovery Browser Fix

Status: HOSTED_PREVIEW_VERIFIED

Baseline V3 SHA:
`cfee4ec016111ff34461bbaf688711c308b75596`

## Defect

`src/pages/BackupRecovery.jsx` ordered `backup_restore_tests` by
`tested_at`, while the current page/data contract uses the restore-test
timestamp through `test_date || created_at`.

The unsupported ordering caused Admin → Backup & Recovery to show the
restore-history load failure.

## Source fix

The query now orders by:

```text
created_at desc
```

No database migration is introduced.

## Browser regression hardening

The authenticated read-only Playwright suite now:
- preserves a configured preview sub-path such as `/v3-preview/`;
- opens `./#/admin/backup` for an ADMIN account;
- verifies the Backup & Recovery and Restore Test History headings;
- verifies the restore-history load error is absent.

## Release boundary

This change is source/test documentation only.

Hosted V3 preview deployment and authenticated hosted browser qualification
remain a separate next gate.

## Hosted verification — 2026-09-05

Preview application source SHA:
`10bac5ea4a0f038dde19494694b6d811eeb8766e`

Preview URL:
`https://wspv35c9453b6e9a1.z29.web.core.windows.net/v3-preview/`

Result:
- corrected Vite JavaScript API preview build verified;
- DEV ADMIN login: PASS;
- current UI-contract hosted Playwright suite: 7/7 PASS;
- skips: 0;
- flaky: 0;
- Backup & Recovery query/regression: PASS;
- Backup heading selector is scoped to level 2 because the shell and page
  intentionally share the same visible title.

The browser suite did not open a cashier shift, mutate a cart, complete a sale,
or perform another operational data mutation.
