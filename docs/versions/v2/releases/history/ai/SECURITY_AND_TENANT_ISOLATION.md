# AI V1 Security and Tenant Isolation

## Security objective

No AI request may read another tenant/shop's business data merely because a model generated an identifier or prompt content.

## Trust boundary

The Azure Function is the AI trust boundary.

React supplies:

- the currently authenticated Supabase access token
- the user's question
- selected shop UI context
- SHOP/ALL scope where supported
- small recent conversation context

The Function:

1. validates the Supabase token;
2. resolves the actual caller;
3. resolves active membership;
4. verifies role;
5. verifies organization/shop;
6. validates requested shop/scope;
7. injects trusted scope into business RPCs.

The model never receives authority to choose arbitrary organization/user/shop IDs.

## Current access

AI V1 is exposed through Owner Center for ADMIN.

## Database safety

AI tools are deterministic read-only analytics RPCs. There is no unrestricted SQL/query-database/get-any-table tool.

Stock-changing operations continue to use the existing transactional backend/database workflows.

## Runtime identity

Azure Function uses a system-assigned managed identity.

The current runtime uses `AIProjectClient` and project-level Responses/Conversations APIs. The verified permission is:

- **Foundry User**
- scope: WineShopPOS Foundry project

The earlier Agent Consumer-only configuration produced HTTP 403 because it did not cover the project-level runtime calls used by this implementation.

## Secrets

Never place the following in React, prompts, documentation or Git:

- Supabase service-role key
- database password
- Azure credentials
- storage-account key
- Function secret
- user bearer tokens

The AI V1 business RPC path uses the caller's Supabase JWT and public/publishable Supabase key so `auth.uid()` remains caller-scoped.

## Required tenant tests

Before major releases:

- Admin A → Shop A: allow
- Admin A → unauthorized Shop B: deny
- Admin B → own shop: allow
- Manager/Cashier → AI Owner Center: deny under current V1 policy
- tampered shop UUID from another organization: deny
- ALL scope: only authorized ADMIN memberships inside the resolved organization
