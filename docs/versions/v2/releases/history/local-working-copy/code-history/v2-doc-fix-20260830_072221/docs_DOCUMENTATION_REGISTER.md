# WineShopPOS — Documentation Register

**Current documentation generation: V2**

WineShopPOS maintains one canonical copy of each living document.

| Document | Status | Purpose |
| --- | --- | --- |
| `README.md` | CURRENT V2 | repository entry point |
| `docs/README.md` | CURRENT V2 | documentation index |
| `docs/PROJECT_CONTEXT.md` | CANONICAL CURRENT | current project/architecture state |
| `docs/HANDBOOK.md` | CANONICAL CURRENT V2 | engineering/operations handbook |
| `docs/USER_MANUAL.md` | CANONICAL CURRENT V2 | user manual |
| `docs/AI_PRODUCTION_BASELINE.md` | CANONICAL CURRENT | AI deployment/runtime state |
| `docs/DOCUMENTATION_REGISTER.md` | CANONICAL CURRENT | documentation map |
| `docs/chapters/V2-*` | CURRENT V2 HISTORY | V2 chapter-style implementation records |
| `docs/chapters/01-*...26-*` | HISTORICAL | original implementation history |
| `docs/v2/*` | V2 EXECUTION RECORD | V2 requirements/audit/evidence |
| `docs/code-history/*` | HISTORICAL BACKUP | prior versions of living docs |

## Update rule

When actual application functionality changes, update the same living documents:

- Project Context
- Handbook
- User Manual
- AI baseline when applicable
- relevant V2 chapter
- execution/audit record

Do not create parallel documents such as:

```text
HANDBOOK_V2.md
HANDBOOK_V3.md
USER_MANUAL_V2.md
USER_MANUAL_V3.md
```

The same documents evolve. Git and V2/V3 chapter records provide history.
