# Automatic Daily Closing UI — 2026-09-19

The owner no longer performs a manual daily financial close.

At 12:00 AM IST the backend hard-stops the previous shift. When Closing Cash
Check is OFF, that shift is automatically CLOSED with closing cash explicitly
Not counted. When the setting is ON, the old shift becomes CLOSE_REQUIRED, but
it never blocks starting the new day's shift.

Completed financial days are checked and finalized automatically by the backend.
Reports → Daily Closing is status/review only and has no manual Close Business
Day action.
