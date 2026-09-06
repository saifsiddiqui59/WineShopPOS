#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-/e/WineShopPOS_V4}"
SOURCE_ENV_DIR="${SOURCE_ENV_DIR:-/e/WineShopPOS}"
SUBSCRIPTION="${AZURE_SUBSCRIPTION:-Azure subscription 1}"
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-wineshopPOS}"
LOCATION="${AZURE_LOCATION:-centralindia}"
DEV_SUPABASE_REF="juhcypzoacauzmtzqnwd"

cd "$REPO_DIR"

echo "============================================================"
echo " WineShopPOS V4 — ISOLATED PREVIEW DEPLOY"
echo "============================================================"

BRANCH="$(git branch --show-current)"
if [[ "$BRANCH" != "V4" ]]; then
  echo "ERROR: This executor may run only from branch V4. Current: ${BRANCH:-unknown}"
  exit 1
fi

# Never continue with tracked source changes. Untracked local evidence is left alone.
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: V4 has tracked/staged local changes. Commit/review them first."
  git status --short
  exit 1
fi

git fetch origin V4 V3
V3_BEFORE="$(git rev-parse origin/V3)"
V4_HEAD="$(git rev-parse HEAD)"
echo "V3 baseline : $V3_BEFORE"
echo "V4 head     : $V4_HEAD"

for cmd in git node npm az python curl; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "ERROR: missing command: $cmd"; exit 1; }
done

# V4 is a non-main branch and must build only against DEV Supabase.
if [[ ! -f .env.local ]]; then
  if [[ -f "$SOURCE_ENV_DIR/.env.local" ]] && grep -q "$DEV_SUPABASE_REF" "$SOURCE_ENV_DIR/.env.local"; then
    cp "$SOURCE_ENV_DIR/.env.local" .env.local
    echo "Copied verified DEV .env.local into V4 worktree (untracked)."
  else
    echo "ERROR: .env.local is missing in V4 and no verified DEV .env.local was found at $SOURCE_ENV_DIR/.env.local"
    echo "Expected DEV Supabase ref: $DEV_SUPABASE_REF"
    exit 1
  fi
fi

if ! grep -q "$DEV_SUPABASE_REF" .env.local; then
  echo "ERROR: V4 .env.local is not bound to DEV Supabase $DEV_SUPABASE_REF"
  exit 1
fi

# Reuse existing Azure login when possible.
if ! az account show >/dev/null 2>&1; then
  az login >/dev/null
fi
az account set --subscription "$SUBSCRIPTION"
az group show --name "$RESOURCE_GROUP" >/dev/null

# Deterministic globally-unique candidate based on the V4 commit; fallback to random suffix.
SHA_SHORT="$(git rev-parse --short=10 HEAD | tr -cd '[:alnum:]' | tr '[:upper:]' '[:lower:]')"
STORAGE_ACCOUNT="wspv4${SHA_SHORT}"
STORAGE_ACCOUNT="${STORAGE_ACCOUNT:0:24}"

NAME_AVAILABLE="$(az storage account check-name --name "$STORAGE_ACCOUNT" --query nameAvailable -o tsv | tr '[:upper:]' '[:lower:]')"
if [[ "$NAME_AVAILABLE" != "true" ]]; then
  # If the name already exists in this resource group, reuse it. Otherwise make a fresh name.
  if ! az storage account show --name "$STORAGE_ACCOUNT" --resource-group "$RESOURCE_GROUP" >/dev/null 2>&1; then
    RAND="$(printf '%06x' $(( (RANDOM << 1) ^ RANDOM )))"
    STORAGE_ACCOUNT="wspv4${SHA_SHORT:0:7}${RAND}"
    STORAGE_ACCOUNT="${STORAGE_ACCOUNT:0:24}"
    NAME_AVAILABLE="$(az storage account check-name --name "$STORAGE_ACCOUNT" --query nameAvailable -o tsv | tr '[:upper:]' '[:lower:]')"
    [[ "$NAME_AVAILABLE" == "true" ]] || { echo "ERROR: unable to find an available V4 preview storage name"; exit 1; }
  fi
fi

if ! az storage account show --name "$STORAGE_ACCOUNT" --resource-group "$RESOURCE_GROUP" >/dev/null 2>&1; then
  echo "Creating isolated V4 preview storage account: $STORAGE_ACCOUNT"
  az storage account create \
    --name "$STORAGE_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --sku Standard_LRS \
    --kind StorageV2 \
    --https-only true \
    --min-tls-version TLS1_2 \
    --allow-blob-public-access true \
    --output none
else
  echo "Reusing V4 preview storage account: $STORAGE_ACCOUNT"
fi

az storage blob service-properties update \
  --account-name "$STORAGE_ACCOUNT" \
  --static-website true \
  --index-document index.html \
  --404-document index.html \
  --auth-mode login \
  --output none

echo "Installing dependencies..."
npm ci

echo "Running V4 DEV environment guard..."
npm run guard:env

echo "Running lint..."
npm run lint

echo "Building V4 without generated-document side effects..."
npx vite build
cp dist/index.html dist/404.html

echo "Uploading V4 dist/ to isolated Azure Static Website..."
az storage blob upload-batch \
  --account-name "$STORAGE_ACCOUNT" \
  --destination '$web' \
  --source dist \
  --overwrite true \
  --auth-mode login \
  --output none

SITE_URL="$(az storage account show \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --query 'primaryEndpoints.web' \
  --output tsv)"
SITE_URL="${SITE_URL%/}/"

echo "V4 preview URL: $SITE_URL"

# Point the Windows app-mode launcher to this V4-only preview.
python - "$SITE_URL" <<'PY'
from pathlib import Path
import re, sys
url = sys.argv[1]

setup = Path('V4_Windows_App_Setup.cmd')
text = setup.read_text(encoding='utf-8')
text, n = re.subn(r'^set "APP_URL=.*"$', f'set "APP_URL={url}"', text, count=1, flags=re.M)
if n != 1:
    raise SystemExit('Could not update APP_URL in V4_Windows_App_Setup.cmd')
setup.write_text(text, encoding='utf-8', newline='\n')

notes = Path('docs/v4/V4_APP_SETUP.md')
text = notes.read_text(encoding='utf-8')
text = re.sub(
    r'Current DEV preview URL embedded in the setup:\n\n`[^`]+`',
    f'Current isolated V4 preview URL embedded in the setup:\n\n`{url}`',
    text,
    count=1,
)
old = '> The preview host is the existing DEV preview endpoint. Deploy V4 to that DEV preview endpoint before treating the launcher as a V4 hosted preview. Production is not touched by this setup.'
new = f'> V4 uses its own isolated Azure Static Website preview: `{url}`. V3 preview and production are not overwritten by this deployment.'
text = text.replace(old, new)
notes.write_text(text, encoding='utf-8', newline='\n')
PY

cat > docs/v4/V4_PREVIEW_DEPLOYMENT.md <<EOF2
# V4 Preview Deployment

Status: DEPLOYED
Branch: \`V4\`
Azure subscription: \`${SUBSCRIPTION}\`
Resource group: \`${RESOURCE_GROUP}\`
Storage account: \`${STORAGE_ACCOUNT}\`
Supabase environment: DEV \`${DEV_SUPABASE_REF}\`
Preview URL: \`${SITE_URL}\`

Isolation rules:
- V3 is not edited or deployed by this executor.
- Production storage account is not used.
- V4 preview uses its own Azure Static Website storage account.
- V4 remains bound to DEV Supabase by the existing environment guard.
EOF2

# Only the V4 preview setup/docs are allowed to be committed by this executor.
UNEXPECTED="$(git status --porcelain --untracked-files=no | awk '{print $2}' | grep -v -E '^(V4_Windows_App_Setup\.cmd|docs/v4/V4_APP_SETUP\.md|docs/v4/V4_PREVIEW_DEPLOYMENT\.md)$' || true)"
if [[ -n "$UNEXPECTED" ]]; then
  echo "ERROR: Unexpected tracked changes appeared during build/deploy:"
  echo "$UNEXPECTED"
  echo "Nothing has been committed. Review the V4 worktree."
  exit 1
fi

git add V4_Windows_App_Setup.cmd docs/v4/V4_APP_SETUP.md docs/v4/V4_PREVIEW_DEPLOYMENT.md
if ! git diff --cached --quiet; then
  git commit -m "V4: bind app setup to isolated preview"
  git push origin V4
fi

V3_AFTER="$(git ls-remote origin refs/heads/V3 | awk '{print $1}')"
if [[ "$V3_AFTER" != "$V3_BEFORE" ]]; then
  echo "ERROR: origin/V3 changed during this run. V4 deployment itself is complete, but review upstream V3 activity."
  exit 1
fi

HTTP_CODE="$(curl -L -sS -o /dev/null -w '%{http_code}' "$SITE_URL")"
if [[ "$HTTP_CODE" != "200" ]]; then
  echo "ERROR: V4 preview smoke check returned HTTP $HTTP_CODE"
  exit 1
fi

echo
echo "============================================================"
echo " V4 PREVIEW DEPLOYED"
echo " URL: $SITE_URL"
echo " Storage: $STORAGE_ACCOUNT"
echo " HTTP: $HTTP_CODE"
echo " V3 unchanged: $V3_AFTER"
echo "============================================================"
