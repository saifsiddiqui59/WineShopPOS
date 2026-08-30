# Supplier Master + OCR Supplier Confirmation Patch

Date: 2026-08-30

## Purpose

Close the supplier-management gap in Purchases & Suppliers without changing the existing transaction-safe purchasing/inventory engine.

## Added

- Dedicated Supplier Master under Purchases & Suppliers.
- Create, edit, deactivate and reactivate supplier actions for ADMIN/MANAGER.
- Inline `+ New Supplier` and `Edit Selected Supplier` actions in Purchase Order creation.
- Duplicate-name guard during supplier creation/edit.
- OCR supplier review step before an OCR purchase draft can continue.
- OCR matching against existing active suppliers using normalized name similarity.
- `Create Supplier From Invoice` with OCR-prepopulated vendor name, vendor address and vendor tax ID when Azure returns them.
- Human confirmation is mandatory; OCR never silently inserts a supplier.

## Security

No new database tables or RLS policies were needed. Existing supplier RLS remains authoritative: ADMIN/MANAGER may manage suppliers for the active shop; CASHIER cannot access the purchasing module.

## Transaction Safety

No stock-changing logic was modified. PO receiving and purchase receipt continue to use controlled Supabase RPCs. Supplier creation itself does not alter inventory.

## Smoke Tests

1. ADMIN/MANAGER opens Purchases & Suppliers → Suppliers.
2. Create a supplier; verify it appears in Supplier Master and the PO supplier dropdown.
3. Edit supplier details; verify changes persist after refresh.
4. Deactivate supplier; verify it is excluded from new PO selection but history remains.
5. In Procurement, click `+ New Supplier`, save, and verify it becomes selected in the current draft PO.
6. Select an existing supplier and click `Edit Selected Supplier`.
7. OCR an invoice from an existing supplier; verify a match is suggested but not automatically committed.
8. Confirm existing OCR supplier; verify the reviewed draft can continue.
9. OCR an invoice from a new supplier; click `Create Supplier From Invoice`; review vendor name/address/tax ID; create and continue.
10. Confirm stock does not change until the normal Receive Stock confirmation/RPC succeeds.
11. Confirm CASHIER cannot access Purchases & Suppliers/Supplier Master.

