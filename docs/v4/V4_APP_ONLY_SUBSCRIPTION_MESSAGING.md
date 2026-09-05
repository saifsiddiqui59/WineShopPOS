# V4 App-Only Subscription Messaging

## Scope

WineShopPOS uses in-app communication only for this stage.

Not implemented:
- WhatsApp
- Email
- SMS
- automated calls
- new paid notification services

## Live shop role strategy

### More than 30 days
No subscription interruption message.

### 30–15 days
ADMIN receives a subtle renewal reminder.

### 14–8 days
ADMIN receives a persistent reminder.
MANAGER receives a smaller reminder.
CASHIER receives nothing.

### 7–3 days
ADMIN and MANAGER receive a strong warning.
CASHIER receives a generic message:
"Subscription expires in N days. Please inform the shop owner."

Cashiers do not receive plan/billing details.

### 2 days remaining
ADMIN and MANAGER receive an acknowledgement modal once per browser session
plus a persistent warning.
CASHIER receives a strong persistent warning.

### Due today / <= 24 hours
All shop roles receive a serious acknowledgement modal plus a persistent warning.
Cashier copy remains generic and asks them to inform the owner.

### Expired / suspended / otherwise denied
The server is authoritative.
If `my_saas_context()` returns `allowed=false`, normal POS pages do not mount.
The user sees the full access-restricted screen with Check Again and Sign Out.

## Refresh behavior

For authenticated users, WineShopPOS refreshes SaaS state:
- initially after login
- every 60 seconds
- when the browser window regains focus
- when the tab becomes visible
- when network connectivity returns

This allows a long-running POS browser to receive account changes without logout.

## Demo behavior

Demo identity/trial state remains server-side.
Demo business data remains `sessionStorage` only.

- More than 24 hours: demo indicator/countdown
- 24 hours or less: strong warning
- 6 hours or less: acknowledgement modal
- expired: hard access-restricted screen
- logout/new browser session resets demo business seed
- clearing browser data does not reset server-side trial expiry

Public QA demo entry:
`#/login?mode=demo`

Configured public demo account:
`admin@demowineshop.com`

## Operational announcements

Separate from subscription lifecycle:
- INFO: compact
- SUCCESS: compact
- WARNING: prominent
- CRITICAL: acknowledgement modal + persistent banner

## Version notices

Version/update messaging remains separate.
`force_update=true` creates a strong in-app update notice/modal.
This change does not add hard version enforcement.

## Environment isolation

V4 remains DEV/QA:
`https://wspv4d66ca1d443.z29.web.core.windows.net/`

Production remains untouched:
`https://wineshoppos.z29.web.core.windows.net/`

V4 must continue using DEV Supabase:
`juhcypzoacauzmtzqnwd`
