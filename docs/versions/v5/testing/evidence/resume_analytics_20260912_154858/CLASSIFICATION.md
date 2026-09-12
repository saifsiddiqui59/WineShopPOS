# Failure Classification — Reports Locator

- Classification: **HARNESS_REPORTS_SELECTOR_OUTDATED**
- Application defect serial: **none**
- Environment: **DEV / QA only**
- PROD mutation: **none**

## What passed before the failure

The same certification run already passed:

- DEV ADMIN authentication
- QA/DEV V5 environment guard
- all three golden invoice checks
- preserved 29-line large purchase state
- preserved POS/return certification
- targeted zero-variance shift close
- Owner Center headline metrics
- Owner Center graphs
- Inventory Intelligence
- Profit Intelligence
- Purchase Intelligence

## Failure

Playwright used:

`getByRole("heading", { name: "Reports" })`

The current Reports route legitimately renders multiple headings containing the word `Reports`, including:

- `Reports & Compliance`
- `Reports & Exports`

Playwright strict mode therefore rejected the ambiguous locator before any report business assertion ran.

## Harness correction

The certification must target the actual report page heading exactly:

`Reports & Exports`

The Reports validation was also updated to match the current consolidated Reports UI cards:

- Sales
- Purchases
- Expenses
- Inventory Cost

The obsolete `Potential Sales` and old `.stat-card` expectations are removed from the harness.

This is a test-harness compatibility issue, not an application defect.
