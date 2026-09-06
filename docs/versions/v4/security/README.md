# V4 Security Status

Status: CURRENT V4 PRE-PROD SECURITY INDEX

V4 inherits the verified PROD/V3 security discipline and adds V4-specific
SaaS/platform/import/legal controls through version-controlled migrations and
source.

Current release constraints:

- V4 is DEV/QA only until explicit PROD promotion approval.
- V4 frontend configuration must contain DEV ref and exclude PROD ref.
- stock-changing operations remain database/RPC transaction controlled.
- platform-admin authority is distinct from ordinary shop ADMIN authority.
- import operations are shop-scoped and manager/admin controlled.
- legal notice is prepared but must remain disabled until explicitly enabled.
- no PROD business data, credentials or runtime state may be copied into V4.
- no blind migration push/repair/reset is permitted for PROD promotion.

See V4 migrations and the inherited shared release playbook for detailed
promotion controls.
