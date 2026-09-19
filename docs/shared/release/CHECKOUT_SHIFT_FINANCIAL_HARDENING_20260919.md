# Checkout / Shift / Financial Finalization Hardening — 2026-09-19

The hardened PROD backend is already live. This frontend release wires WineShopPOS
to its terminal-aware checkout and shift APIs without replaying any database
migration.

Key runtime rules:

- POS uses a stable browser terminal UUID plus a monotonic client sequence.
- New online checkout uses `complete_sale_safe_v2`.
- Recovery uses `resolve_checkout_v2`; ambiguous outcomes remain UNKNOWN.
- Logout/shop switching are blocked while checkout remains SUBMITTING/UNKNOWN.
- Offline sales preserve captured unit price and quantity and sync through
  `sync_offline_sale_v2`.
- Start Shift uses `open_shift_v2`, so historical `CLOSE_REQUIRED` shifts stay
  visible for reconciliation without becoming today's physical cash drawer.
- Shift close targets the exact shift through `request_shift_close_v3`.
- Manager/Admin can inspect financial-day completeness and progress a past day
  through `OPEN -> CLOSING -> RECONCILED -> FINAL`.
- FINAL is versioned; later legitimate financial changes require an explicit
  amendment reason/version.
