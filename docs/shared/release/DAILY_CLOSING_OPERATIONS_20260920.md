# Daily Closing moved to Operations — 2026-09-20

Daily Closing is an operational end-of-day status/review function, not a report
or compliance feature. The navigation now places it under **Operations**.

The old `/reports/day-close` URL redirects to `/operations/daily-closing`.

The backend also now closes previous-day terminal watermarks at India midnight,
matching the shift hard stop. Five 19-Sep sales created before terminal-aware
checkout are preserved unchanged and acknowledged as legacy pre-terminal sales.
After this repair the 19-Sep day has zero open shifts, zero open terminals, zero
unacknowledged terminal-less sales, and is FINAL.
