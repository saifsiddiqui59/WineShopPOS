# V3 API Automation Integration — Code History

Feature commit: `7dd99f21e03e79b17490c837cb1bd5d470823dca`

Generated from the actual post-preview feature commit.

```text
commit 7dd99f21e03e79b17490c837cb1bd5d470823dca
Author:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
AuthorDate: Mon Aug 31 06:52:31 2026 -0400
Commit:     saifsiddiqui59 <saifsiddiqui59@users.noreply.github.com>
CommitDate: Mon Aug 31 06:52:31 2026 -0400

    feat: add V3 invoice automation foundation

 .env.example                                       |   1 +
 azure-functions/v3-invoice-api/.funcignore         |   5 +
 azure-functions/v3-invoice-api/host.json           |   1 +
 azure-functions/v3-invoice-api/package-lock.json   | 914 +++++++++++++++++++++
 azure-functions/v3-invoice-api/package.json        |   9 +
 azure-functions/v3-invoice-api/src/index.js        |   1 +
 .../v3-invoice-api/src/invoiceStorage.js           |  18 +
 .../v3-api-automation/logic-app-email-intake.json  | 338 ++++++++
 .../logic-app-parameters.sample.json               |  14 +
 src/App.jsx                                        |   2 +
 src/config/navigation.js                           |   1 +
 src/lib/invoiceClient.js                           |   5 +
 src/pages/AutomationHub.jsx                        |  47 +-
 src/pages/InvoiceInbox.jsx                         |  21 +
 src/pages/Purchases.jsx                            |   7 +-
 .../functions/invoice-automation-ingest/index.ts   |  11 +
 ...1150000_v3_api_automation_invoice_ingestion.sql | 179 ++++
 17 files changed, 1562 insertions(+), 12 deletions(-)
 create mode 100644 azure-functions/v3-invoice-api/.funcignore
 create mode 100644 azure-functions/v3-invoice-api/host.json
 create mode 100644 azure-functions/v3-invoice-api/package-lock.json
 create mode 100644 azure-functions/v3-invoice-api/package.json
 create mode 100644 azure-functions/v3-invoice-api/src/index.js
 create mode 100644 azure-functions/v3-invoice-api/src/invoiceStorage.js
 create mode 100644 infra/v3-api-automation/logic-app-email-intake.json
 create mode 100644 infra/v3-api-automation/logic-app-parameters.sample.json
 create mode 100644 src/lib/invoiceClient.js
 create mode 100644 src/pages/InvoiceInbox.jsx
 create mode 100644 supabase/functions/invoice-automation-ingest/index.ts
 create mode 100644 supabase/migrations/20260831150000_v3_api_automation_invoice_ingestion.sql

```
