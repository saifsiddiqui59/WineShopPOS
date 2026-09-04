# V3 Architecture Documentation

## Required views

### 1. Goals / constraints
Business goals, shop workflow constraints, environment constraints and quality goals.

### 2. System context
C4 System Context:
- WineShopPOS users,
- WineShopPOS frontend,
- Supabase,
- Azure invoice backend,
- Azure Document Intelligence,
- AI Owner Assistant,
- external product catalogues,
- hardware/browser environment.

### 3. Containers
C4 Container view:
- React/Vite web app,
- Supabase/Postgres/Auth/Storage/Edge Functions,
- Azure Functions,
- Azure Document Intelligence,
- AI Function/Foundry,
- browser IndexedDB/session/local storage.

### 4. Components
Document only components that materially help maintenance.

### 5. Runtime scenarios
At minimum:
- login,
- POS sale,
- offline sale/sync,
- receive purchase,
- invoice OCR review,
- stock count,
- return/void,
- shift close,
- AI question.

### 6. Deployment
DEV vs PROD deployment view and isolation boundaries.

### 7. Cross-cutting concepts
- multi-shop isolation,
- transaction-safe stock changes,
- authentication/authorization,
- offline/cache,
- audit,
- time zone,
- error handling,
- product images,
- invoice ingestion,
- AI authorization.

### 8. Decisions
Use ADRs in `architecture/decisions/`.

### 9. Quality / risks
Security, correctness, inventory integrity, recoverability, observability and performance.
