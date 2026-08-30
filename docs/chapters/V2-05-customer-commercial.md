# Chapter V2-05 — Customer Commercial

**Status: implemented in source; production verification required**

## N8 Customer Loyalty

- loyalty points ledger
- default earn rate: 1 point per ₹100
- default point value: ₹1
- default maximum redemption: 50% of eligible post-promotion amount
- points earned/redeemed are sale-linked and auditable
- manager/admin manual adjustments supported

## N9 Coupons / Promotions

- fixed or percentage benefit
- optional coupon code
- optional automatic promotion
- minimum purchase
- optional maximum discount
- validity dates
- total/per-customer usage limits supported by schema
- database revalidates eligibility at checkout

## N10 Gift Voucher / Store Credit

- customer store-credit ledger
- manager/admin store-credit grants
- bearer or customer-linked gift vouchers
- current voucher balance
- optional expiry
- sale-linked redemptions
- store credit and gift voucher are tracked as non-cash tender, not manual POS discount

## Checkout architecture

`complete_sale_v4` wraps the existing controlled `complete_sale_v3`.

The V3 sale/stock/override authorization remains authoritative.
Commercial benefits are applied atomically in the same database transaction.
