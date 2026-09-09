# V5.21 — Mobile camera startup non-blocking UAT repair

Date: 2026-09-09
Starting SHA: `36716db47ffd842291a9ffe27a4180ef11758590`
Environment: V5 DEV/QA only

Human UAT found the simplified scanner could remain at `Opening camera…`.

V5.21 makes MediaStream attachment the only blocking startup requirement and starts
the local ZXing frame loop immediately. Autoplay completion, focus/zoom tuning,
rear-camera refinement, device enumeration and native BarcodeDetector setup are
best-effort asynchronous enhancements.

A 7-second watchdog converts a startup/permission stall into ERROR + Retry.

Frontend only. No Azure Function App, Supabase Edge Function, schema or PROD change.
