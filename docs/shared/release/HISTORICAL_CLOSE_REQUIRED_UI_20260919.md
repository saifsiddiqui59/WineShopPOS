# Historical CLOSE_REQUIRED UI — 2026-09-19

`CLOSE_REQUIRED` is an explicit reconciliation state for a shift whose India
business date ended without an approved close.

The backend already supported closing a specific historical shift through
`request_shift_close_v3`, but the Shift History UI did not expose the required
Actual Cash input or action.

This release adds, for an authorized historical `CLOSE_REQUIRED` row:

- **Historical Actual Cash** input;
- **Request Reconciliation Close** button;
- transition to `CLOSE_REQUESTED`;
- existing Manager/Admin variance review and **Approve Close** to `CLOSED`.

WineShopPOS does not auto-fill Actual Cash from Expected Cash. The entered value
must be the real physical count known for that drawer. If it is no longer known,
do not invent a number.
