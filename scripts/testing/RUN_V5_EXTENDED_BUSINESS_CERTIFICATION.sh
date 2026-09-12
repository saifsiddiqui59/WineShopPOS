#!/usr/bin/env bash
set -Eeuo pipefail

REPO="${WSP_REPO:-/e/WineShopPOS_V5}"
DEV_REF="juhcypzoacauzmtzqnwd"
PROD_REF="uiurgplnsgmawvxhjzzp"
PORT="${WSP_EXTENDED_PORT:-4195}"
BASE_URL="http://127.0.0.1:${PORT}"
RUN_ID="$(date +%Y%m%d_%H%M%S)"
OUT="$HOME/WineShopPOS_V5_EXTENDED_CERT/$RUN_ID"
AUTH_FILE="$HOME/.wineshoppos-v5-uat/auth.json"
MASTER="scripts/testing/RUN_V5_FULL_MASTER_CERTIFICATION_R11.sh"
PUBLIC_EVIDENCE_REL="docs/versions/v5/testing/evidence/runs/${RUN_ID}"
PUBLIC_EVIDENCE="$REPO/$PUBLIC_EVIDENCE_REL"
PREVIEW_PID=""

mkdir -p "$OUT"

die(){
  echo
  echo "FAILED: $*"
  echo "Evidence: $OUT"
  exit 1
}

cleanup(){
  set +e
  [[ -n "$PREVIEW_PID" ]] && kill "$PREVIEW_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

echo "================================================================"
echo " WineShopPOS V5 — EXTENDED BUSINESS PLAYWRIGHT CERTIFICATION"
echo "================================================================"
echo "Repo     : $REPO"
echo "Evidence : $OUT"
echo "PROD     : HARD BLOCKED"
echo "================================================================"

cd "$REPO"
git fetch origin V5 --quiet
[[ "$(git branch --show-current)" == "V5" ]] || die "Current branch must be V5."
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/V5)" ]] || die "Local V5 differs from origin/V5. No automatic reset/rebase performed."
TRACKED_DIRTY="$(git status --porcelain --untracked-files=no)"
[[ -z "$TRACKED_DIRTY" ]] || { echo "$TRACKED_DIRTY"; die "Tracked worktree has changes."; }
[[ -f "$MASTER" ]] || die "Missing $MASTER"
[[ -f tests/e2e/v5-extended-business-cert.mjs ]] || die "Missing tests/e2e/v5-extended-business-cert.mjs"

command -v node >/dev/null || die "Node.js missing."
command -v npm >/dev/null || die "npm missing."
if [[ ! -d node_modules ]] || [[ ! -f node_modules/@playwright/test/package.json ]]; then npm ci; fi

cat > "$OUT/read-env.mjs" <<'NODE'
import fs from "node:fs";
const v={};
for(const f of [".env",".env.local"]){
 if(!fs.existsSync(f))continue;
 for(const raw of fs.readFileSync(f,"utf8").split(/\r?\n/)){
  const s=raw.trim(); if(!s||s.startsWith("#"))continue;
  const i=s.indexOf("="); if(i<1)continue;
  v[s.slice(0,i).trim()]=s.slice(i+1).trim().replace(/^['"]|['"]$/g,"");
 }
}
process.stdout.write(String(v[process.argv[2]]||""));
NODE
read_env(){ node "$OUT/read-env.mjs" "$1"; }

SUPABASE_URL="$(read_env VITE_SUPABASE_URL)"
SUPABASE_ANON_KEY="$(read_env VITE_SUPABASE_ANON_KEY)"
[[ "$SUPABASE_URL" == *"$DEV_REF"* ]] || die "V5 is not bound to DEV $DEV_REF."
[[ "$SUPABASE_URL" != *"$PROD_REF"* ]] || die "PROD Supabase detected."
[[ -n "$SUPABASE_ANON_KEY" ]] || die "DEV public key missing."

echo
echo "[1/5] Current full master certification from clean DEV..."
set +e
bash "$MASTER" 2>&1 | tee "$OUT/master-console.log"
MASTER_RC=${PIPESTATUS[0]}
set -e
if [[ "$MASTER_RC" -ne 0 ]]; then
  echo "Master certification failed. Extended phase will NOT mutate more data."
  exit "$MASTER_RC"
fi

echo
echo "[2/5] Start V5 local preview for extended Playwright..."
VITE_ENV_BADGE="QA / DEV · V5 · NOT PROD" ./node_modules/.bin/vite --host 127.0.0.1 --port "$PORT" --strictPort >"$OUT/vite.log" 2>&1 &
PREVIEW_PID=$!
for _ in $(seq 1 60); do
  if curl -fsS "$BASE_URL/" >/dev/null 2>&1; then break; fi
  sleep 1
done
curl -fsS "$BASE_URL/" >/dev/null 2>&1 || die "Vite preview did not start."

echo
echo "[3/5] Extended headed Playwright: 29-line purchase, duplicates, 6 sales, return, owner analytics..."
set +e
BASE_URL="$BASE_URL" \
SUPABASE_URL="$SUPABASE_URL" \
SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
AUTH_FILE="$(command -v cygpath >/dev/null 2>&1 && cygpath -w "$AUTH_FILE" || printf '%s' "$AUTH_FILE")" \
OUT="$(command -v cygpath >/dev/null 2>&1 && cygpath -w "$OUT" || printf '%s' "$OUT")" \
RUN_ID="$RUN_ID" \
node tests/e2e/v5-extended-business-cert.mjs 2>&1 | tee "$OUT/extended-console.log"
EXT_RC=${PIPESTATUS[0]}
set -e

echo
echo "[4/5] Build sanitized public Git evidence..."
mkdir -p "$PUBLIC_EVIDENCE"
cp "$OUT/EXTENDED_CERT_SUMMARY.md" "$PUBLIC_EVIDENCE/EXTENDED_CERT_SUMMARY.md" 2>/dev/null || true
cp "$OUT/EXTENDED_CERT_RESULT.json" "$PUBLIC_EVIDENCE/EXTENDED_CERT_RESULT.json" 2>/dev/null || true

sanitize(){
  sed -E \
    -e 's/(Bearer[[:space:]]+)[A-Za-z0-9._-]+/\1[REDACTED]/g' \
    -e 's/eyJ[A-Za-z0-9._-]{20,}/[REDACTED_JWT]/g' \
    -e 's/([Aa]uthorization[=:][[:space:]]*)[^ ,}]+/\1[REDACTED]/g' \
    -e 's/([Aa]ccess[_ -]?[Tt]oken[=:][[:space:]]*)[^ ,}]+/\1[REDACTED]/g' \
    -e 's/([Rr]efresh[_ -]?[Tt]oken[=:][[:space:]]*)[^ ,}]+/\1[REDACTED]/g' \
    -e 's/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/[REDACTED_EMAIL]/g'
}
sanitize < "$OUT/extended-console.log" > "$PUBLIC_EVIDENCE/extended-console.sanitized.log"
sanitize < "$OUT/master-console.log" > "$PUBLIC_EVIDENCE/master-console.sanitized.log"

TRACE="$OUT/extended-playwright-trace.zip"
if [[ -f "$TRACE" ]]; then
  TRACE_SHA="$(sha256sum "$TRACE" | awk '{print $1}')"
  TRACE_SIZE="$(wc -c < "$TRACE" | tr -d ' ')"
else
  TRACE_SHA=""
  TRACE_SIZE="0"
fi

MASTER_TRACE="$(grep -E '^Trace[[:space:]]*:' "$OUT/master-console.log" | tail -1 | sed -E 's/^Trace[[:space:]]*:[[:space:]]*//' || true)"
MASTER_SUMMARY="$(grep -E '^Summary[[:space:]]*:' "$OUT/master-console.log" | tail -1 | sed -E 's/^Summary[[:space:]]*:[[:space:]]*//' || true)"
MASTER_JSON="$(grep -E '^JSON[[:space:]]*:' "$OUT/master-console.log" | tail -1 | sed -E 's/^JSON[[:space:]]*:[[:space:]]*//' || true)"

cat > "$PUBLIC_EVIDENCE/TRACE_MANIFEST.json" <<JSON
{
  "runId": "$RUN_ID",
  "publicRepoContainsRawTrace": false,
  "extendedTrace": {
    "file": "extended-playwright-trace.zip",
    "sha256": "$TRACE_SHA",
    "bytes": $TRACE_SIZE,
    "localSource": "$TRACE"
  },
  "masterTraceSource": "$MASTER_TRACE",
  "rawEvidencePolicy": "Raw traces/screenshots belong in the private QA evidence Git repository. Public V5 stores only sanitized reports/logs and hashes."
}
JSON

cat > "$PUBLIC_EVIDENCE/CERTIFICATION.md" <<MD
# V5 Extended Business Certification — $RUN_ID

Extended Playwright exit code: **$EXT_RC**

The run executes the existing full master certification first, then extends it with:

- golden invoice persisted-state verification
- exact B-3339 finance assertions
- a large distinct-product Purchase Receiving UI transaction
- duplicate/idempotency receive verification
- six headed POS sales: 2 CASH / 2 UPI / 2 CARD
- exact inventory decrements
- approved return stock restoration
- shift/day close
- Owner Center metric and graph verification against DEV data/RPCs
- Inventory Intelligence verification
- Profit Intelligence verification
- Purchase Intelligence verification
- Reports verification
- final inventory = net stock-movement ledger verification

Raw Playwright traces are intentionally **not** committed to this public repository.
MD

# Copy master summary/result only when paths are accessible.
posix_path(){
  local p="$1"
  if [[ "$p" =~ ^[A-Za-z]:\\ ]] && command -v cygpath >/dev/null 2>&1; then cygpath -u "$p"; else printf '%s' "$p"; fi
}
MS="$(posix_path "$MASTER_SUMMARY")"; MJ="$(posix_path "$MASTER_JSON")"
[[ -n "$MS" && -f "$MS" ]] && cp "$MS" "$PUBLIC_EVIDENCE/FULL_CERT_SUMMARY.md" || true
[[ -n "$MJ" && -f "$MJ" ]] && cp "$MJ" "$PUBLIC_EVIDENCE/FULL_CERT_RESULT.json" || true

echo
echo "[5/5] Attempt private Git archival of raw traces/screenshots..."
PRIVATE_ARCHIVE="BLOCKED"
QA_REPO="${WSP_QA_EVIDENCE_REPO:-saifsiddiqui59/WineShopPOS-QA-Evidence}"
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  if ! gh repo view "$QA_REPO" >/dev/null 2>&1; then
    gh repo create "$QA_REPO" --private --description "Private WineShopPOS QA traces and raw certification evidence" >/dev/null
  fi
  QA_TMP="$(mktemp -d)"
  gh repo clone "$QA_REPO" "$QA_TMP/repo" -- --quiet
  mkdir -p "$QA_TMP/repo/$RUN_ID"
  cp -R "$OUT/." "$QA_TMP/repo/$RUN_ID/"
  MT="$(posix_path "$MASTER_TRACE")"
  [[ -n "$MT" && -f "$MT" ]] && cp "$MT" "$QA_TMP/repo/$RUN_ID/full-cert-trace.zip" || true
  (
    cd "$QA_TMP/repo"
    if command -v git-lfs >/dev/null 2>&1 || git lfs version >/dev/null 2>&1; then
      git lfs install --local >/dev/null 2>&1 || true
      git lfs track "*.zip" >/dev/null 2>&1 || true
      [[ -f .gitattributes ]] && git add .gitattributes
    fi
    git add "$RUN_ID"
    if ! git diff --cached --quiet; then
      git commit -m "qa: archive V5 extended certification $RUN_ID" >/dev/null
      git push origin HEAD >/dev/null
    fi
  )
  PRIVATE_ARCHIVE="PASS"
  rm -rf "$QA_TMP"
else
  echo "Private archive not pushed: GitHub CLI is not installed/authenticated."
  echo "Raw evidence remains at $OUT until it can be pushed to private Git."
fi

python - "$PUBLIC_EVIDENCE/TRACE_MANIFEST.json" "$PRIVATE_ARCHIVE" "$QA_REPO" <<'PY'
from pathlib import Path
import json,sys
p=Path(sys.argv[1]); d=json.loads(p.read_text())
d["privateGitArchive"]={"status":sys.argv[2],"repository":sys.argv[3]}
p.write_text(json.dumps(d,indent=2)+"\n")
PY

echo
echo "================================================================"
echo " EXTENDED CERTIFICATION FINISHED"
echo "================================================================"
echo "Result          : $([[ "$EXT_RC" -eq 0 ]] && echo PASS || echo FAIL)"
echo "Public evidence : $PUBLIC_EVIDENCE_REL"
echo "Private archive : $PRIVATE_ARCHIVE ($QA_REPO)"
echo "Raw evidence    : $OUT"
echo "================================================================"

exit "$EXT_RC"

