#!/usr/bin/env bash
set -euo pipefail
[[ "$GITHUB_REF" == "refs/heads/main" ]] || { echo "::error::Only main can deploy PROD"; exit 1; }
WEB="https://wineshoppos.z29.web.core.windows.net/"
ACCOUNT="wineshoppos"
RG="wineshopPOS"
PROD_REF="uiurgplnsgmawvxhjzzp"
DEV_REF="juhcypzoacauzmtzqnwd"
mkdir -p "$RUNNER_TEMP/wsp-live" artifacts/prod-login-backup
SITE=$(az storage account show -g "$RG" -n "$ACCOUNT" --query primaryEndpoints.web -o tsv)
[[ "$SITE" == "$WEB" ]] || { echo "::error::Storage endpoint mismatch"; exit 1; }
curl -fLsS --max-time 45 "$WEB" -o "$RUNNER_TEMP/wsp-live/index.html"
node --input-type=module <<'NODE'
import fs from 'node:fs';
const dir=process.env.RUNNER_TEMP+'/wsp-live/';
const html=fs.readFileSync(dir+'index.html','utf8');
const scripts=[...html.matchAll(/<script[^>]*src=["']([^"']+\.js)["']/g)].map(x=>x[1]);
if(scripts.length!==1 || !scripts[0].startsWith('/assets/')) throw Error('Unexpected live JS structure');
fs.writeFileSync(dir+'script-path',scripts[0]+'\n');
NODE
while IFS= read -r path; do
  relpath=$(printf '%s' "$path" | cut -c2-)
  curl -fLsS --max-time 60 "$WEB$relpath" -o "$RUNNER_TEMP/wsp-live/$(basename "$path")"
done < "$RUNNER_TEMP/wsp-live/script-path"
node --input-type=module <<'NODE'
import fs from 'node:fs';
import path from 'node:path';
const dir=process.env.RUNNER_TEMP+'/wsp-live';
const content=fs.readdirSync(dir).filter(f=>f.endsWith('.js')).map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n');
if(!content.includes('uiurgplnsgmawvxhjzzp') || content.includes('juhcypzoacauzmtzqnwd')) throw Error('Live frontend is not PROD bound');
const candidates=[...new Set(content.match(/eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/g)||[])];
const valid=candidates.filter(s=>{
  try {
    const p=JSON.parse(Buffer.from(s.split('.')[1],'base64url').toString('utf8'));
    return p.ref==='uiurgplnsgmawvxhjzzp' && p.role==='anon';
  } catch { return false; }
});
if(valid.length!==1) throw Error('Unable to safely recover unique PROD public anon key');
fs.writeFileSync(path.join(dir,'public-anon-key'),valid[0],{mode:0o600});
const hosts=[...new Set(content.match(new RegExp('https?:[/][/][A-Za-z0-9.-]+[.]azurewebsites[.]net','gi'))||[])];
if(hosts.length!==2 ||
   !hosts.includes('https://wineshoppos-ai-1a61d5885c.azurewebsites.net') ||
   !hosts.includes('https://wsp-v3-invoice-53b6e9a1.azurewebsites.net'))
     throw Error('Live app API endpoints differ from verified production endpoints');
console.log('Existing PROD public anon key, AI and invoice endpoint confirmed');
NODE
export BRANCH_NAME=main
export SUPABASE_PROJECT_ID="$PROD_REF"
export VITE_SUPABASE_URL="https://$PROD_REF.supabase.co"
export VITE_SUPABASE_ANON_KEY="$(cat "$RUNNER_TEMP/wsp-live/public-anon-key")"
export VITE_AI_API_URL="https://wineshoppos-ai-1a61d5885c.azurewebsites.net"
echo "::add-mask::$VITE_SUPABASE_ANON_KEY"
npm ci
npm run docs:check
npm run lint
node --test tests/login_brand_orbit.test.mjs
npm run build
unset VITE_SUPABASE_ANON_KEY
JS_FILE=$(find dist/assets -maxdepth 1 -type f -name '*.js' | head -n 1)
[[ -n "$JS_FILE" ]] || { echo "::error::Missing production JS"; exit 1; }
grep -q "$PROD_REF" "$JS_FILE" || { echo "::error::PROD ref missing"; exit 1; }
if grep -q "$DEV_REF" "$JS_FILE"; then echo "::error::DEV ref present in PROD build"; exit 1; fi
for required in "wineshoppos-ai-1a61d5885c.azurewebsites.net" "wsp-v3-invoice-53b6e9a1.azurewebsites.net" "wsp-login-orbiter"; do
  grep -q "$required" "$JS_FILE" || { echo "::error::Build missing marker: $required"; exit 1; }
done
for asset in dist/index.html dist/login-brands/kingfisher.svg dist/login-brands/sula.svg; do
  [[ -s "$asset" ]] || { echo "::error::Missing release asset: $asset"; exit 1; }
done
export AZURE_STORAGE_KEY
AZURE_STORAGE_KEY=$(az storage account keys list -g "$RG" -n "$ACCOUNT" --query '[0].value' -o tsv)
[[ -n "$AZURE_STORAGE_KEY" ]] || { echo "::error::No PROD blob rollback access"; exit 1; }
echo "::add-mask::$AZURE_STORAGE_KEY"
az storage blob download --account-name "$ACCOUNT" --container-name '$web' --name index.html --file artifacts/prod-login-backup/index.html --auth-mode key --no-progress -o none
unset AZURE_STORAGE_KEY
PUBLIC_SHA=$(sha256sum "$RUNNER_TEMP/wsp-live/index.html" | awk '{print $1}')
BACKUP_SHA=$(sha256sum artifacts/prod-login-backup/index.html | awk '{print $1}')
[[ "$PUBLIC_SHA" == "$BACKUP_SHA" ]] || { echo "::error::PROD public and Blob index hashes disagree"; exit 1; }
echo "$BACKUP_SHA" > artifacts/prod-login-backup/prior-index-sha256.txt
echo "$GITHUB_SHA" > artifacts/prod-login-backup/new-source-sha.txt
echo "Source SHA: $GITHUB_SHA" >> "$GITHUB_STEP_SUMMARY"
echo "Rollback existing PROD index SHA256: $BACKUP_SHA" >> "$GITHUB_STEP_SUMMARY"
echo "Pre-deployment source, build and rollback: PASS" >> "$GITHUB_STEP_SUMMARY"
