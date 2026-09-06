# Code History — AI Owner Assistant V1

## Milestone

Ask WineShopPOS PRO reached verified production operation on 2026-08-30.

## Major implementation

- additive Supabase AI migration
- caller-scoped AI authorization helpers
- nine deterministic business RPC tools
- Azure Function AI trust boundary
- Microsoft Foundry project/model/agent
- Owner Center AI UI
- multi-shop-aware authorization
- metadata-only AI activity logging
- India-only production cloud policy

## Rollout defects discovered and resolved

### Legacy East US Foundry resource

An early deployment attempt created an East US Foundry resource. It is not the production AI resource. Production was moved to a dedicated South India Foundry account.

### Git Bash automation failures

Windows Git Bash/MSYS path conversion and a `tr` character-class expression interrupted the installer after cloud resources had already been partially created. Forward-fix scripts were used; production data was not reset.

### Foundry request shape

The older `body.agent` request was rejected with HTTP 400:

`The 'agent' property is deprecated. Use 'agent_reference' instead.`

Runtime was corrected to `agent_reference`.

### Project-level RBAC

Direct local Foundry tests succeeded under the signed-in Azure developer identity, while the Azure Function returned HTTP 403.

Root cause: the Function used project-level AIProjectClient Conversations/Responses APIs, while its managed identity had only Agent Consumer. The working fix was Foundry User at the WineShopPOS Foundry project scope.

## Final verification

All Supabase AI RPCs passed directly.

A full local Foundry/tool loop passed.

The real Azure Function → Foundry → Supabase tool loop → final answer passed after the RBAC correction.
