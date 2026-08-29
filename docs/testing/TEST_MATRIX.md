# WineShopPOS Test Matrix

## Chapters 1–8

| Test | Expected |
|---|---|
| Vite starts | PASS |
| Production build | PASS |
| Barcode scan | Product enters cart |
| Repeated scan | Quantity increases |
| Out-of-stock check | Sale prevented |
| Sale completion | Sale stored |
| Sale stock update | Inventory decreases |
| Receive Stock | Inventory increases |
| Case conversion | Cases converted to bottles |
| Purchase history | Persists after refresh |
| Add Product | New product persists |
| Opening Stock | Inventory created |
| Duplicate barcode | Rejected |
| Duplicate SKU | Rejected |
| Edit Product | Data changes |
| Edit Product inventory | Stock unchanged |
| Deactivate Product | Product becomes inactive |
| Inactive POS | Product unavailable |
| Inactive Purchases | Product unavailable |

## Chapter 9

| Test | Expected |
|---|---|
| Cash sale | Invoice created |
| UPI sale | Invoice created |
| Card sale | Invoice created |
| Discount | Total reduced correctly |
| Invalid discount | Sale rejected |
| Payment reference | Saved on invoice |
| Sales History | Sale visible |
| Invoice View | Items/totals visible |
| Print Preview | Browser print opens |

## Chapter 10

| Test | Expected |
|---|---|
| Dashboard sales | Reflects today's sales |
| Bills | Today's bill count |
| Payment KPIs | Cash/UPI/Card totals |
| Top products | Based on sold quantity |
| Low stock | Correct products shown |
| Inventory valuation | Purchase-price valuation |

## Chapter 11

| Test | Expected |
|---|---|
| Date filter | Sales/purchases filtered |
| Product report | Units/revenue calculated |
| Category report | Category totals calculated |
| Payment report | Payment totals calculated |
| Inventory report | Current quantities shown |
| Low stock report | Correct threshold |
| Purchase report | Purchases shown |
| Margin estimate | Development calculation |

## Chapter 12

| Test | Expected |
|---|---|
| Export backup | JSON downloaded |
| Backup contains products | Yes |
| Backup contains inventory | Yes |
| Backup contains sales | Yes |
| Backup contains purchases | Yes |
| Import valid backup | Data restored |
| Import invalid JSON | Rejected |
| Import invalid WineShopPOS file | Rejected |
| Reset Demo | Seed state restored |

## Regression

After Chapters 9–12:

1. scan `8900000010016`
2. complete a sale
3. confirm stock decreased
4. receive stock
5. confirm stock increased
6. create a product
7. refresh browser
8. confirm product remains
9. export backup
10. create another sale
11. import earlier backup
12. confirm earlier state is restored
13. run `npm run build`

All above should pass before starting database chapters.
