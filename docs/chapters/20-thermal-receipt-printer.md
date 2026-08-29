# Chapter 20 — Thermal Receipt Printer

Status: Implemented in Chapters 16–26 production-expansion release.

## Goal
Produce a clean 80mm/58mm thermal receipt from the static web application.

## Implementation
- `Receipt80mm.jsx` renders invoice, store header, lines, totals and payment.
- print CSS uses `@page` and thermal widths.
- Printer Settings stores address, phone, registration text, footer and 58/80mm paper width.

## Important browser boundary
The production frontend is an Azure Blob static website. It can open the browser print dialog and print to an installed USB/Bluetooth thermal printer. It cannot safely guarantee silent raw ESC/POS access for arbitrary printers. Silent printing would require a trusted local bridge/native helper or vendor-specific WebUSB integration.

## Tests
Install printer in Windows; open invoice → Print Receipt → choose printer → verify no clipping and correct width.
