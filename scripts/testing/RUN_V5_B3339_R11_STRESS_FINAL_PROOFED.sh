#!/usr/bin/env bash
set -Eeuo pipefail

CERT="/e/WineShopPOS_V5_E2E_20260912_105856"
STRESS_REL="scripts/testing/RUN_V5_STRESS_RESUME_AFTER_OCR_FROM_CHAT.sh"
CREDS="$CERT/.wsp-local/stress_only_20260913_180633-cashiers.json"
STATE_FILE="$CERT/.wsp-local/B3339_R11_STRESS_FINAL_STATE.json"

RUN_ID="b3339_r11_stress_final_$(date +%Y%m%d_%H%M%S)"
RAW="$CERT/.wsp-local/b3339-r11-stress-final/$RUN_ID"
PUBLIC_REL="docs/versions/v5/testing/evidence/$RUN_ID"
PUBLIC="$CERT/$PUBLIC_REL"
R11_ONLY="$RAW/RUN_B3339_ONLY_FROM_SUCCESSFUL_R11.sh"
JS_CHECK="$RAW/r11-b3339-playwright-check.mjs"

PREFLIGHT_ONLY="${WSP_PREFLIGHT_ONLY:-0}"

die(){
  echo
  echo "================================================================"
  echo "STOPPED SAFELY: $*"
  echo "No reset/rebase/force action was attempted."
  echo "15983 and PROD remain excluded."
  echo "================================================================"
  exit 1
}

state_write(){
  local stage="$1"
  local tx="${2:-0}"
  local note="${3:-}"
  mkdir -p "$(dirname "$STATE_FILE")"
  WSP_STATE_FILE="$STATE_FILE" \
  WSP_STAGE="$stage" \
  WSP_TX="$tx" \
  WSP_NOTE="$note" \
  WSP_RUN_ID_LOCAL="$RUN_ID" \
  node --input-type=module <<'NODE_STATE'
import fs from "node:fs";
const file=process.env.WSP_STATE_FILE;
const payload={
  stage:process.env.WSP_STAGE,
  transactions:Number(process.env.WSP_TX||0),
  note:process.env.WSP_NOTE||"",
  runId:process.env.WSP_RUN_ID_LOCAL||"",
  updatedAt:new Date().toISOString(),
};
const tmp=`${file}.tmp`;
fs.writeFileSync(tmp,JSON.stringify(payload,null,2)+"\n");
fs.renameSync(tmp,file);
NODE_STATE
}

state_read(){
  [[ -f "$STATE_FILE" ]] || return 0
  node - "$STATE_FILE" <<'NODE_STATE_READ'
const fs=require("fs");
const f=process.argv[2];
try{
  const j=JSON.parse(fs.readFileSync(f,"utf8"));
  console.log(`${j.stage||""}|${Number(j.transactions||0)}|${j.note||""}`);
}catch{
  console.error("INVALID_STATE_FILE");
  process.exit(2);
}
NODE_STATE_READ
}

sync_clean(){
  [[ "$(git branch --show-current)" == "V5" ]] || die "Certification worktree is not on V5."
  [[ -z "$(git status --porcelain --untracked-files=no)" ]] || {
    git status --porcelain --untracked-files=no
    die "Certification worktree has tracked changes."
  }

  git fetch origin V5 --quiet
  local l r
  l="$(git rev-parse HEAD)"
  r="$(git rev-parse origin/V5)"

  if [[ "$l" != "$r" ]]; then
    if git merge-base --is-ancestor "$l" "$r"; then
      git merge --ff-only origin/V5
    else
      die "Certification V5 is ahead/diverged from origin/V5."
    fi
  fi
}

sanitize_console(){
  local src="$1"
  local dst="$2"
  python - "$src" "$dst" <<'PY_SAN'
from pathlib import Path
import re,sys
src=Path(sys.argv[1])
dst=Path(sys.argv[2])
s=src.read_text(encoding="utf-8",errors="replace") if src.exists() else ""
s=re.sub(r'(?i)C:\\Users\\[^\\\r\n]+',r'C:\\Users\\<redacted>',s)
s=re.sub(r'/c/Users/[^/\r\n]+','/c/Users/<redacted>',s)
s=re.sub(r'\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b','<redacted-jwt>',s)
s=re.sub(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}','<redacted-email>',s)
s=s.replace("\r\n","\n").replace("\r","\n")
s="\n".join(line.rstrip() for line in s.split("\n"))
if s and not s.endswith("\n"):
    s += "\n"
dst.parent.mkdir(parents=True,exist_ok=True)
dst.write_text(s,encoding="utf-8",newline="\n")
PY_SAN
}

hash_file(){
  local src="$1"
  local dst="$2"
  node - "$src" "$dst" <<'NODE_HASH'
const fs=require("fs");
const crypto=require("crypto");
const src=process.argv[2], dst=process.argv[3];
const h=crypto.createHash("sha256").update(fs.readFileSync(src)).digest("hex");
fs.writeFileSync(dst,`${h}  ${src.replaceAll("\\","/")}\n`);
NODE_HASH
}

archive_b3339(){
  local rc="$1"
  local console_log="$2"

  mkdir -p "$PUBLIC"
  sanitize_console "$console_log" "$PUBLIC/b3339-r11-console.sanitized.txt"
  hash_file "$console_log" "$PUBLIC/B3339_RAW_SHA256.txt"

  local nested=""
  nested="$(
    grep -E '^\[V5-UAT\] Evidence:' "$console_log" \
      | tail -1 \
      | sed -E 's/^\[V5-UAT\] Evidence:[[:space:]]*//' \
      || true
  )"

  cat > "$PUBLIC/B3339_STAGE.md" <<EOF
# WineShopPOS V5 — B-3339 Successful-R11 Stage

- Run: \`$RUN_ID\`
- Result: **$([[ "$rc" -eq 0 ]] && echo PASS || echo FAIL)**
- Source: successful R11 embedded real-invoice harness
- Fixture scope: **B-3339 only**
- Resume policy: existing unreceived ingestion is reused
- Double-receive policy: previously received invoice is revalidated, not received twice
- Preserved stress checkpoint: existing four cashier accounts + OPEN shifts
- Stress sales before this stage: **0**
- Invoice 15983: **NOT TOUCHED**
- PROD: **NOT TOUCHED**
- Raw local evidence: \`$RAW\`
- Nested UAT evidence: \`${nested:-not-reported}\`
EOF

  sync_clean

  git add \
    "$PUBLIC_REL/B3339_STAGE.md" \
    "$PUBLIC_REL/B3339_RAW_SHA256.txt" \
    "$PUBLIC_REL/b3339-r11-console.sanitized.txt"

  if ! git diff --cached --check; then
    git reset -- "$PUBLIC_REL" >/dev/null 2>&1 || true
    die "B-3339 evidence formatting check failed; raw evidence is preserved locally."
  fi

  local staged expected
  staged="$(git diff --cached --name-only | sort)"
  expected="$(printf '%s\n' \
    "$PUBLIC_REL/B3339_RAW_SHA256.txt" \
    "$PUBLIC_REL/B3339_STAGE.md" \
    "$PUBLIC_REL/b3339-r11-console.sanitized.txt" | sort)"

  [[ "$staged" == "$expected" ]] || {
    git reset -- "$PUBLIC_REL" >/dev/null 2>&1 || true
    die "Unexpected staged files while archiving B-3339 evidence."
  }

  if ! git diff --cached --quiet; then
    git commit -m "test(v5): archive B-3339 successful-R11 $([[ "$rc" -eq 0 ]] && echo pass || echo fail)"
    local evidence_sha
    evidence_sha="$(git rev-parse HEAD)"
    if ! git push origin V5; then
      echo
      echo "B-3339 evidence commit exists locally but push failed:"
      echo "$evidence_sha"
      echo "Do not reset it."
      exit 1
    fi
  fi
}

find_r11(){
  local f
  for f in \
    "scripts/testing/RUN_V5_FULL_MASTER_CERTIFICATION_R11.sh" \
    "scripts/testing/RUN_V5_FULL_MASTER_CERTIFICATION.sh"
  do
    if [[ -f "$f" ]]; then
      if python - "$f" <<'PY_R11_ID' >/dev/null 2>&1
from pathlib import Path
import sys
s=Path(sys.argv[1]).read_text(encoding="utf-8")
raise SystemExit(0 if "R11-REAL-DEFECT-REGISTRY" in s else 1)
PY_R11_ID
      then
        printf '%s' "$f"
        return 0
      fi
    fi
  done
  return 1
}

extract_r11_b3339(){
  local r11="$1"
  python - "$r11" "$R11_ONLY" <<'PY_EXTRACT'
from pathlib import Path
import sys

src=Path(sys.argv[1]).read_text(encoding="utf-8")
out=Path(sys.argv[2])

start_marker="cat > \"$RUNTIME/invoice-uat.sh\" <<'__WSP_EMBEDDED_INVOICE_RUNNER__'\n"
end_marker="\n__WSP_EMBEDDED_INVOICE_RUNNER__\n"

a=src.find(start_marker)
if a<0:
    raise SystemExit("R11 embedded invoice runner start marker not found.")
a+=len(start_marker)
b=src.find(end_marker,a)
if b<0:
    raise SystemExit("R11 embedded invoice runner end marker not found.")

runner=src[a:b]

required={
    "dedicated OCR upload": 'input[type="file"][accept*="application/pdf"]',
    "exact Supplier combobox": 'getByRole("combobox", { name: "Supplier", exact: true })',
    "resume-safe ingestion": "RESUMED_EXISTING_",
    "authoritative READY state": "READY_TO_RECEIVE",
}
missing=[name for name,needle in required.items() if needle not in runner]
if missing:
    raise SystemExit("Successful R11 harness missing safeguard(s): "+", ".join(missing))

fixture_marker="const fixtures = ["
fa=runner.find(fixture_marker)
if fa<0:
    raise SystemExit("R11 fixture array not found.")
arr_start=runner.find("[",fa)
if arr_start<0:
    raise SystemExit("R11 fixture opening bracket not found.")

depth=0
quote=None
escape=False
arr_end=None
for i in range(arr_start,len(runner)):
    ch=runner[i]
    if quote is not None:
        if escape:
            escape=False
        elif ch=="\\":
            escape=True
        elif ch==quote:
            quote=None
        continue
    if ch in ("'",'"',"`"):
        quote=ch
    elif ch=="[":
        depth+=1
    elif ch=="]":
        depth-=1
        if depth==0:
            arr_end=i
            break
if arr_end is None:
    raise SystemExit("R11 fixture closing bracket not found.")

body=runner[arr_start+1:arr_end]
objects=[]
depth=0
quote=None
escape=False
obj_start=None

for i,ch in enumerate(body):
    if quote is not None:
        if escape:
            escape=False
        elif ch=="\\":
            escape=True
        elif ch==quote:
            quote=None
        continue
    if ch in ("'",'"',"`"):
        quote=ch
    elif ch=="{":
        if depth==0:
            obj_start=i
        depth+=1
    elif ch=="}":
        depth-=1
        if depth==0 and obj_start is not None:
            objects.append(body[obj_start:i+1])
            obj_start=None

hits=[obj for obj in objects if '"invoiceNumber": "B-3339"' in obj]
if len(hits)!=1:
    raise SystemExit(f"Expected exactly one B-3339 fixture; found {len(hits)}.")

runner=runner[:arr_start]+"[\n"+hits[0].strip()+"\n]"+runner[arr_end+1:]

fixture_end=runner.find("];",runner.find(fixture_marker))
if fixture_end<0:
    raise SystemExit("Restricted fixture terminator not found.")
fixture_text=runner[runner.find(fixture_marker):fixture_end+2]

if fixture_text.count('"invoiceNumber"')!=1:
    raise SystemExit("Restricted fixture array does not contain exactly one invoice.")
if '"invoiceNumber": "B-3339"' not in fixture_text:
    raise SystemExit("Restricted fixture array does not contain B-3339.")
for forbidden in ("16845","16805","15983"):
    if f'"invoiceNumber": "{forbidden}"' in fixture_text:
        raise SystemExit(f"Forbidden invoice {forbidden} remained in fixture array.")

out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(runner.rstrip()+"\n",encoding="utf-8",newline="\n")
PY_EXTRACT

  chmod +x "$R11_ONLY"
  bash -n "$R11_ONLY" || die "Extracted B-3339-only R11 shell syntax failed."

  python - "$R11_ONLY" "$JS_CHECK" <<'PY_JS'
from pathlib import Path
import sys
s=Path(sys.argv[1]).read_text(encoding="utf-8")
marker="cat > \"$RUNTIME/runner.mjs\" <<'NODE'\n"
a=s.find(marker)
if a<0:
    raise SystemExit("Embedded runner.mjs start not found.")
a+=len(marker)
b=s.find("\nNODE\n",a)
if b<0:
    raise SystemExit("Embedded runner.mjs end not found.")
Path(sys.argv[2]).write_text(s[a:b]+"\n",encoding="utf-8",newline="\n")
PY_JS

  node --check "$JS_CHECK" || die "Extracted B-3339 R11 Playwright syntax failed."
}

best_effort_function_warmup(){
  local api=""
  api="$(node --input-type=module <<'NODE_ENV'
import fs from "node:fs";
let v={};
for(const f of [".env",".env.local"]){
  if(!fs.existsSync(f)) continue;
  for(const raw of fs.readFileSync(f,"utf8").split(/\r?\n/)){
    const s=raw.trim();
    if(!s||s.startsWith("#")) continue;
    const i=s.indexOf("=");
    if(i<1) continue;
    v[s.slice(0,i).trim()]=s.slice(i+1).trim().replace(/^['"]|['"]$/g,"");
  }
}
process.stdout.write(String(v.VITE_INVOICE_API_URL||""));
NODE_ENV
)"
  if [[ -n "$api" ]]; then
    echo "[WARMUP] Best-effort wake-up of DEV invoice API..."
    curl -sS -o /dev/null --max-time 25 "$api" >/dev/null 2>&1 || true
    sleep 2
  fi
}

parse_stress_result(){
  local result_file="$1"
  node - "$result_file" <<'NODE_PARSE'
const fs=require("fs");
const f=process.argv[2];
if(!fs.existsSync(f)){
  console.log("MISSING|0|false|UNKNOWN");
  process.exit(0);
}
try{
  const j=JSON.parse(fs.readFileSync(f,"utf8"));
  const tx=Number(j?.stress?.transactions||0);
  const risk=Boolean(j?.stress?.partialMutationRisk);
  console.log(`${j.result||"UNKNOWN"}|${tx}|${risk}|${j.classification||"UNKNOWN"}`);
}catch{
  console.log("INVALID|0|true|UNKNOWN");
}
NODE_PARSE
}

mkdir -p "$RAW"
cd "$CERT" || die "Missing certification worktree."
sync_clean

echo "================================================================"
echo " WineShopPOS V5 — FINAL FAILURE-PROOFED B-3339 -> STRESS"
echo "================================================================"
echo "Invoice source : successful R11 embedded harness"
echo "Invoice scope  : B-3339 ONLY"
echo "Stress         : preserved 4 cashiers / OPEN shifts / 96+ UI bills"
echo "Safety         : persistent mutation lock + partial-batch progress"
echo "R11 full       : NOT RUN"
echo "15983          : NOT TOUCHED"
echo "PROD           : HARD BLOCKED"
echo "================================================================"
echo

R11="$(find_r11 || true)"
[[ -n "$R11" ]] || die "Successful R11 source runner not found."

echo "[1/7] Extract + validate exact successful R11 B-3339 harness..."
extract_r11_b3339 "$R11"
echo "[PASS] R11 extraction, Bash syntax and embedded Playwright syntax verified."

if [[ "$PREFLIGHT_ONLY" == "1" ]]; then
  echo
  echo "================================================================"
  echo "PREFLIGHT ONLY: PASS"
  echo "No OCR, purchase, sales, return or shift mutation was executed."
  echo "================================================================"
  exit 0
fi

if [[ -f "$STATE_FILE" ]]; then
  STATE="$(state_read)" || die "Persistent state file is invalid; refusing mutation."
  STAGE="${STATE%%|*}"
  REST="${STATE#*|}"
  TX="${REST%%|*}"

  case "$STAGE" in
    STRESS_PASS|STRESS_PASS_EVIDENCE_WARNING)
      echo "Existing state: $STAGE ($TX transactions)."
      echo "The final stress workflow already completed. Nothing will be rerun."
      exit 0
      ;;
    STRESS_RUNNING|STRESS_PARTIAL_FAIL|STRESS_UNKNOWN_FAIL)
      die "Persistent state is $STAGE. A previous stress run may have mutated sales; automatic rerun is blocked."
      ;;
    *)
      echo "[STATE] Safe resumable prior stage: $STAGE"
      ;;
  esac
fi

[[ -f "$CREDS" ]] || die "Preserved cashier credential checkpoint is missing."
[[ -f "$STRESS_REL" ]] || die "Committed stress continuation runner is missing."

echo
echo "[2/7] Best-effort DEV Function warm-up + B-3339 idempotent resume..."
best_effort_function_warmup
state_write "B3339_RUNNING" 0 "R11 B-3339 stage started"

set +e
bash "$R11_ONLY" 2>&1 | tee "$RAW/b3339-r11-console.log"
B3339_RC=${PIPESTATUS[0]}
set -e

if [[ "$B3339_RC" -eq 0 ]]; then
  state_write "B3339_PASS" 0 "B-3339 received or revalidated successfully"
else
  state_write "B3339_FAIL" 0 "B-3339 stage failed; safe to rerun because R11 is idempotent"
fi

echo
echo "[3/7] Archive B-3339 evidence before any stress sale..."
archive_b3339 "$B3339_RC" "$RAW/b3339-r11-console.log"

if [[ "$B3339_RC" -ne 0 ]]; then
  echo
  echo "================================================================"
  echo "B-3339 STAGE: FAIL"
  echo "Stress sales : NOT STARTED"
  echo "Cashier state: PRESERVED"
  echo "Same canonical runner may be retried; R11 will resume/revalidate safely."
  echo "================================================================"
  exit "$B3339_RC"
fi

echo "[PASS] B-3339 purchase stage passed."

echo
echo "[4/7] Re-sync after evidence commit..."
sync_clean
echo "[PASS] Clean V5 ready for stress."

STRESS_RUN_ID="stress_after_ocr_final_$(date +%Y%m%d_%H%M%S)"
STRESS_RAW="$CERT/.wsp-local/stress-after-ocr/$STRESS_RUN_ID"
STRESS_RESULT="$STRESS_RAW/UI_ONLY_RESULT.json"

echo
echo "[5/7] Arm persistent stress mutation lock..."
state_write "STRESS_RUNNING" 0 "Stress process started; if interrupted, do not auto-rerun"
echo "[PASS] Lock armed at $STATE_FILE"

echo
echo "[6/7] Run preserved 4-cashier / 96+ UI stress..."
set +e
WSP_REPO="$CERT" \
WSP_RESUME_CASHIER_FILE="$CREDS" \
WSP_RUN_ID="$STRESS_RUN_ID" \
bash "$STRESS_REL"
STRESS_RC=$?
set -e

PARSED="$(parse_stress_result "$STRESS_RESULT")"
RESULT="${PARSED%%|*}"
REST="${PARSED#*|}"
TX="${REST%%|*}"
REST="${REST#*|}"
RISK="${REST%%|*}"
CLASS="${REST#*|}"

if [[ "$RESULT" == "PASS" ]]; then
  if [[ "$STRESS_RC" -eq 0 ]]; then
    state_write "STRESS_PASS" "$TX" "Business stress and evidence runner passed"
  else
    state_write "STRESS_PASS_EVIDENCE_WARNING" "$TX" "Business stress passed; wrapper/evidence returned nonzero"
  fi
elif [[ "$RESULT" == "MISSING" || "$RESULT" == "INVALID" ]]; then
  state_write "STRESS_UNKNOWN_FAIL" "$TX" "Stress result missing/invalid; mutation status unknown"
elif [[ "$RISK" == "true" || "$TX" -gt 0 ]]; then
  state_write "STRESS_PARTIAL_FAIL" "$TX" "At least one stress batch may have mutated sales"
else
  state_write "STRESS_PREMUTATION_FAIL" 0 "Stress failed before any known sale mutation"
fi

echo
echo "[7/7] Final..."
echo "Stress runner RC : $STRESS_RC"
echo "Stress result    : $RESULT"
echo "Transactions     : $TX"
echo "Partial risk     : $RISK"
echo "Classification   : $CLASS"
echo "Raw stress       : $STRESS_RAW"
echo

case "$RESULT" in
  PASS)
    echo "================================================================"
    echo "FINAL B-3339 R11 + 96+ UI STRESS: PASS"
    echo "B-3339 purchase : PASS"
    echo "4 cashiers      : REUSED"
    echo "UI stress bills : $TX"
    echo "15983           : NOT TOUCHED"
    echo "PROD            : NOT TOUCHED"
    if [[ "$STRESS_RC" -ne 0 ]]; then
      echo "Evidence warning : business result PASS but wrapper returned $STRESS_RC"
      echo "Automatic rerun is blocked to protect committed sales."
    fi
    echo "================================================================"
    exit 0
    ;;
  *)
    echo "================================================================"
    echo "FINAL WORKFLOW: FAIL / STOPPED SAFELY"
    echo "Persistent state: $(state_read)"
    if [[ "$RISK" == "true" || "$TX" -gt 0 || "$RESULT" == "MISSING" || "$RESULT" == "INVALID" ]]; then
      echo "DO NOT RERUN: sales may already have been committed."
    else
      echo "No known stress sale mutation occurred; same canonical runner is safe to retry."
    fi
    echo "================================================================"
    exit 1
    ;;
esac
