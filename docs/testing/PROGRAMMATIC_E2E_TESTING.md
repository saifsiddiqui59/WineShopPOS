# WineShopPOS Programmatic End-to-End Testing

WineShopPOS now includes a Playwright browser smoke framework.

## Read-only E2E

Files:
- `playwright.config.mjs`
- `tests/e2e/read-only.spec.mjs`

Commands:
```text
npm run test:e2e:list
npm run test:e2e
npm run test:e2e:headed
```

Default target is the V3 preview.

Authenticated environment variables:
```text
E2E_BASE_URL=<preview URL>
E2E_EMAIL=<dedicated test user>
E2E_PASSWORD=<secret supplied through environment/CI secret>
E2E_PRODUCT_SEARCH=<optional stocked positive-price product>
E2E_EXPECT_ADMIN=1
```

Never commit credentials.

Current coverage:
1. Login page.
2. Core module navigation.
3. Friendly Invoice Inbox workflow labels.
4. POS cart persistence across Scanner Test navigation.
5. Admin Product Cleanup page load without deletion.

## Transactional E2E — next layer

True write-path testing should use a dedicated automated-test shop, not a real operating shop. It should cover product creation, purchase receiving, inventory increment, sale completion, FIFO allocation, stock decrement, invoice cancellation/reopen rules and protected product cleanup.

Recommended promotion gate:
```text
lint
build
OCR/barcode/FIFO regressions
Owner AI tests/checks
Playwright read-only E2E
transactional E2E in isolated test shop
```

## V3-07 sequential login resilience gate

The acceptance gate runs five fresh-browser login/no-refresh tests sequentially (`--workers=1 --repeat-each=5`) and then runs the full authenticated read-only suite.

The prior three-worker stress run discovered a backend JWT timing rejection and is retained as diagnostic evidence, not the normal-user acceptance pattern.
