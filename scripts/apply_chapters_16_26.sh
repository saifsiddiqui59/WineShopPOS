#!/usr/bin/env bash
set -euo pipefail

PACKAGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="/e/WineShopPOS"
PROJECT_REF="uiurgplnsgmawvxhjzzp"
AZ_SUBSCRIPTION="Azure subscription 1"
AZ_RG="wineshopPOS"
AZ_STORAGE="wineshoppos"

say() { printf '\n============================================================\n%s\n============================================================\n' "$1"; }
fail() { echo "ERROR: $*" >&2; exit 1; }

say "WineShopPOS Chapters 16-26 FINAL RELEASE"

test -d "$PROJECT_ROOT/.git" || fail "$PROJECT_ROOT is not the WineShopPOS Git repository."
test -d "$PACKAGE_DIR/source" || fail "Release package source/ folder is missing. Extract the full ZIP first."
test -f "$PACKAGE_DIR/release_docs/WineShopPOS_Developer_Handbook_Chapters_16_26.docx" || fail "Developer handbook missing from release package."

cd "$PROJECT_ROOT"

BRANCH="$(git branch --show-current)"
[[ "$BRANCH" == "main" ]] || fail "Please run this release from Git branch main. Current branch: $BRANCH"

# Checkpoint only existing TRACKED modifications. Untracked personal/download files are not staged.
if ! git diff --quiet || ! git diff --cached --quiet; then
  say "Creating local checkpoint for existing tracked work"
  git add -u
  if ! git diff --cached --quiet; then
    git commit -m "Checkpoint before Chapters 16-26 production expansion"
  fi
fi

say "Applying Chapters 16-26 source overlay"
cp -R "$PACKAGE_DIR/source/." "$PROJECT_ROOT/"
mkdir -p docs/handbook docs/manual scripts docs/azure
cp "$PACKAGE_DIR/release_docs/WineShopPOS_Developer_Handbook_Chapters_16_26.docx" docs/handbook/
cp "$PACKAGE_DIR/release_docs/WineShopPOS_User_Manual_Advanced.docx" docs/manual/
cp "$PACKAGE_DIR/apply_chapters_16_26.sh" scripts/apply_chapters_16_26.sh
cp "$PACKAGE_DIR/create_document_intelligence_f0.sh" scripts/create_document_intelligence_f0.sh
chmod +x scripts/apply_chapters_16_26.sh scripts/create_document_intelligence_f0.sh

# Add web manifest if the older Chapter 15 index does not already reference it.
node <<'NODE'
const fs = require("fs");
const file = "index.html";
let text = fs.readFileSync(file, "utf8");
if (!text.includes("manifest.webmanifest")) {
  text = text.replace(/<\/head>/i, '  <link rel="manifest" href="./manifest.webmanifest" />\n</head>');
  fs.writeFileSync(file, text);
  console.log("Added manifest.webmanifest link to index.html");
}
NODE

# ------------------------------------------------------------
# GATE 1: front-end build BEFORE any database changes.
# ------------------------------------------------------------
say "Gate 1 - Production build before cloud changes"
npm run build

# ------------------------------------------------------------
# Azure Document Intelligence: F0 ONLY, no paid fallback.
# Do this before DB changes so OCR configuration is known early.
# ------------------------------------------------------------
say "Creating/reusing Azure Document Intelligence F0"
command -v az >/dev/null 2>&1 || fail "Azure CLI is required. Install az, reopen Git Bash, rerun."
OCR_SECRET_FILE="$(mktemp "${TMPDIR:-/tmp}/wineshop-ocr-secrets.XXXXXX")"
chmod 600 "$OCR_SECRET_FILE" 2>/dev/null || true
trap 'rm -f "$OCR_SECRET_FILE"' EXIT

set +e
OCR_OUTPUT="$(WINESHOP_OCR_SECRET_FILE="$OCR_SECRET_FILE" \
  WINESHOP_OCR_METADATA_FILE="$PROJECT_ROOT/docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md" \
  bash "$PACKAGE_DIR/create_document_intelligence_f0.sh" 2>&1)"
OCR_RC=$?
set -e
printf '%s\n' "$OCR_OUTPUT"

OCR_READY=false
if [[ $OCR_RC -eq 0 ]]; then
  OCR_READY=true
elif [[ $OCR_RC -eq 20 ]]; then
  echo "WARNING: F0 is unavailable. Continuing Chapters 16-25 and deploying OCR function unconfigured."
  echo "No S0/paid OCR resource was created."
  cat > docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md <<'EOF'
# Azure Document Intelligence — WineShopPOS

Status: **F0 unavailable during release**.

The installer deliberately did **not** create S0 or another paid OCR resource. The OCR Edge Function can still be deployed, but will return `OCR_NOT_CONFIGURED` until an F0 (or manually approved paid resource) is configured later.
EOF
else
  fail "Azure Document Intelligence provisioning failed unexpectedly (exit $OCR_RC). No paid fallback was attempted."
fi

# ------------------------------------------------------------
# Supabase CLI + additive DB migration.
# ------------------------------------------------------------
say "Supabase migration preflight"
if ! npx supabase --version >/dev/null 2>&1; then
  echo "Installing Supabase CLI locally as dev dependency..."
  npm install supabase --save-dev
fi

# Re-linking is safe and verifies the intended remote project.
npx supabase link --project-ref "$PROJECT_REF"

say "Supabase migration DRY RUN"
npx supabase db push --dry-run

say "Applying additive Chapters 16-26 migration"
npx supabase db push

# Upload Azure OCR secrets only after migration succeeds.
if [[ "$OCR_READY" == "true" ]]; then
  say "Storing Azure OCR endpoint/key in Supabase Edge Function secrets"
  npx supabase secrets set --env-file "$OCR_SECRET_FILE" --project-ref "$PROJECT_REF"
  : > "$OCR_SECRET_FILE"
fi
rm -f "$OCR_SECRET_FILE"
trap - EXIT

say "Deploying OCR Edge Function"
npx supabase functions deploy ocr-invoice --project-ref "$PROJECT_REF" --use-api

# ------------------------------------------------------------
# GATE 2: final production build after migration/function source.
# ------------------------------------------------------------
say "Gate 2 - Final production build"
npm run build
cp dist/index.html dist/404.html

# ------------------------------------------------------------
# Git release commit. Stage explicit project paths, never .env.local.
# ------------------------------------------------------------
say "Creating local release commit"
git add \
  src \
  public \
  index.html \
  supabase/migrations \
  supabase/functions/ocr-invoice \
  supabase/config.toml \
  docs \
  scripts/apply_chapters_16_26.sh \
  scripts/create_document_intelligence_f0.sh \
  package.json
if [[ -f package-lock.json ]]; then git add package-lock.json; fi

if git diff --cached --quiet; then
  echo "No staged application changes found; using current HEAD as release commit."
else
  git commit -m "Chapters 16-26 - Production operations offline OCR and audit"
fi
RELEASE_COMMIT="$(git rev-parse HEAD)"

# ------------------------------------------------------------
# Generate ACTUAL Git code history from the release commit.
# ------------------------------------------------------------
say "Generating actual Git code-history for Chapters 16-26"
export RELEASE_COMMIT
node <<'NODE'
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const hash = process.env.RELEASE_COMMIT;
const out = path.join("docs", "code-history");
fs.mkdirSync(out, { recursive: true });

function git(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8", maxBuffer: 1024 * 1024 * 250 });
  } catch { return ""; }
}
function at(file) { return git(["show", `${hash}:${file}`]); }
function exists(file) {
  try { execFileSync("git", ["cat-file", "-e", `${hash}:${file}`], { stdio: "ignore" }); return true; }
  catch { return false; }
}
function lang(file) {
  const ext = path.extname(file).toLowerCase();
  return ({".jsx":"jsx",".js":"javascript",".ts":"typescript",".css":"css",".sql":"sql",".md":"markdown",".json":"json"})[ext] || "text";
}
function fence(text) { return text.replace(/`````/g, "````\\`"); }
const meta = git(["show","-s","--format=Commit: %H%nShort: %h%nAuthor: %an <%ae>%nDate: %ad%nSubject: %s","--date=iso-strict",hash]).trim();
const changed = git(["diff-tree","--no-commit-id","--name-status","-r","-M",hash]).trim();
const patch = git(["show","--format=fuller","--find-renames","--stat","--patch",hash]);

const featureFiles = {
  16:["src/context/ScannerContext.jsx","src/pages/POS.jsx","src/pages/ScannerSettings.jsx","src/pages/AddProduct.jsx","src/context/ShopContext.jsx"],
  17:["src/pages/Returns.jsx","src/context/ShopContext.jsx","supabase/migrations/20260829190000_chapters_16_26.sql"],
  18:["src/pages/Shifts.jsx","src/pages/POS.jsx","supabase/migrations/20260829190000_chapters_16_26.sql"],
  19:["src/pages/StockCount.jsx","src/context/ScannerContext.jsx","supabase/migrations/20260829190000_chapters_16_26.sql"],
  20:["src/components/Receipt80mm.jsx","src/pages/PrinterSettings.jsx","src/pages/SaleDetails.jsx","src/chapters16to26.css"],
  21:["src/pages/Procurement.jsx","src/pages/Purchases.jsx","src/pages/PriceHistory.jsx","supabase/migrations/20260829190000_chapters_16_26.sql"],
  22:["src/pages/Reorder.jsx","supabase/migrations/20260829190000_chapters_16_26.sql"],
  23:["src/pages/Transfers.jsx","supabase/migrations/20260829190000_chapters_16_26.sql"],
  24:["src/pages/Audit.jsx","src/components/Layout.jsx","src/context/AuthContext.jsx","src/context/ShopContext.jsx","supabase/migrations/20260829190000_chapters_16_26.sql"],
  25:["src/lib/offlineQueue.js","src/components/OfflineStatus.jsx","src/pages/OfflineQueue.jsx","src/pages/Shifts.jsx","src/context/AuthContext.jsx","src/context/ShopContext.jsx","public/sw.js","public/manifest.webmanifest","supabase/migrations/20260829190000_chapters_16_26.sql"],
  26:["src/pages/AutomationHub.jsx","src/pages/Purchases.jsx","supabase/functions/ocr-invoice/index.ts","supabase/migrations/20260829190000_chapters_16_26.sql","docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md"]
};

const combined = [];
combined.push("# WineShopPOS Chapters 16-26 — Actual Git Release History","");
combined.push("> Generated from the real release commit. Git is the source of truth; this is not reconstructed from chat memory.","");
combined.push("## Commit", "", "```text", meta, "```", "");
combined.push("## Changed files", "", "```text", changed || "(none)", "```", "");
combined.push("## Exact release patch", "", "`````diff", fence(patch).trimEnd(), "`````", "");
fs.writeFileSync(path.join(out,"chapters-16-26-release.md"), combined.join("\n")+"\n");

for (let chapter=16; chapter<=26; chapter++) {
  const lines=[];
  lines.push(`# Chapter ${chapter} — Actual Release Code`,"");
  lines.push("> This chapter was delivered in the combined Chapters 16-26 release commit.","");
  lines.push("## Shared release commit","","```text",meta,"```","");
  lines.push("## Feature-specific canonical source snapshots","");
  for (const file of featureFiles[chapter] || []) {
    if (!exists(file)) continue;
    lines.push(`### \`${file}\``,"",`\`\`\`\`\`${lang(file)}`,fence(at(file)).trimEnd(),"`````","");
  }
  fs.writeFileSync(path.join(out,`chapter-${chapter}-code.md`),lines.join("\n")+"\n");
}

const index=["# Chapters 16-26 Code History","",`Release commit: \`${hash}\``,"","All chapter files are generated from that exact combined release commit.",""];
for(let c=16;c<=26;c++) index.push(`- [Chapter ${c}](chapter-${c}-code.md)`);
index.push("- [Combined exact patch](chapters-16-26-release.md)","");
fs.writeFileSync(path.join(out,"README-16-26.md"),index.join("\n"));
console.log(`Generated code history from ${hash}`);
NODE

git add docs/code-history
if ! git diff --cached --quiet; then
  git commit -m "Docs - Add actual Git code history for Chapters 16-26"
fi

# ONE network Git push for checkpoint/release/history commits.
say "Pushing all release commits to GitHub once"
git push origin main

# ------------------------------------------------------------
# Azure Blob deployment.
# ------------------------------------------------------------
say "Deploying final Vite build to Azure Blob static website"
az account set --subscription "$AZ_SUBSCRIPTION"
az storage account show -n "$AZ_STORAGE" -g "$AZ_RG" -o none
STORAGE_KEY="$(az storage account keys list -n "$AZ_STORAGE" -g "$AZ_RG" --query '[0].value' -o tsv)"
[[ -n "$STORAGE_KEY" ]] || fail "Could not retrieve Azure Storage account key."

az storage blob service-properties update \
  --account-name "$AZ_STORAGE" \
  --account-key "$STORAGE_KEY" \
  --static-website true \
  --index-document index.html \
  --404-document 404.html \
  -o none

az storage blob upload-batch \
  --account-name "$AZ_STORAGE" \
  --account-key "$STORAGE_KEY" \
  --destination '$web' \
  --source dist \
  --overwrite true \
  -o none
unset STORAGE_KEY

SITE_URL="$(az storage account show -n "$AZ_STORAGE" -g "$AZ_RG" --query primaryEndpoints.web -o tsv)"

say "RELEASE COMPLETE"
echo "Website: $SITE_URL"
echo "Git release commit: $RELEASE_COMMIT"
echo "Supabase project: $PROJECT_REF"
echo "OCR F0 configured: $OCR_READY"
if [[ "$OCR_READY" == "true" ]]; then
  echo "Azure OCR metadata: docs/azure/DOCUMENT_INTELLIGENCE_RESOURCE.md"
else
  echo "OCR is intentionally unconfigured because no free F0 resource was available. No paid fallback occurred."
fi
echo
echo "Run the manual smoke test: docs/testing/CHAPTERS_16_26_TEST_MATRIX.md"
