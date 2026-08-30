#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${WSP_PROJECT_DIR:-/e/WineShopPOS}"
SUPABASE_PROJECT_REF="${WSP_SUPABASE_PROJECT_REF:-uiurgplnsgmawvxhjzzp}"
AZ_SUBSCRIPTION="${WSP_AZ_SUBSCRIPTION:-Azure subscription 1}"
AZ_RESOURCE_GROUP="wineshopPOS"
FUNCTION_LOCATION="centralindia"
FOUNDRY_PROJECT_NAME="${WSP_FOUNDRY_PROJECT:-wineshoppos-ai}"
REQUESTED_MODEL="${WSP_AI_MODEL_NAME:-gpt-5-mini}"
AGENT_NAME="${WSP_AI_AGENT_NAME:-WineShopPOS-Owner-Agent}"
AI_MIGRATION_ID="20260830070000"
RUN_ID="$(date -u +%Y%m%dT%H%M%SZ)"
LOG_FILE="$PROJECT_DIR/ai-india-resume-${RUN_ID}.log"

exec > >(tee -a "$LOG_FILE") 2>&1
trap 'code=$?; echo; echo "AI INDIA-ONLY RESUME STOPPED SAFELY (exit $code)"; echo "Log: $LOG_FILE"; exit $code' ERR

export MSYS_NO_PATHCONV=1
export MSYS2_ARG_CONV_EXCL="*"

section(){ echo; echo "============================================================"; echo "$1"; echo "============================================================"; }
need(){ command -v "$1" >/dev/null 2>&1 || { echo "Missing command: $1"; exit 1; }; }

cd "$PROJECT_DIR"
need git
need az
need npx
need node
need npm
need curl

section "VERIFY CURRENT AI STATE"

if [[ ! -d .git ]]; then echo "Not a Git repo: $PROJECT_DIR"; exit 1; fi
if [[ "$(git branch --show-current)" != "main" ]]; then echo "Expected branch main"; exit 1; fi

npx supabase migration list | tee /tmp/wsp_ai_migrations.txt
if ! grep -q "$AI_MIGRATION_ID" /tmp/wsp_ai_migrations.txt; then
  echo "AI migration $AI_MIGRATION_ID is not remote. Stop."
  exit 1
fi
rm -f /tmp/wsp_ai_migrations.txt

echo "Supabase AI migration confirmed remote."

for f in \
  azure-functions/ai-owner-assistant/package.json \
  azure-functions/ai-owner-assistant/src/index.js \
  azure-functions/ai-owner-assistant/scripts/configure-agent.mjs \
  src/pages/OwnerAI.jsx \
  src/lib/aiClient.js
 do
  [[ -f "$f" ]] || { echo "Missing AI file: $f"; exit 1; }
 done

section "WRITE / UPDATE CLOUD CONFIGURATION DOCUMENTATION"

mkdir -p docs/ai docs/handoff scripts

cat > docs/ai/AZURE_SUPABASE_CONFIGURATION.md <<'DOC'
# WineShopPOS — Azure & Supabase Configuration

This is the non-secret cloud configuration reference for WineShopPOS.

> Never store service-role keys, Azure access keys, DB passwords, bearer tokens, Function keys or Foundry secrets in Git.

## Azure

### Subscription
- `Azure subscription 1`

### Resource group
All WineShopPOS Azure resources remain under:
- `wineshopPOS`

### Existing static website
- Storage account: `wineshoppos`
- Region: `Central India`
- Purpose: Azure Blob Static Website
- Live URL: `https://wineshoppos.z29.web.core.windows.net/`

### Existing invoice OCR
- Service: Azure AI Document Intelligence
- Resource: `wineshoppos-docintel-45b7d2b9`
- Kind: `FormRecognizer`
- SKU: `F0`
- Region: `Central India`
- Credentials remain backend-only.

## AI Owner Assistant — PRO

### Region policy
AI infrastructure is India-only.

Foundry selection order:
1. `Central India`
2. `South India`
3. STOP

The deployment must never automatically fall back to US/Europe/another non-India region.

Model selection order:
1. requested model (`gpt-5-mini` by default)
2. `gpt-4.1-mini` fallback when available in an allowed India region

The installer prints the selected region/model before creating usage-billed model capacity.

### Azure Function App
- Resource group: `wineshopPOS`
- Region: `Central India`
- Plan: Azure Functions Consumption only
- Expected plan SKU: `Y1`
- Always On: not used
- Purpose: trust boundary for `/api/ai/chat`

The deployment script verifies the Function plan is `Y1` and stops if Azure returns a Premium/Dedicated plan.

### Foundry architecture
```text
One Foundry resource/project
        ↓
One model deployment
        ↓
One WineShopPOS Owner Agent
        ↓
Controlled read-only business tools
```

No per-shop LLM and no per-customer agent is used for tenant isolation.

## Supabase

### Project
- Project: `WineShopPOS`
- Ref: `uiurgplnsgmawvxhjzzp`
- URL: `https://uiurgplnsgmawvxhjzzp.supabase.co`

### Tenant model
- Organization table: `organizations`
- Organization UUID: `organizations.id`
- Shop table: `shops`
- Unique shop UUID: `shops.id`
- Organization relation: `shops.organization_id`
- User-to-shop access: `user_shop_memberships`

`profiles.shop_id` remains for current/default-shop compatibility; scalable authorization uses memberships.

### AI migration
- `20260830070000_ai_owner_assistant_v1.sql`
- Remote status: applied before this India-only cloud-resume patch.

### AI operational audit
- Table: `ai_activity_logs`
- Stores request metadata/status/latency/tool category.
- Prompt and response bodies are not stored by default.

### AI V1 authorization
```text
React
  ↓ Supabase JWT
Azure Function
  ↓ validate caller
user_shop_memberships
  ↓ authorized shops + organization
validated selected shop
  ↓
Foundry Owner Agent
  ↓
controlled Supabase AI RPC
```

The model does not decide tenant access.

### AI V1 credential model
Azure Function uses:
- `SUPABASE_URL`
- browser-safe publishable/anon key
- authenticated caller's Supabase access token

AI V1 does not require a Supabase service-role key for normal business-tool execution.

### AI read-only RPC/tool layer
- `ai_get_sales_summary`
- `ai_get_profit_summary`
- `ai_get_inventory_health`
- `ai_get_reorder_recommendations`
- `ai_get_supplier_price_history`
- `ai_get_product_stock_history`
- `ai_get_shift_variances`
- `ai_get_audit_exceptions`
- `ai_get_expense_summary`

No unrestricted SQL/table tool is provided to the model.

## Frontend AI settings
`.env.local` only, never committed:
```text
VITE_AI_API_URL=<Azure Function base URL>
VITE_AI_OWNER_ENABLED=true
```

Never configure static `SHOP_ID`, `ORGANIZATION_ID`, `USER_ID` or `ROLE`; they are authenticated runtime context.

## Secret ownership
| Item | Correct location |
|---|---|
| Supabase publishable key | browser-safe frontend / Function config |
| Supabase user token | Authorization header at runtime |
| Supabase service-role | backend secret only if separately required; not React/model |
| Document Intelligence key | Supabase Edge Function secret |
| Foundry credentials | Managed Identity + Azure RBAC |
| Function config | Function App settings |
| Shop/org/user IDs | trusted runtime context |

## Change-control rule
Update this document whenever Azure/Supabase architecture changes, together with the migration/runbook/test matrix/handoff documentation.
DOC

if [[ -f docs/ai/DEPLOYMENT_RUNBOOK.md ]] && ! grep -q "India-only cloud policy" docs/ai/DEPLOYMENT_RUNBOOK.md; then
cat >> docs/ai/DEPLOYMENT_RUNBOOK.md <<'DOC'

## India-only cloud policy
- Azure resource group: `wineshopPOS`.
- Function App: Central India, Consumption (`Y1`) only.
- Foundry: Central India → South India → stop.
- No automatic non-India fallback.
- If the requested model is unavailable in allowed India regions, use the documented India fallback only when the installer discovers it as supported.
- See `docs/ai/AZURE_SUPABASE_CONFIGURATION.md`.
DOC
fi

cat > docs/handoff/AI_CLOUD_POLICY_LATEST.txt <<'DOC'
WineShopPOS AI cloud policy
- Resource group: wineshopPOS
- Static site: Central India
- Document Intelligence: Central India / F0
- AI Function App: Central India / Consumption Y1 only / no Always On
- Foundry: Central India first, South India second, then STOP
- No US/Europe fallback
- One Foundry model deployment + one WineShopPOS Owner Agent
- Supabase project ref: uiurgplnsgmawvxhjzzp
- AI migration 20260830070000 is already applied remotely
- Unique shop key: shops.id UUID
- Tenant membership: user_shop_memberships
DOC

cp "$0" scripts/repair_resume_ai_india_only_v2.sh
chmod +x scripts/repair_resume_ai_india_only_v2.sh

git add docs/ai/AZURE_SUPABASE_CONFIGURATION.md docs/handoff/AI_CLOUD_POLICY_LATEST.txt scripts/repair_resume_ai_india_only_v2.sh
[[ -f docs/ai/DEPLOYMENT_RUNBOOK.md ]] && git add docs/ai/DEPLOYMENT_RUNBOOK.md
if ! git diff --cached --quiet; then
  git commit -m "fix: keep AI cloud deployment India-only and document cloud configuration"
fi

section "AZURE ACCOUNT / PROVIDER"

if ! az account show >/dev/null 2>&1; then az login; fi
az account set --subscription "$AZ_SUBSCRIPTION"
SUB_ID="$(az account show --query id -o tsv)"
TENANT_ID="$(az account show --query tenantId -o tsv)"
[[ -n "$SUB_ID" && -n "$TENANT_ID" ]] || { echo "Could not resolve subscription/tenant."; exit 1; }

az group show --name "$AZ_RESOURCE_GROUP" >/dev/null
az provider register --namespace Microsoft.CognitiveServices --subscription "$SUB_ID" --wait -o none

HASH="$(printf '%s' "${SUB_ID}-${SUPABASE_PROJECT_REF}" | sha256sum | cut -c1-10)"
FOUNDRY_ACCOUNT="${WSP_FOUNDRY_ACCOUNT:-wineshoppos-ai-in-${HASH}}"
LEGACY_FOUNDRY_ACCOUNT="wineshoppos-ai-${HASH}"

# Keep the old pre-policy Foundry account isolated until India deployment is verified.
if az cognitiveservices account show --subscription "$SUB_ID" -g "$AZ_RESOURCE_GROUP" -n "$LEGACY_FOUNDRY_ACCOUNT" >/dev/null 2>&1; then
  LEGACY_LOCATION="$(az cognitiveservices account show --subscription "$SUB_ID" -g "$AZ_RESOURCE_GROUP" -n "$LEGACY_FOUNDRY_ACCOUNT" --query location -o tsv | awk '{print tolower($0)}' | sed 's/[[:space:]]//g')"
  echo "Legacy Foundry account detected: $LEGACY_FOUNDRY_ACCOUNT ($LEGACY_LOCATION)"
  echo "It will NOT be reused or deleted during this India deployment."
fi
FUNCTION_STORAGE="wspaifn$(printf '%s' "$HASH" | sed 's/[^[:alnum:]]//g' | cut -c1-12)"
FUNCTION_APP="${WSP_FUNCTION_APP:-wineshoppos-ai-${HASH}}"
MODEL_DEPLOYMENT=""
FOUNDRY_LOCATION=""
MODEL_NAME=""
MODEL_VERSION=""

section "INDIA-ONLY FOUNDRY MODEL DISCOVERY"

MODEL_CANDIDATES=("$REQUESTED_MODEL")
if [[ "$REQUESTED_MODEL" != "gpt-4.1-mini" ]]; then MODEL_CANDIDATES+=("gpt-4.1-mini"); fi

for region in centralindia southindia; do
  for candidate_model in "${MODEL_CANDIDATES[@]}"; do
    version="$(az cognitiveservices model list \
      --subscription "$SUB_ID" \
      --location "$region" \
      --query "[?model.name=='${candidate_model}' && length(model.skus[?name=='GlobalStandard']) > \`0\`].model.version | [0]" \
      -o tsv 2>/dev/null || true)"
    if [[ -n "$version" && "$version" != "None" ]]; then
      FOUNDRY_LOCATION="$region"
      MODEL_NAME="$candidate_model"
      MODEL_VERSION="$version"
      break 2
    fi
  done
done

if [[ -z "$FOUNDRY_LOCATION" ]]; then
  echo "STOPPED BY INDIA-ONLY POLICY."
  echo "No supported GlobalStandard deployment was discovered for: ${MODEL_CANDIDATES[*]}"
  echo "Regions checked: Central India, South India"
  echo "No US/Europe fallback will be attempted."
  exit 1
fi

[[ "$FOUNDRY_LOCATION" == "centralindia" || "$FOUNDRY_LOCATION" == "southindia" ]] || { echo "Non-India region rejected."; exit 1; }

MODEL_DEPLOYMENT="${WSP_AI_MODEL_DEPLOYMENT:-$MODEL_NAME}"
echo "Selected Foundry region : $FOUNDRY_LOCATION"
echo "Selected model          : $MODEL_NAME"
echo "Selected model version  : $MODEL_VERSION"
if [[ "$MODEL_NAME" != "$REQUESTED_MODEL" ]]; then
  echo "Requested $REQUESTED_MODEL was not available in allowed India regions."
  echo "Using India-supported fallback: $MODEL_NAME"
fi

section "CREATE / REUSE FOUNDRY RESOURCE"

if ! az cognitiveservices account show --subscription "$SUB_ID" -g "$AZ_RESOURCE_GROUP" -n "$FOUNDRY_ACCOUNT" >/dev/null 2>&1; then
  if ! az cognitiveservices account create \
    --subscription "$SUB_ID" \
    --name "$FOUNDRY_ACCOUNT" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --kind AIServices \
    --sku S0 \
    --location "$FOUNDRY_LOCATION" \
    --custom-domain "$FOUNDRY_ACCOUNT" \
    --assign-identity \
    --allow-project-management \
    --yes \
    -o none; then
      echo "CLI creation failed; retrying with explicit ARM resource URL."
      ARM_URL="https://management.azure.com/subscriptions/${SUB_ID}/resourceGroups/${AZ_RESOURCE_GROUP}/providers/Microsoft.CognitiveServices/accounts/${FOUNDRY_ACCOUNT}?api-version=2025-06-01"
      BODY="$(mktemp)"
      cat > "$BODY" <<JSON
{
  "location": "${FOUNDRY_LOCATION}",
  "kind": "AIServices",
  "sku": {"name":"S0"},
  "identity": {"type":"SystemAssigned"},
  "properties": {
    "allowProjectManagement": true,
    "customSubDomainName": "${FOUNDRY_ACCOUNT}",
    "publicNetworkAccess": "Enabled"
  }
}
JSON
      az rest --method put --url "$ARM_URL" --headers "Content-Type=application/json" --body "@$BODY" -o none
      rm -f "$BODY"
  fi
fi

ACTUAL_FOUNDRY_LOCATION="$(az cognitiveservices account show --subscription "$SUB_ID" -g "$AZ_RESOURCE_GROUP" -n "$FOUNDRY_ACCOUNT" --query location -o tsv | awk '{print tolower($0)}' | sed 's/[[:space:]]//g')"
[[ "$ACTUAL_FOUNDRY_LOCATION" == "centralindia" || "$ACTUAL_FOUNDRY_LOCATION" == "southindia" ]] || { echo "Foundry resource is outside India: $ACTUAL_FOUNDRY_LOCATION"; exit 1; }

section "CREATE / REUSE FOUNDRY PROJECT"

if ! az cognitiveservices account project show --subscription "$SUB_ID" --name "$FOUNDRY_ACCOUNT" --resource-group "$AZ_RESOURCE_GROUP" --project-name "$FOUNDRY_PROJECT_NAME" >/dev/null 2>&1; then
  if ! az cognitiveservices account project create \
    --subscription "$SUB_ID" \
    --name "$FOUNDRY_ACCOUNT" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --project-name "$FOUNDRY_PROJECT_NAME" \
    --location "$FOUNDRY_LOCATION" \
    --assign-identity \
    -o none; then
      PROJECT_URL="https://management.azure.com/subscriptions/${SUB_ID}/resourceGroups/${AZ_RESOURCE_GROUP}/providers/Microsoft.CognitiveServices/accounts/${FOUNDRY_ACCOUNT}/projects/${FOUNDRY_PROJECT_NAME}?api-version=2025-06-01"
      PBODY="$(mktemp)"
      cat > "$PBODY" <<JSON
{
  "location":"${FOUNDRY_LOCATION}",
  "identity":{"type":"SystemAssigned"},
  "properties":{"displayName":"${FOUNDRY_PROJECT_NAME}","description":"WineShopPOS AI Owner Assistant V1"}
}
JSON
      az rest --method put --url "$PROJECT_URL" --headers "Content-Type=application/json" --body "@$PBODY" -o none
      rm -f "$PBODY"
  fi
fi

PROJECT_ID="$(az cognitiveservices account project show --subscription "$SUB_ID" --name "$FOUNDRY_ACCOUNT" --resource-group "$AZ_RESOURCE_GROUP" --project-name "$FOUNDRY_PROJECT_NAME" --query id -o tsv)"
PROJECT_ENDPOINT="$(az cognitiveservices account project show --subscription "$SUB_ID" --name "$FOUNDRY_ACCOUNT" --resource-group "$AZ_RESOURCE_GROUP" --project-name "$FOUNDRY_PROJECT_NAME" --query 'properties.endpoints."AI Foundry API"' -o tsv)"
[[ -n "$PROJECT_ID" && -n "$PROJECT_ENDPOINT" ]] || { echo "Could not resolve Foundry project metadata."; exit 1; }

section "FOUNDRY MODEL DEPLOYMENT"

EXISTING="$(az cognitiveservices account deployment list --subscription "$SUB_ID" --name "$FOUNDRY_ACCOUNT" --resource-group "$AZ_RESOURCE_GROUP" --query "[?properties.model.name=='${MODEL_NAME}' && properties.provisioningState=='Succeeded'].name | [0]" -o tsv 2>/dev/null || true)"
if [[ -n "$EXISTING" && "$EXISTING" != "None" ]]; then
  MODEL_DEPLOYMENT="$EXISTING"
  echo "Reusing deployment: $MODEL_DEPLOYMENT"
else
  echo "A usage-billed Foundry model deployment is required."
  echo "Region: $FOUNDRY_LOCATION"
  echo "Model: $MODEL_NAME"
  echo "Version: $MODEL_VERSION"
  echo "SKU: GlobalStandard"
  if [[ "${WSP_AI_CONFIRM_PAID_MODEL:-}" != "YES" ]]; then
    read -r -p "Type DEPLOY AI to continue: " CONFIRM
    [[ "$CONFIRM" == "DEPLOY AI" ]] || { echo "Cancelled. Core POS remains unaffected."; exit 1; }
  fi
  az cognitiveservices account deployment create \
    --subscription "$SUB_ID" \
    --name "$FOUNDRY_ACCOUNT" \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --deployment-name "$MODEL_DEPLOYMENT" \
    --model-name "$MODEL_NAME" \
    --model-version "$MODEL_VERSION" \
    --model-format OpenAI \
    --sku-name GlobalStandard \
    --sku-capacity 10 \
    -o none
fi

STATE="$(az cognitiveservices account deployment show --subscription "$SUB_ID" --name "$FOUNDRY_ACCOUNT" --resource-group "$AZ_RESOURCE_GROUP" --deployment-name "$MODEL_DEPLOYMENT" --query properties.provisioningState -o tsv)"
[[ "$STATE" == "Succeeded" ]] || { echo "Model deployment state: $STATE"; exit 1; }

section "FOUNDRY RBAC FOR AGENT CONFIGURATION"

FOUNDRY_USER_ROLE_ID="53ca6127-db72-4b80-b1b0-d745d6d5456d"
AGENT_CONSUMER_ROLE_ID="eed3b665-ab3a-47b6-8f48-c9382fb1dad6"
SIGNED_IN_ID="$(az ad signed-in-user show --query id -o tsv 2>/dev/null || true)"
[[ -n "$SIGNED_IN_ID" ]] || { echo "Could not resolve signed-in Azure user object ID."; exit 1; }

az role assignment create --assignee-object-id "$SIGNED_IN_ID" --assignee-principal-type User --role "$FOUNDRY_USER_ROLE_ID" --scope "$PROJECT_ID" -o none 2>/dev/null || true

section "CREATE / REUSE CENTRAL INDIA FUNCTION APP — CONSUMPTION ONLY"

if ! az storage account show -g "$AZ_RESOURCE_GROUP" -n "$FUNCTION_STORAGE" >/dev/null 2>&1; then
  az storage account create --name "$FUNCTION_STORAGE" --resource-group "$AZ_RESOURCE_GROUP" --location "$FUNCTION_LOCATION" --sku Standard_LRS --kind StorageV2 -o none
fi

if ! az functionapp show -g "$AZ_RESOURCE_GROUP" -n "$FUNCTION_APP" >/dev/null 2>&1; then
  az functionapp create \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --name "$FUNCTION_APP" \
    --storage-account "$FUNCTION_STORAGE" \
    --consumption-plan-location "$FUNCTION_LOCATION" \
    --runtime node \
    --runtime-version 22 \
    --functions-version 4 \
    --os-type Linux \
    -o none || \
  az functionapp create \
    --resource-group "$AZ_RESOURCE_GROUP" \
    --name "$FUNCTION_APP" \
    --storage-account "$FUNCTION_STORAGE" \
    --consumption-plan-location "$FUNCTION_LOCATION" \
    --runtime node \
    --functions-version 4 \
    --os-type Linux \
    -o none
fi

FUNCTION_APP_LOCATION="$(az functionapp show -g "$AZ_RESOURCE_GROUP" -n "$FUNCTION_APP" --query location -o tsv | awk '{print tolower($0)}' | sed 's/[[:space:]]//g')"
if [[ "$FUNCTION_APP_LOCATION" != "centralindia" && "$FUNCTION_APP_LOCATION" != "central india" ]]; then
  echo "Safety guard: Function App region is not Central India: $FUNCTION_APP_LOCATION"
  exit 1
fi

PLAN_ID="$(az functionapp show -g "$AZ_RESOURCE_GROUP" -n "$FUNCTION_APP" --query serverFarmId -o tsv)"
PLAN_SKU="$(az appservice plan show --ids "$PLAN_ID" --query sku.name -o tsv 2>/dev/null || true)"
if [[ "$PLAN_SKU" != "Y1" ]]; then
  echo "Safety guard: expected Consumption Y1, detected ${PLAN_SKU:-UNKNOWN}."
  echo "Stopping to avoid Premium/Dedicated/Always-On billing."
  exit 1
fi

echo "Function plan verified: Consumption Y1"
echo "Function region verified: Central India"

PRINCIPAL_ID="$(az functionapp identity assign -g "$AZ_RESOURCE_GROUP" -n "$FUNCTION_APP" --query principalId -o tsv)"
az role assignment create --assignee-object-id "$PRINCIPAL_ID" --assignee-principal-type ServicePrincipal --role "$AGENT_CONSUMER_ROLE_ID" --scope "$PROJECT_ID" -o none 2>/dev/null || true

section "CONFIGURE ONE OWNER AGENT"

pushd azure-functions/ai-owner-assistant >/dev/null
npm install --no-audit --no-fund
npm run check
npm test

FOUNDRY_PROJECT_ENDPOINT="$PROJECT_ENDPOINT" \
FOUNDRY_AGENT_NAME="$AGENT_NAME" \
FOUNDRY_MODEL_DEPLOYMENT="$MODEL_DEPLOYMENT" \
node scripts/configure-agent.mjs
popd >/dev/null

section "CONFIGURE AND DEPLOY FUNCTION"

[[ -f .env.local ]] || { echo ".env.local not found."; exit 1; }
SUPABASE_URL="$(grep -E '^VITE_SUPABASE_URL=' .env.local | tail -1 | cut -d= -f2- | tr -d '\r' || true)"
SUPABASE_PUBLIC_KEY="$(grep -E '^VITE_SUPABASE_PUBLISHABLE_KEY=' .env.local | tail -1 | cut -d= -f2- | tr -d '\r' || true)"
if [[ -z "$SUPABASE_PUBLIC_KEY" ]]; then SUPABASE_PUBLIC_KEY="$(grep -E '^VITE_SUPABASE_ANON_KEY=' .env.local | tail -1 | cut -d= -f2- | tr -d '\r' || true)"; fi
[[ -n "$SUPABASE_URL" && -n "$SUPABASE_PUBLIC_KEY" ]] || { echo "Could not resolve browser-safe Supabase config."; exit 1; }

az functionapp config appsettings set -g "$AZ_RESOURCE_GROUP" -n "$FUNCTION_APP" --settings \
  "SUPABASE_URL=$SUPABASE_URL" \
  "SUPABASE_PUBLISHABLE_KEY=$SUPABASE_PUBLIC_KEY" \
  "FOUNDRY_PROJECT_ENDPOINT=$PROJECT_ENDPOINT" \
  "FOUNDRY_AGENT_NAME=$AGENT_NAME" \
  "FOUNDRY_MODEL_DEPLOYMENT=$MODEL_DEPLOYMENT" \
  "BUSINESS_TIMEZONE=Asia/Kolkata" \
  "BUSINESS_CURRENCY=INR" \
  "AI_REQUEST_TIMEOUT_MS=45000" \
  "AI_MAX_TOOL_CALLS=6" \
  "AI_MAX_TOOL_ROUNDS=4" \
  "AI_MAX_OUTPUT_TOKENS=900" \
  "SCM_DO_BUILD_DURING_DEPLOYMENT=true" \
  "ENABLE_ORYX_BUILD=true" \
  "FUNCTIONS_WORKER_RUNTIME=node" -o none

for origin in "https://wineshoppos.z29.web.core.windows.net" "http://localhost:5173" "http://localhost:5174"; do
  az functionapp cors add -g "$AZ_RESOURCE_GROUP" -n "$FUNCTION_APP" --allowed-origins "$origin" -o none >/dev/null 2>&1 || true
done

pushd azure-functions/ai-owner-assistant >/dev/null
rm -f ai-owner-function.zip
if command -v zip >/dev/null 2>&1; then
  zip -qr ai-owner-function.zip host.json package.json package-lock.json src .funcignore
else
  npx bestzip ai-owner-function.zip host.json package.json package-lock.json "src/**" .funcignore
fi
az functionapp deployment source config-zip -g "$AZ_RESOURCE_GROUP" -n "$FUNCTION_APP" --src ai-owner-function.zip --build-remote true -o none
rm -f ai-owner-function.zip
popd >/dev/null

FUNCTION_BASE_URL="https://${FUNCTION_APP}.azurewebsites.net"
for attempt in 1 2 3 4 5 6; do
  code="$(curl -sS -o /tmp/wsp_ai_health.json -w '%{http_code}' "${FUNCTION_BASE_URL}/api/ai/health" || true)"
  [[ "$code" == "200" ]] && break
  sleep 10
done
[[ "${code:-}" == "200" ]] || { cat /tmp/wsp_ai_health.json 2>/dev/null || true; echo "Function health check failed."; exit 1; }
rm -f /tmp/wsp_ai_health.json

section "FRONTEND BUILD + AZURE STATIC SITE"

python - <<PY
from pathlib import Path
p=Path('.env.local')
text=p.read_text(encoding='utf-8') if p.exists() else ''
vals={'VITE_AI_API_URL':'$FUNCTION_BASE_URL','VITE_AI_OWNER_ENABLED':'true'}
lines=text.splitlines()
for k,v in vals.items():
    found=False
    for i,line in enumerate(lines):
        if line.startswith(k+'='):
            lines[i]=f'{k}={v}'; found=True; break
    if not found: lines.append(f'{k}={v}')
p.write_text('\n'.join(lines).rstrip()+'\n',encoding='utf-8')
PY

npm run build
npm run lint
cp dist/index.html dist/404.html

WEB_STORAGE_ACCOUNT="wineshoppos"
WEB_KEY="$(az storage account keys list -g "$AZ_RESOURCE_GROUP" -n "$WEB_STORAGE_ACCOUNT" --query '[0].value' -o tsv)"
az storage blob service-properties update --account-name "$WEB_STORAGE_ACCOUNT" --account-key "$WEB_KEY" --static-website --index-document index.html --404-document 404.html -o none
az storage blob upload-batch --account-name "$WEB_STORAGE_ACCOUNT" --account-key "$WEB_KEY" --destination '$web' --source dist --overwrite true -o none
unset WEB_KEY SUPABASE_PUBLIC_KEY

LIVE_URL="$(az storage account show -g "$AZ_RESOURCE_GROUP" -n "$WEB_STORAGE_ACCOUNT" --query primaryEndpoints.web -o tsv)"

section "UPDATE DEPLOYMENT METADATA + GIT"

cat > docs/ai/DEPLOYMENT_METADATA.md <<DOC
# AI Owner Assistant V1 — Deployment Metadata

Generated: $RUN_ID

- Resource group: \`$AZ_RESOURCE_GROUP\`
- Function region: \`Central India\`
- Function plan: \`Consumption Y1\`
- Foundry region: \`$FOUNDRY_LOCATION\`
- Foundry resource: \`$FOUNDRY_ACCOUNT\`
- Foundry project: \`$FOUNDRY_PROJECT_NAME\`
- Model: \`$MODEL_NAME\`
- Model deployment: \`$MODEL_DEPLOYMENT\`
- Owner agent: \`$AGENT_NAME\`
- Function App: \`$FUNCTION_APP\`
- Function base URL: \`$FUNCTION_BASE_URL\`
- Supabase project ref: \`$SUPABASE_PROJECT_REF\`
- AI migration: \`20260830070000_ai_owner_assistant_v1.sql\`
- Live frontend: \`$LIVE_URL\`
- AI V1: \`READ_ONLY / PRO\`

No credentials are stored here.
DOC

git add docs/ai docs/handoff scripts/repair_resume_ai_india_only_v2.sh
if ! git diff --cached --quiet; then git commit -m "docs: record India-only AI cloud deployment configuration"; fi

git push origin main

section "AI INDIA-ONLY DEPLOYMENT COMPLETE"
echo "Live app: $LIVE_URL"
echo "AI Function: $FUNCTION_BASE_URL"
echo "Foundry: $FOUNDRY_LOCATION / $MODEL_NAME"
echo "Function: Central India / Consumption Y1"
echo "Resource group: wineshopPOS"
echo "Supabase migration: already applied"
echo "Legacy East US Foundry is preserved for cleanup only after India verification."
echo
echo "Next: ADMIN -> Owner Center -> Ask WineShopPOS and run tenant-isolation smoke tests."
