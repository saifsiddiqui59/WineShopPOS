# Q1 Period Filters — Production Release

Date: 2026-09-19

## Visible controls

Sales, Owner Center and Reports now expose:

`Today | Yesterday | 7D | 30D | MTD | Custom`

All presets use the India business date.

- Today = current India business date.
- Yesterday = previous India business date.
- 7D = today plus the previous 6 dates.
- 30D = today plus the previous 29 dates.
- MTD = first day of the current India month through today.
- Custom = explicit inclusive From/To dates.

## Sales

Sales no longer uses the browser's capped ShopContext sales cache for selected-period history.

`public.sales_period_page_v1` is server paginated and uses `wsp_business_date`.

Role scope:

- CASHIER: own sales only.
- MANAGER / ADMIN: whole current shop.
- VOID invoices remain visible in the operational Sales list with their status rather than disappearing.

PROD backend migration was already applied as:

`20260919105427_q1_period_sales_v1`

This frontend release does not replay it and does not use `supabase db push`.

## Owner Center

Owner Center defaults to Today and sends explicit `p_from` / `p_to` to `owner_center_summary`.

Period performance changes with the selector.

Current Inventory Cost and Low Stock remain current-state metrics.

Recommendations and loss/exceptions intentionally remain 30-day intelligence and are labelled `30D`.

## Reports

Reports now defaults to Today instead of MTD.

The selected preset drives analytics, report details and CSV/accountant exports together.

Existing aggregate/detail mismatch notices remain active.

## Scope boundary

This release adds the period-control UX and server-side Sales history path. It does not claim to complete the later append-only financial journal, FINAL-day lifecycle, terminal completeness or mixed-tender reversal phases.
