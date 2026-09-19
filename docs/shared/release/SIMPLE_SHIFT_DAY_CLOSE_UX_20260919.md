# Simple Shift + Separate Business Day Close UX — 2026-09-19

The Shift page is now focused only on cashier shift work:

- Start Shift
- Close Shift
- midnight-ended shift recovery
- Shift History
- Manager/Admin close approval

The Owner/Admin **Closing Cash Check: ON/OFF** control moved to Shop Settings,
matching the style of the printer setting.

Whole-shop **Close Business Day** moved to Reports → Day Close. The page exposes
one operator action while the backend continues to enforce the internal
OPEN → CLOSING → RECONCILED → FINAL lifecycle.

Three 18-Sep sales created before terminal-aware checkout were acknowledged in
the financial completeness model without assigning a fake terminal or modifying
their original sale rows. Their legacy status remains audit-visible and they no
longer block the day close.
