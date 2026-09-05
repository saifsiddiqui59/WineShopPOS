# Chapter 25 — Offline POS

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Provide emergency selling after a device has already authenticated and cached the catalog.

## Client design
- service worker caches visited app resources.
- last cloud catalog/inventory is cached locally for emergency operation.
- offline sales are stored in IndexedDB.
- sale payload is encrypted with a non-extractable AES-GCM WebCrypto key stored in IndexedDB.
- every sale has a UUID `client_sale_id` for idempotency.

## Sync design
`sync_offline_sale` calls the server-side transaction. Supabase re-reads live product prices and locks current stock. If stock is insufficient or the shift is no longer valid, the item becomes CONFLICT rather than being forced into the database.

## Boundaries
- First-time/cold login still requires internet.
- Offline queue does not make supplier, user-management, returns or stock adjustments offline-capable.
- Cashier should sync before closing the shift.

## Tests
Load online → disconnect → create sale → queue shows PENDING → reconnect → Sync Now → inventory/sale appears once. Re-sync same client UUID must not duplicate.
