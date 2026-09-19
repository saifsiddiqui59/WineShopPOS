# Smart Purchase Alerts V1 — 2026-09-19

- PROD backend migration: `20260919200033_smart_purchase_alerts_v1`.
- ADMIN/owner only; default OFF.
- Existing Purchase Coach remains the demand source of truth.
- Fixed 4-day supplier lead time + 2-day safety window.
- Existing Draft/Approval/Sent/Partially Received POs are reconciled first.
- Grouped reminder at most once/hour unless snoozed 1 or 2 days.
- Alert layer never creates a PO directly; it opens Purchase Intelligence for review.
