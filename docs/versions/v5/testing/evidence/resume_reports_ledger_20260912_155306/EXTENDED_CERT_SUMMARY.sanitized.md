# WineShopPOS V5 Extended Business Playwright Certification

**Final: PASS**

Run: resume_reports_ledger_20260912_155306
Started: 2026-09-12T19:53:09.933Z
Finished: 2026-09-12T19:53:39.544Z

## Checks

| Check | Status | Detail |
|---|---|---|
| Authentication / DEV ADMIN | PASS | shop <redacted-shop-id> |
| QA/DEV environment badge | PASS | V5 NOT PROD |
| Golden 16845 | PASS | RECEIVED once · 15 lines · 996 bottles |
| Golden B-3339 | PASS | 14 lines · exact 7 finance assertions · MATCH · received once |
| Golden 16805 | PASS | 3 rows · unsafe finance blocked · zero purchase mutation |
| Prior analytics certification | PASS | Owner Center / Inventory Intelligence / Profit Intelligence / Purchase Intelligence passed in Git-evidenced run resume_analytics_20260912_154858 |
| Reports business values | PASS | Sales / Purchases / Expenses / Inventory Cost match authoritative DEV data |
| Final inventory ledger equality | PASS | inventory 1558 = net stock movements 1558, per product |

## Golden invoices

```json
{
  "16805": {
    "ingestionId": "7dbe360d-decf-4371-9ee3-301e501e1ef3",
    "status": "NEEDS_REVIEW",
    "purchaseId": null,
    "items": 3,
    "finance": {
      "subtotal": 7911,
      "cashDiscount": 95,
      "invoiceDiscount": 0,
      "freight": 66,
      "fees": 5,
      "tcs": 158,
      "total": null,
      "reconciliationStatus": "REVIEW_PRINTED_TOTAL_UNREADABLE",
      "printedTotalEvidenceStatus": "LABELED_TOTAL_UNREADABLE",
      "itemCount": 3,
      "resolutionAssist": {
        "aiCalled": true,
        "aiReason": "AI_PROVIDER_EMPTY_OUTPUT",
        "mappings": [
          {
            "value": 158,
            "source": "DETERMINISTIC",
            "applied": true,
            "rawLabel": "TCS (+)",
            "rawValue": "158,00",
            "targetId": "finance:tcs",
            "evidenceId": "kv:25",
            "fieldScope": "FINANCE",
            "canonicalField": "tcs",
            "semanticStatus": "KNOWN"
          }
        ],
        "attempted": true,
        "costPolicy": "MEMORY_FIRST_ONE_AI_CALL_MAX_NO_IMAGE",
        "memoryHits": 0,
        "unresolved": [
          {
            "reason": "FINANCE_REVIEW_PRINTED_TOTAL_UNREADABLE",
            "targetId": "finance:cash_discount",
            "fieldScope": "FINANCE",
            "canonicalField": "cash_discount"
          },
          {
            "reason": "FINANCE_REVIEW_PRINTED_TOTAL_UNREADABLE",
            "targetId": "finance:invoice_discount",
            "fieldScope": "FINANCE",
            "canonicalField": "invoice_discount"
          },
          {
            "reason": "FINANCE_REVIEW_PRINTED_TOTAL_UNREADABLE",
            "targetId": "finance:freight",
            "fieldScope": "FINANCE",
            "canonicalField": "freight"
          },
          {
            "reason": "FINANCE_REVIEW_PRINTED_TOTAL_UNREADABLE",
            "targetId": "finance:transport",
            "fieldScope": "FINANCE",
            "canonicalField": "transport"
          },
          {
            "reason": "FINANCE_REVIEW_PRINTED_TOTAL_UNREADABLE",
            "targetId": "finance:handling",
            "fieldScope": "FINANCE",
            "canonicalField": "handling"
          },
          {
            "reason": "FINANCE_REVIEW_PRINTED_TOTAL_UNREADABLE",
            "targetId": "finance:loading_unloading",
            "fieldScope": "FINANCE",
            "canonicalField": "loading_unloading"
          },
          {
            "reason": "FINANCE_REVIEW_PRINTED_TOTAL_UNREADABLE",
            "targetId": "finance:fees",
            "fieldScope": "FINANCE",
            "canonicalField": "fees"
          },
          {
            "reason": "FINANCE_REVIEW_PRINTED_TOTAL_UNREADABLE",
            "targetId": "finance:tcs",
            "fieldScope": "FINANCE",
            "canonicalField": "tcs"
          },
          {
            "reason": "FINANCE_REVIEW_PRINTED_TOTAL_UNREADABLE",
            "targetId": "finance:other_addition",
            "fieldScope": "FINANCE",
            "canonicalField": "other_addition"
          },
          {
            "reason": "FINANCE_REVIEW_PRINTED_TOTAL_UNREADABLE",
            "targetId": "finance:rounding",
            "fieldScope": "FINANCE",
            "canonicalField": "rounding"
          },
          {
            "reason": "FINANCE_REVIEW_PRINTED_TOTAL_UNREADABLE",
            "targetId": "finance:invoice_total",
            "fieldScope": "FINANCE",
            "canonicalField": "invoice_total"
          }
        ],
        "memoryError": null,
        "appliedCount": 1,
        "suggestedCount": 0,
        "deterministicHits": 1,
        "novelSuggestionCount": 0,
        "requiresHumanConfirmation": true
      }
    }
  },
  "16845": {
    "ingestionId": "3b09a364-2a07-42c9-9103-e54b5d90e5ea",
    "purchaseId": "5dc5b49c-3c45-486a-bcd4-367961baa2ef",
    "status": "RECEIVED",
    "items": 15,
    "bottles": 996
  },
  "B-3339": {
    "ingestionId": "6f02ae18-f212-4894-ada3-855f271ea66b",
    "purchaseId": "21829f6d-5951-4ed6-bc75-3be9197053dc",
    "status": "RECEIVED",
    "items": 14,
    "bottles": 540,
    "finance": {
      "subtotal": 86715,
      "cashDiscount": 599,
      "invoiceDiscount": 0,
      "freight": 700,
      "fees": 5,
      "tcs": 1737,
      "total": 88558,
      "reconciliationStatus": "MATCH",
      "printedTotalEvidenceStatus": "LABELED_TOTAL_RELIABLE",
      "itemCount": 14,
      "resolutionAssist": {
        "aiCalled": false,
        "aiReason": "AI_NOT_NEEDED",
        "mappings": [
          {
            "value": 599,
            "source": "DETERMINISTIC",
            "applied": true,
            "rawLabel": "(+)CD",
            "rawValue": "599",
            "targetId": "finance:cash_discount",
            "evidenceId": "summary:2:r1:c2",
            "fieldScope": "FINANCE",
            "canonicalField": "cash_discount",
            "semanticStatus": "KNOWN"
          },
          {
            "value": 0,
            "source": "DETERMINISTIC",
            "applied": true,
            "rawLabel": "(-)DISCOUNT",
            "rawValue": "0",
            "targetId": "finance:invoice_discount",
            "evidenceId": "summary:2:r1:c1",
            "fieldScope": "FINANCE",
            "canonicalField": "invoice_discount",
            "semanticStatus": "KNOWN"
          },
          {
            "value": 700,
            "source": "DETERMINISTIC",
            "applied": true,
            "rawLabel": "(+)FREIGHT",
            "rawValue": "700",
            "targetId": "finance:freight",
            "evidenceId": "summary:2:r1:c3",
            "fieldScope": "FINANCE",
            "canonicalField": "freight",
            "semanticStatus": "KNOWN"
          },
          {
            "value": 5,
            "source": "DETERMINISTIC",
            "applied": true,
            "rawLabel": "(+)TP FEES",
            "rawValue": "5",
            "targetId": "finance:fees",
            "evidenceId": "summary:2:r1:c4",
            "fieldScope": "FINANCE",
            "canonicalField": "fees",
            "semanticStatus": "KNOWN"
          },
          {
            "value": 1737,
            "source": "DETERMINISTIC",
            "applied": true,
            "rawLabel": "TCS+EC+SC",
            "rawValue": "1737",
            "targetId": "finance:tcs",
            "evidenceId": "summary:2:r3:c2",
            "fieldScope": "FINANCE",
            "canonicalField": "tcs",
            "semanticStatus": "KNOWN"
          },
          {
            "value": 0,
            "source": "DETERMINISTIC",
            "applied": true,
            "rawLabel": "Aux Charges",
            "rawValue": "0",
            "targetId": "finance:other_addition",
            "evidenceId": "summary:2:r1:c5",
            "fieldScope": "FINANCE",
            "canonicalField": "other_addition",
            "semanticStatus": "KNOWN"
          },
          {
            "value": 88558,
            "source": "DETERMINISTIC",
            "applied": true,
            "rawLabel": "Outstanding:",
            "rawValue": "88,558.00",
            "targetId": "finance:invoice_total",
            "evidenceId": "kv:31",
            "fieldScope": "FINANCE",
            "canonicalField": "invoice_total",
            "semanticStatus": "KNOWN"
          }
        ],
        "attempted": true,
        "costPolicy": "MEMORY_FIRST_ONE_AI_CALL_MAX_NO_IMAGE",
        "memoryHits": 0,
        "unresolved": [],
        "memoryError": null,
        "appliedCount": 7,
        "suggestedCount": 0,
        "deterministicHits": 7,
        "novelSuggestionCount": 0,
        "requiresHumanConfirmation": true
      }
    }
  }
}
```

## Large purchase

```json
{}
```

## Owner analytics

```json
{
  "ownerCenter": {},
  "inventoryIntelligence": {},
  "ownerProfit": {},
  "purchaseIntelligence": {},
  "reports": {
    "salesTotal": 2680,
    "purchaseTotal": 91660.24,
    "expenseTotal": 0,
    "inventoryCost": 266259.2528570001,
    "bills": 11,
    "purchases": 2,
    "activeExpenses": 0
  }
}
```

## Browser console errors

- Failed to load resource: the server responded with a status of 401 ()
- Failed to load resource: the server responded with a status of 401 ()

## Failed requests

- net::ERR_ABORTED https://juhcypzoacauzmtzqnwd.supabase.co/rest/v1/
- net::ERR_ABORTED https://juhcypzoacauzmtzqnwd.supabase.co/rest/v1/
