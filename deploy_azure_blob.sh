#!/usr/bin/env bash
set -euo pipefail

cd /e/WineShopPOS

SUBSCRIPTION="Azure subscription 1"
RESOURCE_GROUP="wineshopPOS"
STORAGE_ACCOUNT="wineshoppos"

echo "=== WineShopPOS -> Azure Blob Static Website ==="

if ! command -v az >/dev/null 2>&1; then
  echo "ERROR: Azure CLI (az) is not installed."
  echo "Install Azure CLI, reopen Git Bash, then run this script again."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is not installed."
  exit 1
fi

# Blob static hosting works best with hash routing.
node <<'NODE'
const fs = require("fs");
const file = "src/main.jsx";

if (!fs.existsSync(file)) {
  console.error("src/main.jsx not found");
  process.exit(1);
}

let text = fs.readFileSync(file, "utf8");

if (text.includes("BrowserRouter")) {
  text = text.replaceAll("BrowserRouter", "HashRouter");
  fs.writeFileSync(file, text);
  console.log("Changed BrowserRouter -> HashRouter for Azure Blob hosting.");
} else if (text.includes("HashRouter")) {
  console.log("HashRouter already configured.");
} else {
  console.log("Router name not found in main.jsx; no router patch applied.");
}
NODE

echo "Logging in to Azure..."
az login

echo "Selecting subscription..."
az account set --subscription "$SUBSCRIPTION"

echo "Verifying storage account..."
az storage account show \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --output none

echo "Enabling Azure Storage static website..."
az storage blob service-properties update \
  --account-name "$STORAGE_ACCOUNT" \
  --static-website true \
  --index-document index.html \
  --404-document index.html \
  --auth-mode login \
  --output none

echo "Building production frontend..."
npm run build

# Helpful fallback document.
cp dist/index.html dist/404.html

echo "Uploading dist/ to \$web..."
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

mkdir -p docs/chapters

cat > docs/chapters/13-azure-blob-hosting.md <<EOF
# Chapter 13 — Azure Blob Static Hosting

Status: DEPLOYED

Azure subscription: ${SUBSCRIPTION}
Resource group: ${RESOURCE_GROUP}
Storage account: ${STORAGE_ACCOUNT}

Hosting model:

React/Vite build -> dist -> Azure Storage \$web container.

Router:

HashRouter is used so client-side routes work reliably on Blob static hosting.

Static website URL:

${SITE_URL}

Deployment command:

\`\`\`bash
bash deploy_azure_blob.sh
\`\`\`
EOF

git add src/main.jsx docs/chapters/13-azure-blob-hosting.md deploy_azure_blob.sh 2>/dev/null || true

if ! git diff --cached --quiet; then
  git commit -m "Chapter 13 - Azure Blob static website deployment"
  git push
fi

echo
echo "============================================================"
echo "DEPLOYMENT COMPLETE"
echo "Website: $SITE_URL"
echo "============================================================"
