# WineShopPOS Security Master Status

This file records only controls verified from the current V3 line or explicitly carried forward.

## VERIFIED / IMPLEMENTED

### SECURITY DEFINER RPC privilege hardening
Status: IMPLEMENTED in V3.

Evidence surfaces:
- additive security-definer privilege migration
- security-definer privilege regression script
- anonymous/PUBLIC execution of protected helpers removed in the tested DEV baseline

### Manager role-home redirect
Status: IMPLEMENTED in V3.

Current role-home behavior:
- ADMIN -> Owner Center
- MANAGER -> POS
- CASHIER -> POS

Browser qualification must continue to verify no redirect loop.

### PROD password recovery source carry-forward
Status: CARRIED FORWARD into V3 source from current main.

Includes:
- Forgot Password UI
- recovery-event routing
- password update page/flow

Important:
PROD SMTP credentials/settings are NOT copied to DEV.
Environment-specific SMTP/Auth configuration remains separate.

## NOT CLAIMED COMPLETE BY THIS CARRY-FORWARD

The following global security areas require current-source/live-environment verification before PASS:
- full RLS role-policy reconciliation
- customer/supplier minimum-field exposure
- shared-device cache partitioning
- offline queue user/shop partitioning
- privileged offline denial
- public signup configuration
- Edge Function CORS allowlists
- production security headers/edge infrastructure
- complete role-negative security suite
- full production security smoke matrix

Do not infer PASS from this policy document.
