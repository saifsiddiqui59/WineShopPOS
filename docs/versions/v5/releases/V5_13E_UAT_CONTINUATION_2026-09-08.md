# V5.13D UAT Continuation — 2026-09-08

Starting parent:

`59a800d043050e8566adb7a38377c537e221bd7f`

Purpose: close the next set of human UAT findings without changing PROD or
introducing a new paid service.

Scope:
- safe subcategory control replacing the failing datalist path;
- Product Image wording and same-flow first-time image selection/import;
- CAN -> 500 ml, otherwise 24-pack -> 330 ml, 12-pack -> 650 ml when explicit size is absent;
- reviewable auto pack suggestion when Price/Bottle >= MRP, warning under Bottles/Case;
- same inference consistency in Purchase Receiving Workspace;
- collapsible POS Mobile Barcode Scanner while retaining USB scanner behavior;
- canonical V5 current-state/continuation documentation.

No schema migration is required.
No Supabase Edge Function deployment is required.
No PROD deployment is permitted.
