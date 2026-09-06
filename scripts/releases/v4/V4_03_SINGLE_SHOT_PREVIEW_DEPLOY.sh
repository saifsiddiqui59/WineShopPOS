#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-/e/WineShopPOS_V4}"
SUBSCRIPTION="${AZURE_SUBSCRIPTION:-Azure subscription 1}"
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-wineshopPOS}"
LOCATION="${AZURE_LOCATION:-centralindia}"
DEV_SUPABASE_REF="juhcypzoacauzmtzqnwd"

cd "$REPO_DIR"

echo "============================================================"
echo " WineShopPOS V4 — SINGLE-SHOT ISOLATED PREVIEW DEPLOY"
echo "============================================================"

# ------------------------------------------------------------
# 1. Hard safety guards
# ------------------------------------------------------------
BRANCH="$(git branch --show-current)"
if [[ "$BRANCH" != "V4" ]]; then
  echo "ERROR: Run this only from /e/WineShopPOS_V4 on branch V4."
  echo "Current branch: ${BRANCH:-unknown}"
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "ERROR: V4 has tracked/staged local changes."
  echo "Nothing was changed by this executor."
  git status --short
  exit 1
fi

git fetch origin V4 V3

V3_BEFORE="$(git rev-parse origin/V3)"
V4_LOCAL="$(git rev-parse HEAD)"
V4_REMOTE="$(git rev-parse origin/V4)"

echo "V3 baseline : $V3_BEFORE"
echo "V4 local    : $V4_LOCAL"
echo "V4 remote   : $V4_REMOTE"

if [[ "$V4_LOCAL" != "$V4_REMOTE" ]]; then
  echo "ERROR: Local V4 and origin/V4 are different."
  echo "Push/review V4 first; this script will not reset or overwrite anything."
  exit 1
fi

for cmd in git node npm npx az python curl; do
  command -v "$cmd" >/dev/null 2>&1 || {
    echo "ERROR: Missing required command: $cmd"
    exit 1
  }
done

# ------------------------------------------------------------
# 2. DEV environment isolation
# ------------------------------------------------------------
if [[ ! -f .env.local ]]; then
  echo "ERROR: .env.local is missing in V4."
  exit 1
fi

if ! grep -q "$DEV_SUPABASE_REF" .env.local; then
  echo "ERROR: V4 .env.local is not bound to DEV Supabase."
  echo "Expected project: $DEV_SUPABASE_REF"
  exit 1
fi

echo "DEV environment binding found: $DEV_SUPABASE_REF"

# ------------------------------------------------------------
# 3. Azure login/subscription
# ------------------------------------------------------------
if ! az account show >/dev/null 2>&1; then
  echo "Azure login required..."
  az login
fi

az account set --subscription "$SUBSCRIPTION"
az group show --name "$RESOURCE_GROUP" --output none

# ------------------------------------------------------------
# 4. Resolve/reuse isolated V4 storage account
# ------------------------------------------------------------
SHA_SHORT="$(git rev-parse --short=10 HEAD | tr -cd '[:alnum:]' | tr '[:upper:]' '[:lower:]')"
STORAGE_ACCOUNT="wspv4${SHA_SHORT}"
STORAGE_ACCOUNT="${STORAGE_ACCOUNT:0:24}"

NAME_AVAILABLE="$(az storage account check-name \
  --name "$STORAGE_ACCOUNT" \
  --query nameAvailable \
  -o tsv | tr '[:upper:]' '[:lower:]')"

if [[ "$NAME_AVAILABLE" != "true" ]]; then
  if ! az storage account show \
      --name "$STORAGE_ACCOUNT" \
      --resource-group "$RESOURCE_GROUP" \
      --output none 2>/dev/null; then
    RAND="$(printf '%06x' $(( (RANDOM << 1) ^ RANDOM )))"
    STORAGE_ACCOUNT="wspv4${SHA_SHORT:0:7}${RAND}"
    STORAGE_ACCOUNT="${STORAGE_ACCOUNT:0:24}"

    NAME_AVAILABLE="$(az storage account check-name \
      --name "$STORAGE_ACCOUNT" \
      --query nameAvailable \
      -o tsv | tr '[:upper:]' '[:lower:]')"

    if [[ "$NAME_AVAILABLE" != "true" ]]; then
      echo "ERROR: Could not find an available V4 preview storage-account name."
      exit 1
    fi
  fi
fi

if ! az storage account show \
    --name "$STORAGE_ACCOUNT" \
    --resource-group "$RESOURCE_GROUP" \
    --output none 2>/dev/null; then

  echo "Creating isolated V4 storage account: $STORAGE_ACCOUNT"

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
  echo "Reusing isolated V4 storage account: $STORAGE_ACCOUNT"
fi

# ------------------------------------------------------------
# 5. Use storage-account key for data-plane deployment
#    This avoids the Blob RBAC propagation/problem encountered earlier.
#    Key is held only in this shell process and is never printed/committed.
# ------------------------------------------------------------
echo "Obtaining temporary deployment credential..."

ACCOUNT_KEY="$(az storage account keys list \
  --account-name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --query '[0].value' \
  -o tsv)"

if [[ -z "$ACCOUNT_KEY" ]]; then
  echo "ERROR: Could not obtain the storage account deployment key."
  echo "Your Azure account needs permission to list keys for $STORAGE_ACCOUNT."
  exit 1
fi

echo "Enabling Azure Static Website..."
az storage blob service-properties update \
  --account-name "$STORAGE_ACCOUNT" \
  --account-key "$ACCOUNT_KEY" \
  --static-website true \
  --index-document index.html \
  --404-document index.html \
  --output none

# ------------------------------------------------------------
# 6. Build/test V4
# ------------------------------------------------------------
echo "Installing exact dependencies..."
npm ci

echo "Checking DEV environment isolation..."
npm run guard:env

echo "Running lint..."
npm run lint

echo "Building V4..."
npx vite build

cp dist/index.html dist/404.html

# ------------------------------------------------------------
# 7. Deploy only to V4 storage
# ------------------------------------------------------------
echo "Uploading V4 build..."
az storage blob upload-batch \
  --account-name "$STORAGE_ACCOUNT" \
  --account-key "$ACCOUNT_KEY" \
  --destination '$web' \
  --source dist \
  --overwrite true \
  --output none

SITE_URL="$(az storage account show \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --query 'primaryEndpoints.web' \
  -o tsv)"

SITE_URL="${SITE_URL%/}/"

echo "V4 preview URL: $SITE_URL"

# ------------------------------------------------------------
# 8. Point V4 Windows setup to the new V4-only URL
# ------------------------------------------------------------
python - "$SITE_URL" <<'PY'
from pathlib import Path
import re
import sys

url = sys.argv[1]

setup = Path("V4_Windows_App_Setup.cmd")
if not setup.exists():
    raise SystemExit("Missing V4_Windows_App_Setup.cmd")

text = setup.read_text(encoding="utf-8")
text, n = re.subn(
    r'^set "APP_URL=.*"$',
    f'set "APP_URL={url}"',
    text,
    count=1,
    flags=re.M,
)
if n != 1:
    raise SystemExit("Could not update APP_URL in V4_Windows_App_Setup.cmd")

setup.write_text(text, encoding="utf-8", newline="\n")

notes = Path("docs/v4/V4_APP_SETUP.md")
if not notes.exists():
    raise SystemExit("Missing docs/v4/V4_APP_SETUP.md")

text = notes.read_text(encoding="utf-8")

text = re.sub(
    r'Current (?:DEV|isolated V4) preview URL embedded in the setup:\n\n`[^`]+`',
    f'Current isolated V4 preview URL embedded in the setup:\n\n`{url}`',
    text,
    count=1,
)

old = (
    "> The preview host is the existing DEV preview endpoint. "
    "Deploy V4 to that DEV preview endpoint before treating the launcher "
    "as a V4 hosted preview. Production is not touched by this setup."
)
new = (
    f"> V4 uses its own isolated Azure Static Website preview: `{url}`. "
    "V3 preview and production are not overwritten by this deployment."
)

if old in text:
    text = text.replace(old, new)
elif "V4 uses its own isolated Azure Static Website preview:" not in text:
    text += "\n\n" + new + "\n"

notes.write_text(text, encoding="utf-8", newline="\n")
PY

mkdir -p docs/v4

cat > docs/v4/V4_PREVIEW_DEPLOYMENT.md <<EOF
# V4 Preview Deployment

Status: DEPLOYED

Branch: \`V4\`
Azure subscription: \`${SUBSCRIPTION}\`
Resource group: \`${RESOURCE_GROUP}\`
Storage account: \`${STORAGE_ACCOUNT}\`
Supabase environment: DEV \`${DEV_SUPABASE_REF}\`
Preview URL: \`${SITE_URL}\`

## Isolation

- V3 is not edited or deployed by this executor.
- Production storage account \`wineshoppos\` is not used.
- V4 preview uses its own Azure Static Website storage account.
- V4 remains bound to DEV Supabase.
- The storage account key is used only during deployment and is not written to Git.
EOF

# ------------------------------------------------------------
# 9. Smoke test before commit
# ------------------------------------------------------------
echo "Running hosted smoke test..."

HTTP_CODE=""
for attempt in 1 2 3 4 5 6; do
  HTTP_CODE="$(curl -L -sS -o /dev/null -w '%{http_code}' "$SITE_URL" || true)"
  if [[ "$HTTP_CODE" == "200" ]]; then
    break
  fi
  sleep 5
done

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "ERROR: Hosted V4 preview returned HTTP ${HTTP_CODE:-unknown}."
  echo "Deployment files remain uncommitted for review."
  exit 1
fi

# ------------------------------------------------------------
# 10. Commit only the intended V4 files
# ------------------------------------------------------------
UNEXPECTED="$(git status --porcelain --untracked-files=no \
  | awk '{print $2}' \
  | grep -v -E '^(V4_Windows_App_Setup\.cmd|docs/v4/V4_APP_SETUP\.md|docs/v4/V4_PREVIEW_DEPLOYMENT\.md)$' \
  || true)"

if [[ -n "$UNEXPECTED" ]]; then
  echo "ERROR: Unexpected tracked changes appeared:"
  echo "$UNEXPECTED"
  echo "Nothing has been committed."
  exit 1
fi

git add \
  V4_Windows_App_Setup.cmd \
  docs/v4/V4_APP_SETUP.md \
  docs/v4/V4_PREVIEW_DEPLOYMENT.md

if ! git diff --cached --quiet; then
  git commit -m "V4: deploy isolated app preview"
  git push origin V4
fi

# ------------------------------------------------------------
# 11. Final V3 safety verification
# ------------------------------------------------------------
V3_AFTER="$(git ls-remote origin refs/heads/V3 | awk '{print $1}')"

if [[ "$V3_AFTER" != "$V3_BEFORE" ]]; then
  echo "ERROR: origin/V3 changed while this script was running."
  echo "V4 deployment succeeded, but review upstream V3 activity."
  exit 1
fi

unset ACCOUNT_KEY

echo
echo "============================================================"
echo " V4 PREVIEW DEPLOYED SUCCESSFULLY"
echo "============================================================"
echo "Preview URL : $SITE_URL"
echo "Storage     : $STORAGE_ACCOUNT"
echo "HTTP        : $HTTP_CODE"
echo "V4 commit   : $(git rev-parse HEAD)"
echo "V3 unchanged: $V3_AFTER"
echo
echo "Next:"
echo "  Double-click V4_Windows_App_Setup.cmd"
echo "  It will create the WineShopPOS V4 Preview app shortcut."
echo "============================================================"
