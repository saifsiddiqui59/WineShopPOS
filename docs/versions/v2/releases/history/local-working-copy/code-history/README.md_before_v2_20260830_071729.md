# WineShopPOS V2

Professional multi-shop wine-shop POS, inventory, purchasing, owner intelligence
and production AI assistance.

## Production

`https://wineshoppos.z29.web.core.windows.net/`

## Current source of truth

1. current `main`
2. current Supabase migrations/RPCs/RLS
3. verified deployment configuration
4. `docs/PROJECT_CONTEXT.md`
5. `docs/v2/`

Legacy Chapters 1–26 are retained as historical implementation records. They
are **not** the canonical current-state architecture.

## V2 execution

The V2 program is evidence-driven:

```text
EXTEND + VERIFY + FIX
```

not:

```text
REWRITE + DUPLICATE + HOPE
```

Start with:

- `docs/PROJECT_CONTEXT.md`
- `docs/v2/README.md`
- `docs/v2/MASTER_IMPLEMENTATION_SPECIFICATION_V2.md`
- `docs/v2/audit/`
