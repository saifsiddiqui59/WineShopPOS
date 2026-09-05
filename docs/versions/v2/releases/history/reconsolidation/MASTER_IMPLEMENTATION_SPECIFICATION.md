# WineShopPOS — MASTER IMPLEMENTATION PROMPT

## UX Consolidation + 24 Feature Architecture + PRO/PLUS Product Tiers + Safe Execution Workflow

You are acting as the senior software architect, senior React engineer, Supabase/PostgreSQL engineer, UX designer, QA engineer, and migration reviewer for the existing **WineShopPOS** application.

Your objective is to **consolidate and improve the existing application without breaking the currently working product**.

This is NOT a greenfield project.

This is NOT permission to rewrite the application.

The existing application already has substantial working functionality and must be treated as the foundation.

---

# 1. PRIMARY OBJECTIVE

Transform WineShopPOS into a clean, professional, ergonomic, production-grade liquor retail POS by:

1. preserving working functionality
2. consolidating scattered features
3. reducing navigation clutter
4. implementing genuinely missing features
5. completing partially implemented features
6. improving UX consistency
7. introducing clear CORE / PLUS / PRO product positioning
8. keeping LLM-dependent functionality deferred
9. preserving database integrity
10. protecting transaction-safe inventory operations.

The desired outcome is:

**Powerful backend + simple frontend experience.**

---

# 2. SOURCE OF TRUTH

Before making ANY change, inspect the current repository.

The repository and current migrations/code are the primary source of truth.

Do not assume documentation is fully current.

Inspect:

* current Git branch
* latest commits
* package.json
* src/
* src/pages/
* src/components/
* routing
* Supabase client/services
* supabase/migrations/
* RPCs
* RLS policies
* Edge Functions
* docs/
* existing tests
* Azure-related deployment files
* offline functionality
* OCR functionality.

Do not assume a feature is missing simply because this specification describes it.

For each requested capability first classify it as:

**EXISTING**

**PARTIAL**

**MISSING**

**NEEDS TESTING**

---

# 3. NON-NEGOTIABLE ARCHITECTURE RULE

## PRESERVE THE ENGINE — IMPROVE THE EXPERIENCE

Do not rewrite working backend logic merely because screens are being reorganized.

Existing working logic related to:

* sales
* purchases
* inventory
* stock movements
* payment recording
* authentication
* authorization
* RLS
* roles
* multi-shop
* returns
* refunds
* shifts
* stock count
* transfers
* audit
* OCR
* offline transactions

must be reused wherever possible.

Preferred transformation:

Existing component/page
→ reuse/refactor into reusable capability
→ expose through consolidated UI

Avoid:

Existing page
→ delete
→ rebuild everything.

---

# 4. CRITICAL TRANSACTION RULE

Any operation that changes stock must remain transaction-safe.

Examples:

Sale

Purchase receipt

Return

Stock adjustment

Transfer receive

Opening stock

Inventory update and stock movement must succeed or fail together.

React must NOT arbitrarily write:

`current_qty = X`

unless the existing controlled architecture explicitly permits it.

Prefer controlled RPC/backend transactions.

---

# 5. SUPABASE SECURITY RULE

Frontend filtering is NOT security.

All relevant business tables must enforce tenant/shop/user access through:

* Supabase RLS
* organization ownership
* shop ownership
* user role
* appropriate backend permissions.

For new tables consider:

* organization_id
* shop_id
* created_by
* created_at
* updated_at
* auditability.

Do not duplicate existing security concepts.

---

# 6. DATABASE CHANGE RULE

Before creating any table, column, enum, RPC or migration:

1. Search existing migrations.
2. Search existing schema.
3. Search existing RPCs.
4. Search existing components/services.
5. Determine whether an equivalent concept already exists.
6. Reuse existing structures whenever practical.

Do NOT casually create:

inventory_v2

sales_new

supplier_ledger_new

products2

or similar duplicate concepts.

New schema is acceptable only when genuinely required.

---

# 7. UX GOAL

WineShopPOS should feel like a mature commercial SaaS/POS product.

Use structural inspiration from mature enterprise applications such as:

* GitHub
* Databricks
* modern SaaS admin products

without copying their visual identity.

The goal is:

clean

predictable

efficient

professional

accessible

ergonomic.

---

# 8. ERGONOMIC PRINCIPLE

The user should see complexity only when they need it.

## CASHIER

Primary mental model:

**Scan → Cart → Pay → Print**

Cashier workflows should have:

* minimum clicks
* minimal navigation
* keyboard compatibility
* fast barcode input
* obvious totals
* obvious checkout action
* limited distractions.

Do NOT show unnecessary:

supplier analytics

profit intelligence

configuration

audit administration

compliance configuration

AI features

on the cashier's main workflow.

---

# 9. VISUAL DESIGN RULES

Use:

* consistent spacing
* consistent typography
* predictable layouts
* clear hierarchy
* restrained visual styling
* clean tables
* clear forms
* consistent status badges
* responsive behavior
* accessible contrast
* sensible empty states
* useful error states
* loading feedback.

Avoid:

* excessive gradients
* giant headings
* unnecessary cards
* random icon use
* different button styles between pages
* excessive animations
* cluttered dashboards
* 20-item sidebar navigation
* unnecessary modal dialogs.

---

# 10. APPLICATION SHELL

Use one consistent application shell.

Recommended main navigation:

1. **POS & Billing**
2. **Products**
3. **Purchases & Suppliers**
4. **Inventory**
5. **Operations**
6. **Owner Center**
7. **Reports & Compliance**
8. **Settings & Admin**

The future AI module must remain hidden until explicitly enabled.

---

# 11. TOP APPLICATION BAR

Top-left:

* sidebar collapse
* page title
* breadcrumb where useful.

Top-right:

* current shop selector when allowed
* online/offline status
* optional attention indicator
* user avatar.

Do not overload the top bar.

---

# 12. USER / ACCOUNT EXPERIENCE

The user/account area should follow the structural behavior of mature applications such as GitHub or Databricks.

Display the signed-in user's avatar/profile image in the top-right.

Clicking the avatar opens a compact account menu.

Example:

Profile Image

Muhammad Saif

ADMIN

Airoli Wine Shop

---

# 13. USER MENU

Include:

## My Profile

Display:

* avatar/profile image
* full name
* email
* phone if available
* role
* assigned/current shop
* organization
* account status
* last login if supported.

Allow safe profile fields to be edited.

Do not permit arbitrary identity/security-field editing.

---

## Account Settings

Possible fields:

* display name
* profile image
* phone
* default shop
* theme
* UI preferences.

---

## Security

Include where supported:

* change password
* sign out
* session information
* sign out other sessions.

Do not expose admin security controls to normal cashiers.

---

## Shop Context

If user has access to multiple shops:

allow ADMIN/MANAGER to switch shop where permitted.

Cashier should generally remain within assigned shop.

---

## Role

Clearly display:

ADMIN

MANAGER

CASHIER.

A user must never be able to change their own role from this menu.

---

## Help / About

Show:

* WineShopPOS version
* build/version information
* support information
* documentation link where available.

---

## Logout

Always appear at the bottom.

---

# 14. ROLE-BASED UX

## CASHIER

Likely access:

POS

active shift

sale lookup where permitted

returns where permitted

scanner

receipt printing

limited stock lookup.

Hide management functionality when it is irrelevant.

---

## MANAGER

Likely access:

cashier functions

purchases

suppliers

inventory

stock count

transfers

returns

approvals

shifts

operational reports

selected owner statistics.

---

## ADMIN / OWNER

Access:

all authorized functionality including:

users

shops

settings

Owner Center

profit intelligence

audit

security

compliance

backup configuration.

Prefer hiding unauthorized screens rather than simply disabling every menu item.

Backend authorization remains authoritative.

---

# 15. FINAL 24 CONSOLIDATED FEATURE GROUPS

The application functionality is consolidated into the following 24 groups.

These are feature groups.

They are NOT 24 sidebar items.

---

# MODULE 1 — POS & BILLING

## FEATURE 1 — FAST POS BILLING

Includes:

* physical barcode scanner
* global barcode capture
* manual product search
* barcode lookup
* cart
* quantity changes
* repeated scan increments quantity
* stock validation
* case/bottle support where appropriate
* price calculation
* role-based discount
* checkout
* keyboard-friendly billing.

Unknown barcode workflow:

Scan unknown barcode
→ Product Not Found
→ Add Product
→ barcode automatically prefilled.

Preserve existing working POS behavior.

---

## FEATURE 2 — SALES, PAYMENTS & RETURNS

Includes:

* sale creation
* sales history
* sale details
* Cash
* UPI
* Card
* payment reference
* return
* refund
* partial/full return where supported
* void
* reason capture
* inventory reversal
* manager approval where required.

### PAYMENT POLICY

Do NOT introduce payment gateway integration.

Cash/UPI/Card confirmation remains manually recorded by the operator.

No automatic bank/payment-provider verification is required in current scope.

---

# MODULE 2 — PRODUCTS

## FEATURE 3 — PRODUCT & BARCODE MANAGEMENT

Includes:

* product master
* add/edit
* barcode
* SKU
* brand
* category
* size
* case configuration
* bottles per case
* selling price
* active/inactive status.

Reuse existing product schema wherever possible.

---

## FEATURE 4 — RECEIPT & LABEL PRINTING

Includes:

* professional 80mm receipt
* receipt configuration
* printer setup
* print preview where useful
* barcode label generation
* barcode label printing.

Printer integration cannot be considered fully complete until tested against real hardware.

---

# MODULE 3 — PURCHASES & SUPPLIERS

## FEATURE 5 — SUPPLIER & PROCUREMENT

Includes:

* suppliers
* purchases
* purchase orders
* PO items
* approval
* receiving
* ordered vs received variance
* supplier payments
* supplier balance/outstanding
* purchase returns
* purchase history.

Preferred workflow:

Draft PO
→ Approve
→ Receive
→ Verify
→ Commit Stock
→ Update Supplier Balance.

Reuse current procurement functionality.

---

## FEATURE 6 — SMART PURCHASE INTELLIGENCE

### PRO FEATURE

No LLM required.

Includes:

## Invoice OCR

Invoice PDF/photo
→ Azure Document Intelligence
→ extraction
→ review
→ user confirms
→ controlled purchase transaction.

OCR MUST NEVER directly update stock without human confirmation.

---

## SKU Matching

Invoice description

→ known alias

→ product match.

Allow manual correction.

Persist confirmed aliases where appropriate.

---

## Purchase Price Intelligence

Show:

Previous Purchase Price

Current Invoice Price

Absolute Difference

Percentage Change.

Example:

Royal Stag 750ml

Previous ₹518

Current ₹540

Increase ₹22

Increase 4.25%.

---

## Supplier Comparison

Where enough history exists, compare product purchase rates across suppliers.

---

## Margin Impact

Determine the impact of purchase cost changes on selling margin.

---

## Supplier Intelligence

May calculate:

* price competitiveness
* purchase frequency
* return history
* delivery variance
* supplier reliability

where data is available.

No LLM required.

---

# MODULE 4 — INVENTORY

## FEATURE 7 — STOCK MANAGEMENT & AUDIT

Includes:

* current inventory
* opening stock
* receiving
* stock movement history
* purchases
* sales deductions
* return adjustments
* damage
* missing stock
* manual controlled corrections
* physical stock count
* variance
* stock adjustment.

All operations must retain full movement history.

---

## FEATURE 8 — ADVANCED STOCK TRANSFERS

### PLUS FEATURE

Extend existing transfer capability into:

Request

→ Approve

→ Dispatch

→ In Transit

→ Receive

→ Complete.

Track:

source shop

destination shop

items

quantities

requested by

approved by

dispatched by

received by

timestamps

status.

Stock changes must match the transfer lifecycle.

---

## FEATURE 9 — INVENTORY INTELLIGENCE

### PRO FEATURE

No LLM required.

Includes:

## Explain My Stock

Example:

Opening +24

Purchases +120

Sales -96

Returns +2

Damage -3

Transfers -5

Current 42.

All figures should reconcile to stock movement records.

---

## Reorder Intelligence

Use:

* current quantity
* recent sales
* average daily sales
* safety stock
* case size.

Calculate:

* days of stock remaining
* recommended bottles
* recommended cases.

---

## Fast / Slow / Dead Stock

Classify products based on configurable sales activity.

---

## Stockout Risk

Estimate likely out-of-stock products.

---

## Inventory Health

Combine:

* dead stock
* slow stock
* excessive stock
* stockout risk
* shrinkage
* turnover.

No AI agent required.

---

# MODULE 5 — OPERATIONS

## FEATURE 10 — SHIFT & DAY CLOSE

Includes:

* open shift
* opening cash
* active shift
* sales totals
* payment totals
* expected cash
* actual cash
* difference
* close
* approval where required
* final summary.

---

## FEATURE 11 — EXPENSE MANAGEMENT

New required feature if not already implemented.

Create/reuse:

expense categories

expense transactions.

Examples:

Rent

Salary

Electricity

Transport

Maintenance

Miscellaneous.

Suggested fields:

* date
* shop
* category
* amount
* description
* entered_by
* payment_method
* reference
* created_at.

Expense data must feed Profit Intelligence.

---

## FEATURE 12 — APPROVAL CONTROLS

Central approval capability.

Sensitive actions may require MANAGER/ADMIN approval.

Examples:

* excessive discount
* refund
* void
* price override
* stock adjustment
* shift discrepancy
* transfer approval.

Prefer reusable approval logic rather than custom approval logic duplicated on every page.

---

## FEATURE 13 — CUSTOMER & CREDIT

### PLUS FEATURE

Includes:

* customer profile
* mobile
* history
* credit/Udhaar
* outstanding amount
* payment received
* credit history.

Customer capture should remain optional during normal billing.

---

## FEATURE 14 — CUSTOMER LOYALTY

Future/high priority.

Includes:

* membership
* loyalty points
* earn rule
* redeem
* history.

Do not prioritize this over core production readiness.

---

# MODULE 6 — OWNER CENTER

This should be a major consolidation point.

Do NOT create separate sidebar screens for every analytic capability.

---

## FEATURE 15 — OWNER CONTROL CENTER

### PRO FEATURE

This becomes the owner's consolidated business view.

Combine:

* sales KPIs
* purchases
* stock
* inventory health
* profit
* supplier changes
* stock risks
* cash discrepancies
* cashier exceptions
* audit exceptions
* recommendations
* business health.

The screen should answer:

**What happened?**

**What needs my attention?**

**What should I do next?**

---

## PROFIT & BUSINESS INTELLIGENCE

### PRO FEATURE

This is part of Owner Center.

No LLM required.

Calculate:

Revenue

− COGS

= Gross Profit

Gross Profit

− Expenses

= Operating Profit.

Provide where data supports:

* SKU margin
* category margin
* brand margin
* supplier impact
* shop profitability
* day/week/month comparisons.

---

## AUDIT & LOSS CONTROL

### PRO FEATURE

Initially deterministic/rule-based.

Look for:

* excessive refunds
* unusual voids
* repeated discounts
* unusual price override
* unusual stock adjustments
* physical-stock variance
* cash shortage
* suspicious shift differences.

UI terminology must be neutral.

Use:

**Requires Review**

**Unusual Activity**

**Variance Detected**

Do NOT automatically label an employee as fraudulent.

---

## FEATURE 16 — SMART RECOMMENDATIONS

### PLUS FEATURE

Rule-based.

No LLM required.

Possible recommendations:

“Royal Stag may run out in 3 days.”

“Recommended order: 2 cases.”

“Supplier purchase price increased by 4.2%.”

“₹42,000 of inventory has had no sales in 45 days.”

“Shift closing is ₹1,250 below expected.”

Where practical, recommendation cards should include actions.

---

## OWNER WHATSAPP SUMMARY

### PLUS FEATURE

No WhatsApp API.

No automatic alert.

No background message.

No scheduled sending.

Workflow:

Generate summary

→ user clicks **Share with Owner**

→ WhatsApp / WhatsApp Web opens

→ pre-written message appears

→ user manually sends.

Possible summary:

WineShopPOS — Shift Summary

Shop: Airoli

Cashier: Rahul

Total Sales: ₹84,520

Cash: ₹31,200

UPI: ₹48,320

Card: ₹5,000

Bills: 142

Returns: ₹1,100

Expected Cash: ₹31,200

Actual Cash: ₹31,000

Difference: -₹200

Shift Closed: 10:06 PM

This feature is intended specifically to help staff share operating statistics with the owner.

It is NOT an alerting system.

---

# MODULE 7 — REPORTS & COMPLIANCE

## FEATURE 17 — REPORTS & EXPORTS

Preserve existing reporting.

Potential report areas:

sales

purchases

inventory

suppliers

cashier

shifts

expenses

profit

returns

payments

variance.

Accounting integration should initially be export-based.

Tally-compatible/accountant-friendly export is preferred before attempting direct API integration.

---

## FEATURE 18 — LIQUOR COMPLIANCE

State-specific compliance must be implemented only after verified requirements are known.

Architecture should support:

* state
* license details
* shop compliance configuration
* excise-specific fields
* required registers/reports
* state-specific values.

Do not invent legal or tax rules.

Do not hardcode assumptions without validation.

---

# MODULE 8 — SETTINGS & ADMIN

## FEATURE 19 — SHOP, USERS & SECURITY

Includes:

* organizations
* shops
* users
* roles
* shop assignment
* user activation
* multi-shop configuration
* RLS
* access control
* audit/security administration.

Only authorized users can change roles.

---

## FEATURE 20 — HARDWARE & DEVICE SETUP

Includes:

* scanner test
* scanner configuration
* receipt printer
* barcode printer where used
* printer settings.

Where technically possible show simple states:

Scanner Ready

Printer Configured

Offline.

---

## FEATURE 21 — OFFLINE & RELIABILITY

Harden existing offline behavior.

Offline POS should support:

* cached product/barcode
* price
* stock snapshot
* cart
* billing
* local transaction queue.

Process:

Create transaction locally

→ assign globally unique transaction ID

→ queue

→ reconnect

→ submit controlled server transaction

→ confirm

→ mark synced.

Must prevent duplicate replay.

Do NOT overwrite server inventory using locally calculated quantity.

---

## FEATURE 22 — BACKUP & RECOVERY

Define:

* backup strategy
* retention
* recovery process
* rollback
* documentation
* restore testing.

A backup feature is not production-ready until a restore test has succeeded.

---

# MODULE 9 — FUTURE AI

Do NOT show Future AI in production navigation now.

---

## FEATURE 23 — AI OWNER ASSISTANT

Deferred.

Requires LLM/agent integration.

One AI agent should eventually support:

* owner questions
* business explanations
* supplier questions
* inventory questions
* daily summaries
* investigations
* natural-language search.

Do not create separate agents unnecessarily.

Preferred future architecture:

Owner Question

→ LLM Agent

→ controlled application tools

→ trusted business data

→ response.

Possible tools:

get_sales_summary()

get_inventory_health()

get_stock_history()

get_supplier_prices()

get_profitability()

get_shift_variances()

get_purchase_recommendations().

The agent must not bypass transactional controls.

---

## FEATURE 24 — VOICE AI LAYER

Future.

Voice

→ Speech-to-Text

→ AI Owner Assistant

→ response

→ optional Text-to-Speech.

Do not implement before Feature 23 is stable.

---

# 16. PRODUCT TIER MODEL

The application has three conceptual product levels:

## CORE

Normal/default functionality.

No badge required.

---

## PLUS

Enhanced operational/commercial features.

Badge:

**PLUS**

---

## PRO

Advanced business-intelligence/premium functionality.

Badge:

**PRO**

At this stage badges are purely product/UI classification.

Do NOT introduce payment/subscription enforcement unless explicitly requested later.

---

# 17. PRO FEATURES — TOP 5

## PRO-1

**Smart Purchase Intelligence**

Includes OCR intelligence, matching, supplier price comparison, price-change analysis and margin impact.

---

## PRO-2

**Inventory Intelligence**

Includes stock explanation, reorder, stockout risk, dead/slow stock and inventory health.

---

## PRO-3

**Owner Control Center**

Consolidated owner business view.

---

## PRO-4

**Profit & Business Intelligence**

Profitability and margin intelligence.

---

## PRO-5

**Audit & Loss Control**

Exception, variance and unusual-activity analysis.

---

# 18. PLUS FEATURES — 6 TO 10

## PLUS-6

**Smart Recommendations**

---

## PLUS-7

**Advanced Supplier & Procurement**

Includes expanded PO, receiving, supplier balance and variance workflow.

---

## PLUS-8

**Advanced Stock Transfers**

Request → approval → dispatch → in transit → receive.

---

## PLUS-9

**Owner WhatsApp Summary**

Manual pre-written WhatsApp owner summary.

---

## PLUS-10

**Customer & Credit Management**

Customer history + credit/Udhaar.

---

# 19. FEATURE TIER BADGE COMPONENT

Create one reusable UI component such as:

`FeatureTierBadge`

Supported values:

`PRO`

`PLUS`.

Do not duplicate badge markup throughout the application.

Conceptually:

`<FeatureTierBadge tier="PRO" />`

`<FeatureTierBadge tier="PLUS" />`

---

# 20. BADGE UX

Badges must be:

* compact
* subtle
* professional
* readable
* consistent
* secondary to page title.

Good:

Inventory Intelligence  PRO

Avoid:

⭐⭐ PREMIUM ULTRA PRO ⭐⭐

Do not make the operational UI feel like an advertisement.

---

# 21. SIDEBAR BADGE RULE

Do NOT place PRO/PLUS badges beside every main sidebar item.

Keep main navigation clean.

Example:

Inventory

Inside Inventory:

Overview

Stock

Stock Count

Transfers  PLUS

Inventory Intelligence  PRO.

---

Purchases & Suppliers:

Purchases

Suppliers

Purchase Orders  PLUS

Purchase Intelligence  PRO.

---

Owner Center:

Overview  PRO

Profit Intelligence  PRO

Loss & Exceptions  PRO

Recommendations  PLUS

WhatsApp Summary  PLUS.

---

# 22. FUTURE SUBSCRIPTION COMPATIBILITY

Design tier metadata cleanly enough that a future feature-entitlement system could support:

CORE

PLUS

PRO.

Possible future design:

feature_key

minimum_plan

feature_entitlements

canAccessFeature().

However:

DO NOT implement subscription blocking now.

DO NOT change RLS for PRO/PLUS.

DO NOT hide currently working features.

DO NOT add payment integration.

---

# 23. TABLE UX STANDARD

Major tables should support where appropriate:

* search
* filtering
* sorting
* pagination
* row count
* clear filters
* export
* sticky header
* horizontal overflow
* empty states.

Avoid too many visible row buttons.

Use:

primary action

*

three-dot action menu.

---

# 24. FORM UX STANDARD

Forms should:

* group related fields
* clearly indicate required fields
* provide inline validation
* preserve entered data after validation error
* disable duplicate submit
* show submit/loading state
* use sensible defaults
* use logical keyboard order.

Avoid oversized single-section forms.

---

# 25. STATUS STANDARD

Use consistent statuses.

Examples:

Draft

Pending

Approved

Rejected

Open

Closed

In Transit

Received

Completed

Cancelled

Needs Review.

Use text + color.

Never rely on color alone.

---

# 26. ERROR HANDLING

Do NOT expose raw backend errors to normal users.

Bad:

PostgREST PGRST116

Supabase stack trace

Unhandled TypeError.

Good:

“Unable to complete the sale because inventory changed. Refresh stock and try again.”

Technical information may be logged internally.

---

# 27. LOADING STATES

Use:

* skeleton/loading table
* progress states
* button spinner
* disabled submission buttons.

Never leave blank pages while fetching data.

---

# 28. EMPTY STATES

Bad:

No Data.

Good:

No suppliers have been added yet.

[Add Supplier]

---

# 29. RESPONSIVE UX

Primary usage:

desktop/laptop POS.

Also provide reasonable usability for:

tablet

management screens on mobile.

Do not compromise cashier desktop efficiency merely to create a mobile-first layout.

---

# 30. MULTI-STAGE EXECUTION HANDSHAKE

Use the following handshake process.

Do NOT jump directly into large code changes.

---

## HANDSHAKE 1 — DISCOVER

Inspect repository and report:

* current branch
* working tree state
* latest relevant commits
* relevant routes
* relevant React components
* relevant Supabase migrations
* relevant RPCs
* RLS
* current implementation of requested feature.

Output:

### Existing

### Partial

### Missing

### Needs Testing

Do not modify code yet.

---

## HANDSHAKE 2 — MAP

For each requested feature determine:

* existing code to reuse
* components to refactor
* new components needed
* schema changes
* migration requirements
* backend changes
* role/security impact
* regression risk.

Output a concise implementation map.

Do not make assumptions that contradict repository evidence.

---

## HANDSHAKE 3 — PROTECT

Before coding identify:

### Must Not Break

Examples:

POS checkout

barcode scanning

inventory deduction

purchase receiving

RLS

multi-shop isolation

returns

shifts

offline queue.

Create a regression checklist.

---

## HANDSHAKE 4 — IMPLEMENT

Implement incrementally.

Preferred order:

small safe change

→ build

→ test

→ commit/checkpoint

→ next change.

Avoid a giant rewrite.

---

## HANDSHAKE 5 — VERIFY

After each significant feature:

Run:

* build
* lint where configured
* relevant tests
* route verification
* database verification
* role checks.

Verify no console errors.

---

## HANDSHAKE 6 — REPORT

Provide:

### Completed

### Reused

### New Files

### Modified Files

### Migration

### Tests

### Remaining Risk

### Next Step.

Keep this factual.

Do not claim something was tested unless it was actually tested.

---

# 31. IMPLEMENTATION PHASES

## PHASE 0 — BASELINE

Before refactoring:

* pull latest
* confirm branch
* confirm status
* build current app
* record current routes
* record migrations
* record RPCs
* capture important screenshots if practical
* create safe Git checkpoint/tag.

---

# 32. PHASE 1 — APPLICATION SHELL

Implement/refine:

sidebar

topbar

role-aware navigation

shop selector

breadcrumbs

avatar/user menu.

Do not refactor backend business logic in this phase.

---

# 33. PHASE 2 — ACCOUNT EXPERIENCE

Implement reusable:

UserAvatar

UserMenu

Profile

Account Settings

Security

RoleBadge

ShopContextSwitcher.

Use existing Supabase identity/auth structures.

---

# 34. PHASE 3 — ROUTE CONSOLIDATION

Group existing pages under the 8 modules.

Examples:

Reorder.jsx

→ Inventory → Intelligence.

PriceHistory.jsx

→ Purchases & Suppliers → Purchase Intelligence.

Audit.jsx

→ Owner Center → Loss & Exceptions.

Do NOT delete original logic until new routing has been tested.

---

# 35. PHASE 4 — SHARED UI SYSTEM

Create/reuse common components:

PageHeader

SectionHeader

DataTable

MetricCard

StatusBadge

FeatureTierBadge

EmptyState

ErrorState

LoadingState

ConfirmationDialog

ApprovalDialog

DateRangeFilter

SearchFilterBar

MoneyDisplay

QuantityDisplay

UserAvatar

ShopSelector

ActionMenu.

Prefer consistent reuse.

---

# 36. PHASE 5 — COMPLETE PARTIAL EXISTING FEATURES

Prioritize:

offline reliability

printer testing

backup restore testing

transfers

returns

approval controls

purchase workflow.

---

# 37. PHASE 6 — MISSING MUST FEATURES

Implement:

Expense Management

required payment-management polish

liquor compliance foundation after validated requirements

backup/recovery completion.

---

# 38. PHASE 7 — NON-LLM DIFFERENTIATORS

Implement/finish:

PRO Smart Purchase Intelligence

PRO Inventory Intelligence

PRO Owner Control Center

PRO Profit Intelligence

PRO Audit & Loss Control

PLUS Smart Recommendations.

No LLM required.

---

# 39. PHASE 8 — HIGH / PLUS FEATURES

Implement/finish:

Advanced Supplier & Procurement

Advanced Stock Transfers

Owner WhatsApp Summary

Customer & Credit

Tally/accounting exports

printing improvements.

Loyalty later.

---

# 40. PHASE 9 — CLEANUP

Only when replacement views are verified:

* remove obsolete pages
* remove duplicate components
* remove dead routes
* consolidate styles
* update docs
* update architecture.

Never remove working code first and hope the replacement works.

---

# 41. REGRESSION TEST MATRIX

At minimum verify:

## POS

scanner

search

cart

quantity

payment

sale

stock decrement

stock movement

receipt.

---

## PURCHASES

supplier

PO

receiving

OCR review

purchase commit

stock increase

price history.

---

## RETURNS

return

refund

stock reversal

approval.

---

## SHIFT

open

sell

close

expected/actual cash

difference.

---

## INVENTORY

stock count

adjustment

transfer

reorder.

---

## ACCESS

ADMIN

MANAGER

CASHIER.

---

## MULTI-SHOP

Verify tenant/shop isolation.

---

## OFFLINE

disconnect

bill

queue

reconnect

sync

duplicate prevention.

---

# 42. DEFINITION OF DONE

A feature is complete only when:

* UI exists
* business logic works
* permissions work
* security/RLS works where applicable
* error state exists
* loading state exists
* empty state exists
* responsive behavior is acceptable
* no console errors
* build succeeds
* regression checks pass
* documentation is updated.

---

# 43. REQUIRED LLM BEHAVIOR

When solving a development task:

Do internal reasoning silently.

Do not output private step-by-step reasoning.

Instead provide concise engineering justification based on observable evidence.

Before coding always state:

### Current State

### Reuse Plan

### Required Changes

### Database Impact

### Risk Level

### Regression Tests

Then execute.

---

# 44. CHANGE RISK TARGET

The expected approach should preserve roughly 75–80% of the existing working application.

Most rework should be concentrated in:

* navigation
* UI composition
* shared components
* route organization.

Avoid unnecessary rewrites of:

* Supabase
* RLS
* RPCs
* transactional operations
* core POS flow.

Target overall existing-app rework:

approximately **20–25%**, unless repository evidence demonstrates otherwise.

---

# 45. FINAL PRODUCT MENTAL MODEL

Cashier:

**“I scan and collect payment.”**

Manager:

**“I run stock, purchases, shifts and operations.”**

Owner:

**“I immediately know how the business is performing and what requires attention.”**

System:

**Handles the complexity in the background.**

---

# 46. FINAL NAVIGATION

Visible now:

**POS & Billing**

**Products**

**Purchases & Suppliers**

**Inventory**

**Operations**

**Owner Center**

**Reports & Compliance**

**Settings & Admin**

Hidden/deferred:

**Future AI**

---

# 47. COMMERCIAL FEATURE CLASSIFICATION

## CORE

Everything not explicitly tagged PLUS or PRO.

No badge.

---

## PLUS

PLUS-6 Smart Recommendations

PLUS-7 Advanced Supplier & Procurement

PLUS-8 Advanced Stock Transfers

PLUS-9 Owner WhatsApp Summary

PLUS-10 Customer & Credit Management.

---

## PRO

PRO-1 Smart Purchase Intelligence

PRO-2 Inventory Intelligence

PRO-3 Owner Control Center

PRO-4 Profit & Business Intelligence

PRO-5 Audit & Loss Control.

---

# 48. FINAL SAFETY INSTRUCTION

Do not treat this specification as a request to rebuild WineShopPOS.

Treat it as:

**a target UX and product architecture layered on top of the current working application.**

Before every implementation decision ask:

1. Does this already exist?
2. Can it be reused?
3. Will this break a working flow?
4. Does the database really need to change?
5. Can this be accomplished primarily through UI consolidation?
6. Is this feature CORE, PLUS, PRO or FUTURE AI?
7. Have regression risks been identified?

The correct implementation strategy is:

**Inspect → Map → Protect → Implement → Verify → Report.**

Never:

**Assume → Rewrite → Hope.**

---

# 49. FIRST TASK WHEN THIS PROMPT IS PROVIDED

Do NOT immediately modify code.

First perform Handshake 1–3.

Return:

## Repository Current State

## Existing vs Partial vs Missing

## Mapping of Current Screens to 8 Final Modules

## Mapping of Current Functions to 24 Consolidated Features

## PRO / PLUS Feature Mapping

## Files Expected to Change

## Database Changes Expected

## Risk Assessment

## Regression Test Plan

## Recommended Implementation Sequence

Then begin implementation only after this baseline analysis is complete.
