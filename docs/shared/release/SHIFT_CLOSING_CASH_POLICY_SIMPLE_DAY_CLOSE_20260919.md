# Shift Closing Cash Policy + Simple Business Day Close — 2026-09-19

## Shift closing cash

Owner/Admin can choose whether closing cash is **Mandatory** or **Optional**.

- Mandatory: cashier must enter the physical closing cash count before requesting close.
- Optional: cashier may leave closing cash blank. Expected Cash is still calculated,
  while Actual Cash and Difference remain blank unless a physical count is entered.
- Only ADMIN can change the policy.
- Manager/Admin approval of the shift remains required.

## Midnight behavior

WineShopPOS does **not** silently mark a shift CLOSED at midnight, because doing
so would invent a physical cash count and approval.

When the India business date changes, an unfinished shift becomes
`CLOSE_REQUIRED` when the backend is next reached. The next day's shift can be
opened separately.

## Business Day Close

The backend still uses `OPEN -> CLOSING -> RECONCILED -> FINAL`, but the normal
Manager/Admin UI exposes one **Close Business Day** action. Automatic checks run
before any final lock.

## Cross-day shift protection

PROD/QA now require an online sale to use an OPEN shift from the same India
business date. A stale older shift can no longer receive today's sale. Offline
sale lookup also matches the shift business date to the offline sale timestamp.
