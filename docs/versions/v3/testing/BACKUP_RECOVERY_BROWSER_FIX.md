# V3 Backup & Recovery Browser Fix

Status: SOURCE_VERIFIED / HOSTED PREVIEW VERIFICATION PENDING

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
