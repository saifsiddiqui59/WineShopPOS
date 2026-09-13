#!/usr/bin/env bash
# WSP_ENV_ISOLATION_GUARD_V1
set -Eeuo pipefail

PRIMARY="/e/WineShopPOS_V5"
CERT="/e/WineShopPOS_V5_E2E_20260912_105856"
OCR_REL="scripts/testing/RUN_V5_B3339_OCR_PURCHASE_FROM_PAST.sh"
STRESS_REL="scripts/testing/RUN_V5_STRESS_RESUME_AFTER_OCR_FROM_CHAT.sh"
CREDS="$CERT/.wsp-local/stress_only_20260913_180633-cashiers.json"

RUN_ID="ocr_then_stress_$(date +%Y%m%d_%H%M%S)"
RAW="$CERT/.wsp-local/ocr-stress-merge/$RUN_ID"
PUBLIC_REL="docs/versions/v5/testing/evidence/$RUN_ID"
PUBLIC="$CERT/$PUBLIC_REL"

die(){
  echo
  echo "================================================================"
  echo "STOPPED SAFELY: $*"
  echo "Current cashier checkpoint is preserved."
  echo "Do NOT rerun blindly after any mutation stage."
  echo "================================================================"
  exit 1
}

sync_cert(){
  cd "$CERT" || die "Missing certification worktree: $CERT"
  [[ "$(git branch --show-current)" == "V5" ]] || die "Certification worktree must be on V5."
  local dirty
  dirty="$(git status --porcelain --untracked-files=no)"
  [[ -z "$dirty" ]] || { echo "$dirty"; die "Certification worktree has tracked changes."; }
  git fetch origin V5 --quiet
  local local_sha remote_sha
  local_sha="$(git rev-parse HEAD)"
  remote_sha="$(git rev-parse origin/V5)"
  if [[ "$local_sha" != "$remote_sha" ]]; then
    if git merge-base --is-ancestor "$local_sha" "$remote_sha"; then
      git merge --ff-only origin/V5
    else
      die "Certification worktree is ahead/diverged from origin/V5."
    fi
  fi
}

archive_ocr_stage(){
  local rc="$1"
  mkdir -p "$PUBLIC"
  python - "$RAW/ocr-console.log" "$PUBLIC/ocr-console.sanitized.txt" <<'PY'
from pathlib import Path
import re,sys
src=Path(sys.argv[1]); dst=Path(sys.argv[2])
s=src.read_text(encoding="utf-8",errors="replace") if src.exists() else ""
s=re.sub(r'(?i)C:\\Users\\[^\\\r\n]+',r'C:\\Users\\<redacted>',s)
s=re.sub(r'/c/Users/[^/\r\n]+','/c/Users/<redacted>',s)
s=re.sub(r'\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b','<redacted-jwt>',s)
s=re.sub(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}','<redacted-email>',s)
s=s.replace("\r\n","\n").replace("\r","\n")
s="\n".join(line.rstrip() for line in s.split("\n"))
if s and not s.endswith("\n"):
    s += "\n"
dst.write_text(s,encoding="utf-8")
PY

  cat > "$PUBLIC/OCR_STAGE_RESULT.md" <<EOF
# V5 OCR Purchase Stage — B-3339

- Run: \`$RUN_ID\`
- Result: **$([[ "$rc" -eq 0 ]] && echo PASS || echo FAIL)**
- Invoice: **B-3339**
- Flow: physical invoice image → OCR UI → human-reviewed Purchase Receiving → Approve & Receive Stock
- Stress sales executed in this stage: **NO**
- Existing 4 cashier accounts/open shifts: **PRESERVED**
- PROD: **NOT TOUCHED**
EOF

  sha256sum "$RAW/ocr-console.log" > "$PUBLIC/OCR_RAW_SHA256.txt" 2>/dev/null || true

  git fetch origin V5 --quiet
  local local_sha remote_sha
  local_sha="$(git rev-parse HEAD)"
  remote_sha="$(git rev-parse origin/V5)"
  if [[ "$local_sha" != "$remote_sha" ]]; then
    if git merge-base --is-ancestor "$local_sha" "$remote_sha"; then
      git merge --ff-only origin/V5
    else
      die "Remote V5 changed incompatibly while archiving OCR evidence."
    fi
  fi

  git add \
    "$PUBLIC_REL/OCR_STAGE_RESULT.md" \
    "$PUBLIC_REL/OCR_RAW_SHA256.txt" \
    "$PUBLIC_REL/ocr-console.sanitized.txt"

  git diff --cached --check || die "OCR evidence git diff check failed."
  if ! git diff --cached --quiet; then
    git commit -m "test(v5): archive B-3339 OCR purchase $([[ "$rc" -eq 0 ]] && echo pass || echo fail)"
    git push origin V5
  fi
}

mkdir -p "$RAW"

echo "================================================================"
echo " WineShopPOS V5 — MERGED EXISTING TESTS"
echo "================================================================"
echo "Part A : past B-3339 OCR + Purchase Receiving test"
echo "Part B : past 4-cashier / 96+ UI stress test"
echo "State  : reuse 4 existing cashier accounts + 4 OPEN shifts"
echo "Sales  : current checkpoint has 0 stress bills"
echo "R11    : NOT RUN"
echo "15983  : NOT TOUCHED"
echo "PROD   : HARD BLOCKED"
echo "================================================================"
echo

[[ -d "$PRIMARY" ]] || die "Missing primary V5 repo."
[[ -d "$CERT" ]] || die "Missing certification worktree."
[[ -f "$CREDS" ]] || die "Preserved cashier credential file is missing: $CREDS"

sync_cert

[[ -f "$OCR_REL" ]] || die "Missing committed OCR runner: $OCR_REL"
[[ -f "$STRESS_REL" ]] || die "Missing committed stress runner: $STRESS_REL"

echo "[1/3] Run the existing B-3339 OCR + purchase test..."
set +e
bash "$OCR_REL" 2>&1 | tee "$RAW/ocr-console.log"
OCR_RC=${PIPESTATUS[0]}
set -e

archive_ocr_stage "$OCR_RC"

if [[ "$OCR_RC" -ne 0 ]]; then
  echo
  echo "================================================================"
  echo "MERGED TEST: STOPPED AT OCR/PURCHASE"
  echo "OCR evidence: $PUBLIC_REL"
  echo "Stress sales : NOT STARTED"
  echo "Cashier state: PRESERVED"
  echo "PROD         : NOT TOUCHED"
  echo "================================================================"
  exit "$OCR_RC"
fi

echo
echo "[2/3] OCR purchase PASS. Resume exact preserved 4-cashier stress checkpoint..."
git fetch origin V5 --quiet
if [[ "$(git rev-parse HEAD)" != "$(git rev-parse origin/V5)" ]]; then
  git merge --ff-only origin/V5
fi

set +e
WSP_REPO="$CERT" \
WSP_RESUME_CASHIER_FILE="$CREDS" \
bash "$STRESS_REL"
STRESS_RC=$?
set -e

echo
echo "[3/3] Final..."
if [[ "$STRESS_RC" -eq 0 ]]; then
  echo "================================================================"
  echo "MERGED OCR + STRESS TEST: PASS"
  echo "B-3339 purchase : PASS"
  echo "96+ UI stress   : PASS"
  echo "4 cashiers      : REUSED"
  echo "PROD            : NOT TOUCHED"
  echo "================================================================"
else
  echo "================================================================"
  echo "MERGED OCR + STRESS TEST: FAIL / STOPPED ($STRESS_RC)"
  echo "B-3339 purchase : PASS"
  echo "Stress evidence : archived by stress runner"
  echo "Do NOT rerun blindly."
  echo "================================================================"
fi

exit "$STRESS_RC"
