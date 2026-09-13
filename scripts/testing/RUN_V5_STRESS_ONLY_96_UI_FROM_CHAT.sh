#!/usr/bin/env bash
set -Eeuo pipefail

REPO="/e/WineShopPOS_V5"
TEST_REL="tests/e2e/v5-stress-only-96-ui-from-chat.mjs"
TEST="$REPO/$TEST_REL"
PORT="4185"
BASE_URL="http://127.0.0.1:${PORT}"
RUN_ID="stress_only_$(date +%Y%m%d_%H%M%S)"
RAW_DIR="$REPO/.wsp-local/stress-only/$RUN_ID"
AUTH_FILE="$HOME/.wineshoppos-v5-uat/auth.json"
PUBLIC_REL="docs/versions/v5/testing/evidence/$RUN_ID"
PUBLIC_DIR="$REPO/$PUBLIC_REL"
PREVIEW_PID=""

die(){
  echo
  echo "================================================================"
  echo "STOPPED SAFELY: $*"
  echo "Do NOT rerun blindly."
  echo "================================================================"
  exit 1
}

cleanup(){
  set +e
  if [[ -n "$PREVIEW_PID" ]]; then
    kill "$PREVIEW_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

cd "$REPO" || die "Missing $REPO"

echo "================================================================"
echo " WineShopPOS V5 — STRESS ONLY 96+ UI"
echo "================================================================"
echo "Source   : exact prior-chat stress logic"
echo "Flow     : 4 cashiers -> 96+ UI bills -> return -> shifts -> reports/analytics"
echo "R11      : NOT RUN"
echo "15983    : NOT OCR / NOT RECEIVE"
echo "PROD     : HARD BLOCKED"
echo "Evidence : $RAW_DIR"
echo "================================================================"

[[ "$(git branch --show-current)" == "V5" ]] || die "Current branch must be V5."

TRACKED_DIRTY="$(git status --porcelain --untracked-files=no)"
[[ -z "$TRACKED_DIRTY" ]] || {
  echo "$TRACKED_DIRTY"
  die "Tracked V5 worktree has changes before stress run."
}

git fetch origin V5 --quiet
LOCAL_SHA="$(git rev-parse HEAD)"
REMOTE_SHA="$(git rev-parse origin/V5)"

if [[ "$LOCAL_SHA" != "$REMOTE_SHA" ]]; then
  if git merge-base --is-ancestor "$LOCAL_SHA" "$REMOTE_SHA"; then
    git merge --ff-only origin/V5
  else
    die "Local V5 is ahead/diverged from origin/V5. No reset/rebase attempted."
  fi
fi

[[ -f "$TEST" ]] || die "Committed test missing: $TEST_REL"
git diff --quiet origin/V5 -- "$TEST_REL" || die "Committed stress test differs from origin/V5."

# Hard environment guard before Vite starts.
if grep -Rqs "uiurgplnsgmawvxhjzzp" .env .env.local 2>/dev/null; then
  die "PROD Supabase ref found in local V5 env."
fi
if ! grep -Rqs "juhcypzoacauzmtzqnwd" .env .env.local 2>/dev/null; then
  die "DEV Supabase ref was not found in local V5 env."
fi

mkdir -p "$RAW_DIR"

echo
echo "[1/4] Start V5 QA/DEV..."
VITE_ENV_BADGE="QA / DEV · V5 · NOT PROD" ./node_modules/.bin/vite \
  --host 127.0.0.1 --port "$PORT" --strictPort >"$RAW_DIR/vite.log" 2>&1 &
PREVIEW_PID=$!

for _ in $(seq 1 60); do
  curl -fsS "$BASE_URL/" >/dev/null 2>&1 && break
  sleep 1
done
curl -fsS "$BASE_URL/" >/dev/null 2>&1 || die "Vite did not start on $BASE_URL."

echo
echo "[2/4] Run committed 4-cashier / 96+ UI stress..."
set +e
WSP_MAIN_REPO="$(cygpath -w "$REPO")" \
WSP_RUN_ID="$RUN_ID" \
WSP_RAW_DIR="$(cygpath -w "$RAW_DIR")" \
WSP_CASHIER_FILE="$(cygpath -w "$REPO/.wsp-local/${RUN_ID}-cashiers.json")" \
WSP_AUTH_FILE="$(cygpath -w "$AUTH_FILE")" \
WSP_BASE_URL="$BASE_URL" \
node "$TEST" 2>&1 | tee "$RAW_DIR/stress-console.log"
TEST_RC=${PIPESTATUS[0]}
set -e

echo
echo "[3/4] Build sanitized Git evidence..."
mkdir -p "$PUBLIC_DIR"

WSP_RAW_DIR_WIN="$(cygpath -w "$RAW_DIR")" \
WSP_PUBLIC_DIR_WIN="$(cygpath -w "$PUBLIC_DIR")" \
WSP_TEST_RC="$TEST_RC" \
node --input-type=module <<'NODE_EVIDENCE'
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const raw=process.env.WSP_RAW_DIR_WIN;
const pub=process.env.WSP_PUBLIC_DIR_WIN;
const rc=Number(process.env.WSP_TEST_RC||1);

fs.mkdirSync(pub,{recursive:true});

function sanitize(value){
  return String(value??"")
    .replace(/C:\\Users\\[^\\\r\n]+/gi,"C:\\Users\\<redacted>")
    .replace(/\/c\/Users\/[^/\r\n]+/g,"/c/Users/<redacted>")
    .replace(/\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/g,"<redacted-jwt>")
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,"<redacted-email>");
}

function copySanitized(src,dst){
  const p=path.join(raw,src);
  if(fs.existsSync(p)){
    fs.writeFileSync(path.join(pub,dst),sanitize(fs.readFileSync(p,"utf8")));
  }
}

copySanitized("UI_ONLY_SUMMARY.md","STRESS_ONLY_SUMMARY.sanitized.md");
copySanitized("UI_ONLY_RESULT.json","STRESS_ONLY_RESULT.sanitized.json");
copySanitized("stress-console.log","stress-console.sanitized.txt");

let classification="UNKNOWN";
let result={};
const resultPath=path.join(raw,"UI_ONLY_RESULT.json");
if(fs.existsSync(resultPath)){
  try{
    result=JSON.parse(fs.readFileSync(resultPath,"utf8"));
    classification=result.classification||"UNKNOWN";
  }catch{}
}

fs.writeFileSync(path.join(pub,"CLASSIFICATION.txt"),classification+"\n");

const runResult = [
  "# WineShopPOS V5 Stress-Only 96+ UI Run",
  "",
  `- Result: **${rc===0 ? "PASS" : "FAIL"}**`,
  `- Classification: **${classification}**`,
  "- Source: exact prior-chat `RUN_V5_END_TO_END.sh` stress logic",
  "- Flow: **4 cashiers + 96+ genuine POS UI bills + return + shift close + reports/analytics**",
  "- R11 replay: **NO**",
  "- Invoice/OCR/Receive: **NO**",
  "- Direct Supabase SQL/REST/RPC from stress test: **none**",
  "- PROD: **hard blocked**",
  `- UI bills recorded: **${Number(result?.stress?.transactions||0)}**`,
  "",
].join("\n");
fs.writeFileSync(path.join(pub,"RUN_RESULT.md"),runResult);

const lines=[];
function walk(dir,prefix=""){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const full=path.join(dir,ent.name);
    const rel=prefix ? `${prefix}/${ent.name}` : ent.name;
    if(ent.isDirectory()) walk(full,rel);
    else if(ent.isFile()){
      const hash=crypto.createHash("sha256").update(fs.readFileSync(full)).digest("hex");
      lines.push(`${hash}  raw-${rel.replaceAll("\\","/")}`);
    }
  }
}
walk(raw);
fs.writeFileSync(path.join(pub,"RAW_EVIDENCE_SHA256.txt"),lines.sort().join("\n")+"\n");
NODE_EVIDENCE

CLASSIFICATION="$(tr -d '\r\n' < "$PUBLIC_DIR/CLASSIFICATION.txt" 2>/dev/null || echo UNKNOWN)"

git fetch origin V5 --quiet
LOCAL_SHA="$(git rev-parse HEAD)"
REMOTE_SHA="$(git rev-parse origin/V5)"
if [[ "$LOCAL_SHA" != "$REMOTE_SHA" ]]; then
  if git merge-base --is-ancestor "$LOCAL_SHA" "$REMOTE_SHA"; then
    git merge --ff-only origin/V5
  else
    die "V5 changed remotely during stress and cannot be fast-forwarded safely."
  fi
fi

if [[ "$TEST_RC" -ne 0 && "$CLASSIFICATION" == "HARNESS" ]]; then
  MARKER="STRESS_ONLY_${RUN_ID}"
  REGISTER="docs/versions/v5/testing/harness/HARNESS_FAILURES.md"
  if ! grep -Fq "$MARKER" "$REGISTER"; then
    {
      echo
      echo "<!-- $MARKER -->"
      echo "## $(date -Iseconds) — STRESS_ONLY_96_UI"
      echo
      echo "- Runner: \`scripts/testing/RUN_V5_STRESS_ONLY_96_UI_FROM_CHAT.sh\`"
      echo "- Evidence: \`$PUBLIC_REL\`"
      echo "- Classification: **HARNESS**"
      echo "<!-- /$MARKER -->"
    } >> "$REGISTER"
  fi
  git add "$REGISTER"
fi

git add \
  "$PUBLIC_REL/RUN_RESULT.md" \
  "$PUBLIC_REL/RAW_EVIDENCE_SHA256.txt" \
  "$PUBLIC_REL/CLASSIFICATION.txt"

[[ -f "$PUBLIC_REL/STRESS_ONLY_SUMMARY.sanitized.md" ]] && git add "$PUBLIC_REL/STRESS_ONLY_SUMMARY.sanitized.md"
[[ -f "$PUBLIC_REL/STRESS_ONLY_RESULT.sanitized.json" ]] && git add "$PUBLIC_REL/STRESS_ONLY_RESULT.sanitized.json"
[[ -f "$PUBLIC_REL/stress-console.sanitized.txt" ]] && git add "$PUBLIC_REL/stress-console.sanitized.txt"

git diff --cached --check || die "Evidence git diff check failed."

if ! git diff --cached --quiet; then
  git commit -m "test(v5): archive stress-only 96-ui $([[ "$TEST_RC" -eq 0 ]] && echo pass || echo fail)"
  EVIDENCE_COMMIT="$(git rev-parse HEAD)"
  if ! git push origin V5; then
    echo
    echo "Evidence commit exists locally but push failed:"
    echo "$EVIDENCE_COMMIT"
    echo "Do NOT reset it."
    exit 1
  fi
fi

echo
echo "[4/4] Final result..."
git fetch origin V5 --quiet

echo
echo "================================================================"
echo " V5 STRESS ONLY: $([[ "$TEST_RC" -eq 0 ]] && echo PASS || echo FAIL)"
echo " Classification: $CLASSIFICATION"
echo " Git evidence  : $PUBLIC_REL"
echo " Raw evidence  : $RAW_DIR"
echo " Remote V5     : $(git rev-parse origin/V5)"
echo " R11           : NOT RUN"
echo " 15983 OCR     : NOT RUN"
echo " PROD          : NOT TOUCHED"
echo "================================================================"

exit "$TEST_RC"
