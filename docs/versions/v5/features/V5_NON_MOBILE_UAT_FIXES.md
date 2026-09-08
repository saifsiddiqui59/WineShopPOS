# V5 UAT Fixes + Mobile Barcode Repair

Corrective batch from post-V5_11D human UAT. It includes the previously planned invoice/product fixes plus the failed mobile barcode scanner repair. Mobile product-photo capture is unchanged because it already passed UAT.

Implemented: enforced V5 QA badge on the V5 preview hostname; one safe transient OCR retry with HTTP/body detail when available; Sr No; automatic Size (ml); column selector; internally scrolling OCR table with sticky heading; Suggested Product Name; automatic first-time candidate image preview without silent attachment; hard Price/Bottle >= MRP blocker with pack suggestion; OCR date candidate picker; Product Master name/brand/size in the image chooser heading.

Mobile barcode scanning uses the browser-native BarcodeDetector when available and falls back to the already-installed free ZXing browser scanner. No new paid service, schema migration, Supabase Edge deployment, or PROD mutation is introduced.
