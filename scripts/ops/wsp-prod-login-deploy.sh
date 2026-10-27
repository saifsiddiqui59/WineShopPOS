#!/usr/bin/env bash
set -Eeuo pipefail
[[ "$GITHUB_REF" == "refs/heads/main" ]] || { echo "::error::Production requires main"; exit 1; }
ACCOUNT="wineshoppos"
RG="wineshopPOS"
WEB="https://wineshoppos.z29.web.core.windows.net/"
BACKUP="artifacts/prod-login-backup/index.html"
INDEX_WRITTEN=false
export AZURE_STORAGE_KEY
AZURE_STORAGE_KEY=$(az storage account keys list -g "$RG" -n "$ACCOUNT" --query '[0].value' -o tsv)
[[ -n "$AZURE_STORAGE_KEY" ]] || { echo "::error::Rollback access unavailable"; exit 1; }
echo "::add-mask::$AZURE_STORAGE_KEY"

on_error() {
  code=$?
  trap - ERR
  if [[ "$INDEX_WRITTEN" == "true" ]]; then
    echo "::warning::Release failed: restoring previous production index"
    if az storage blob upload --account-name "$ACCOUNT" --container-name '$web' --name index.html --file "$BACKUP" --overwrite true --auth-mode key --content-type text/html -o none; then
      echo "Automatic production index rollback: RESTORED" >> "$GITHUB_STEP_SUMMARY"
    else
      echo "::error::Automatic rollback failed: use the saved GitHub Actions backup"
    fi
  fi
  exit "$code"
}
trap on_error ERR

CURRENT_MAIN=$(curl -fLsS --max-time 20 "https://api.github.com/repos/saifsiddiqui59/WineShopPOS/commits/main" | python3 -c 'import json,sys;print(json.load(sys.stdin)["sha"])')
[[ "$CURRENT_MAIN" == "$GITHUB_SHA" ]] || { echo "::error::Main moved since checkout"; false; }
[[ "$(cat artifacts/prod-login-backup/new-source-sha.txt)" == "$GITHUB_SHA" ]] || { echo "::error::Release/source mismatch"; false; }
OLD_SHA=$(cat artifacts/prod-login-backup/prior-index-sha256.txt)
CURRENT_SHA=$(curl -fLsS -H 'Cache-Control: no-cache' --max-time 45 "$WEB" | sha256sum | awk '{print $1}')
[[ "$OLD_SHA" == "$CURRENT_SHA" ]] || { echo "::error::Production index differs from saved rollback"; false; }

# Upload only content-addressed assets and the new login product art; never overwrite another file.
while IFS= read -r -d '' f; do
  name=$(printf '%s' "$f" | sed 's#^dist/##')
  case "$name" in assets/*|login-brands/*) ;; *) echo "::error::Unexpected deployment path"; false;; esac
  exists=$(az storage blob exists --account-name "$ACCOUNT" --container-name '$web' --name "$name" --auth-mode key --query exists -o tsv)
  if printf '%s' "$exists" | grep -iq '^true$'; then
    rm -f "$RUNNER_TEMP/wsp-existing-asset"
    az storage blob download --account-name "$ACCOUNT" --container-name '$web' --name "$name" --file "$RUNNER_TEMP/wsp-existing-asset" --auth-mode key --no-progress -o none
    old=$(sha256sum "$RUNNER_TEMP/wsp-existing-asset" | awk '{print $1}')
    current=$(sha256sum "$f" | awk '{print $1}')
    [[ "$old" == "$current" ]] || { echo "::error::Existing immutable asset differs at $name"; false; }
    continue
  fi
  type="application/octet-stream"
  case "$name" in
    *.js) type="application/javascript";;
    *.css) type="text/css";;
    *.svg) type="image/svg+xml";;
    *.png) type="image/png";;
    *.webp) type="image/webp";;
    *.woff2) type="font/woff2";;
  esac
  az storage blob upload --account-name "$ACCOUNT" --container-name '$web' --name "$name" --file "$f" --auth-mode key --overwrite false --content-type "$type" -o none
done < <(find dist/assets dist/login-brands -type f -print0)

node --input-type=module <<'NODE' > "$RUNNER_TEMP/wsp-new-asset-paths"
import fs from 'node:fs';
const html=fs.readFileSync('dist/index.html','utf8');
const paths=[...html.matchAll(/(?:src|href)=["'](\/assets\/[^"']+\.(?:js|css))["']/g)].map(x=>x[1]);
if(paths.length<2) throw Error('Expected hashed JS and CSS references');
process.stdout.write(paths.join('\n')+'\n');
NODE
while IFS= read -r path; do
  relpath=$(printf '%s' "$path" | cut -c2-)
  curl -fLsS --retry 3 --retry-delay 2 --max-time 30 "$WEB$relpath" -o "$RUNNER_TEMP/wsp-remote-asset"
  local_sha=$(sha256sum "dist/$relpath" | awk '{print $1}')
  remote_sha=$(sha256sum "$RUNNER_TEMP/wsp-remote-asset" | awk '{print $1}')
  [[ "$local_sha" == "$remote_sha" ]] || { echo "::error::New public JS/CSS hash mismatch"; false; }
done < "$RUNNER_TEMP/wsp-new-asset-paths"

# Atomically switch SPA entry point last; old JS files and all customer files are untouched.
az storage blob upload --account-name "$ACCOUNT" --container-name '$web' --name index.html --file dist/index.html --auth-mode key --overwrite true --content-type text/html -o none
INDEX_WRITTEN=true
BUILT_SHA=$(sha256sum dist/index.html | awk '{print $1}')
FOUND=false
for try in $(seq 1 10); do
  remote=$(curl -fLsS -H 'Cache-Control: no-cache' --max-time 30 "$WEB?wsp-release=$GITHUB_SHA" | sha256sum | awk '{print $1}' || true)
  if [[ "$remote" == "$BUILT_SHA" ]]; then FOUND=true; break; fi
  sleep 2
done
[[ "$FOUND" == "true" ]] || { echo "::error::Public index hash mismatch"; false; }
curl -fLsS --max-time 30 "$WEB"login-brands/kingfisher.svg -o "$RUNNER_TEMP/wsp-kingfisher.svg"
grep -q 'Kingfisher' "$RUNNER_TEMP/wsp-kingfisher.svg" || { echo "::error::Product SVG unavailable"; false; }

node --input-type=module <<'NODE'
import { chromium } from '@playwright/test';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try {
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('https://wineshoppos.z29.web.core.windows.net/#/login',{waitUntil:'domcontentloaded',timeout:30000});
  await page.getByRole('heading',{name:'WineShop POS'}).waitFor({timeout:25000});
  await page.locator('.wsp-login-echo').first().waitFor({state:'attached',timeout:25000});
  const total=await page.locator('.wsp-login-product img').count();
  if(total!==78) throw Error('Expected 78 scattered wine/beer Echo copies; found '+total);
  const loaded=await page.locator('.wsp-login-product img').first().evaluate(async img=>{
    await img.decode();
    return img.complete&&img.naturalWidth>0;
  });
  if(!loaded) throw Error('Brand image failed to load after decoding');
  const points=()=>page.locator('.wsp-login-echo').evaluateAll(els=>els.slice(0,24).map(el=>{
    const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};
  }));
  const before=await points();
  await page.waitForTimeout(700);
  const after=await points();
  const distances=before.map((p,i)=>Math.hypot(p.x-after[i].x,p.y-after[i].y));
  if(distances.filter(d=>d>25).length<12 || Math.max(...distances)<70) {
    throw Error('Echo bottles do not visibly swirl: insufficient measured motion');
  }
  if(errors.length) throw Error('Browser JS errors: '+errors.join('; ').slice(0,500));
  console.log('LIVE_LOGIN_ECHO_SWIRL_PASS - 78 branded copies, clockwise movement validated over 700ms');
} finally {
  await browser.close();
}
NODE
trap - ERR
unset AZURE_STORAGE_KEY
echo "PROD index SHA256: $BUILT_SHA" >> "$GITHUB_STEP_SUMMARY"
echo "Production browser login animation: PASS" >> "$GITHUB_STEP_SUMMARY"
echo "Live login URL: https://wineshoppos.z29.web.core.windows.net/#/login" >> "$GITHUB_STEP_SUMMARY"
echo "PROD_LOGIN_DEPLOYMENT_SUCCEEDED"
