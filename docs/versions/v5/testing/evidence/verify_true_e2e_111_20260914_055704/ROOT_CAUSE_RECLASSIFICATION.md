# Root-cause reclassification

The `verify_true_e2e_111_20260914_055704` run is reclassified from
`APP_DEFECT` to **HARNESS_FALSE_POSITIVE**.

The cashier direct-navigation test used a page-body substring check:
`body.includes("Products")`.

Current V5 intentionally protects `/products` with `RequireRole` for
ADMIN/MANAGER. A CASHIER is redirected to `/`, and `HomeRedirect` sends a
CASHIER to `/pos`.

The POS screen legitimately contains the text **Quick Products**, so the
body substring check cannot prove protected-route access.

Permanent rule:

1. Verify the final route/hash after direct navigation.
2. For CASHIER, protected management routes must end at `/#/pos`.
3. Verify the protected module heading is absent.
4. Verify restricted main-navigation links are absent.
5. Never infer authorization from a generic body substring such as
   `Products`, `Sales`, `Reports`, or `Inventory`.
