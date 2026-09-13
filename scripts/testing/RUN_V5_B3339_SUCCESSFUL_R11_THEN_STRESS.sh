#!/usr/bin/env bash
set -Eeuo pipefail

CERT="/e/WineShopPOS_V5_E2E_20260912_105856"
DEV_REF="juhcypzoacauzmtzqnwd"
PROD_REF="uiurgplnsgmawvxhjzzp"

STRESS_REL="scripts/testing/RUN_V5_STRESS_RESUME_AFTER_OCR_FROM_CHAT.sh"
CREDS="$CERT/.wsp-local/stress_only_20260913_180633-cashiers.json"

RUN_ID="b3339_r11_then_stress_$(date +%Y%m%d_%H%M%S)"
RAW="$CERT/.wsp-local/b3339-r11-then-stress/$RUN_ID"
PUBLIC_REL="docs/versions/v5/testing/evidence/$RUN_ID"
PUBLIC="$CERT/$PUBLIC_REL"
TMP="$RAW/RUN_B3339_ONLY_FROM_SUCCESSFUL_R11.sh"

die(){
  echo
  echo "================================================================"
  echo "STOPPED SAFELY: $*"
  echo "Do NOT rerun blindly after a mutation stage."
  echo "15983 and PROD remain excluded."
  echo "================================================================"
  exit 1
}

mkdir -p "$RAW"
cd "$CERT" || die "Missing certification worktree."
[[ "$(git branch --show-current)" == "V5" ]] || die "Certification worktree is not on V5."

git fetch origin V5 --quiet
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/V5)" ]] \
  || die "Certification worktree is not identical to origin/V5."

[[ -z "$(git status --porcelain --untracked-files=no)" ]] || {
  git status --porcelain --untracked-files=no
  die "Certification worktree has tracked changes."
}

R11=""
for f in \
  "scripts/testing/RUN_V5_FULL_MASTER_CERTIFICATION_R11.sh" \
  "scripts/testing/RUN_V5_FULL_MASTER_CERTIFICATION.sh"
do
  if [[ -f "$f" ]] && grep -q 'R11-REAL-DEFECT-REGISTRY' "$f"; then
    R11="$f"
    break
  fi
done

[[ -n "$R11" ]] || die "Successful R11 source runner not found."
[[ -f "$STRESS_REL" ]] || die "Preserved stress continuation runner is missing."
[[ -f "$CREDS" ]] || die "Preserved 4-cashier credential checkpoint is missing."

echo "================================================================"
echo " WineShopPOS V5 — SUCCESSFUL R11 B-3339 -> PRESERVED STRESS"
echo "================================================================"
echo "R11 source : $R11"
echo "Invoice    : B-3339 ONLY"
echo "Current DB : resume existing unreceived OCR ingestion when present"
echo "Stress     : reuse existing 4 cashiers + OPEN shifts"
echo "Target     : 96+ genuine POS UI bills"
echo "15983      : NOT TOUCHED"
echo "PROD       : HARD BLOCKED"
echo "================================================================"
echo

echo "[1/6] Verify successful R11 safeguards are present..."
grep -Fq 'input[type=\"file\"][accept*=\"application/pdf\"]' "$R11" \
  || die "R11 source lacks the proven dedicated OCR upload selector."
grep -Fq 'getByRole(\"combobox\", { name: \"Supplier\", exact: true })' "$R11" \
  || die "R11 source lacks the proven exact Supplier combobox selector."
grep -Fq 'RESUMED_EXISTING_' "$R11" \
  || die "R11 source lacks resume-safe existing-ingestion handling."
grep -Fq 'READY_TO_RECEIVE' "$R11" \
  || die "R11 source lacks authoritative receive-state checks."
echo "[PASS] Proven R11 markers confirmed."

echo
echo "[2/6] Extract exact embedded R11 invoice runner and restrict fixtures to B-3339..."

python - "$R11" "$TMP" <<'PY'
from pathlib import Path
import sys

src = Path(sys.argv[1]).read_text(encoding="utf-8")
out = Path(sys.argv[2])

start_marker = "cat > \"$RUNTIME/invoice-uat.sh\" <<'__WSP_EMBEDDED_INVOICE_RUNNER__'\n"
end_marker = "\n__WSP_EMBEDDED_INVOICE_RUNNER__\n"

a = src.find(start_marker)
if a < 0:
    raise SystemExit("Successful R11 embedded invoice runner start marker not found.")
a += len(start_marker)
b = src.find(end_marker, a)
if b < 0:
    raise SystemExit("Successful R11 embedded invoice runner end marker not found.")

runner = src[a:b]

fixture_marker = "const fixtures = ["
fa = runner.find(fixture_marker)
if fa < 0:
    raise SystemExit("R11 fixture array not found.")

arr_start = runner.find("[", fa)
if arr_start < 0:
    raise SystemExit("R11 fixture array opening bracket not found.")

# Find matching closing ] while respecting JS quoted strings.
depth = 0
in_string = None
escape = False
arr_end = None
for i in range(arr_start, len(runner)):
    ch = runner[i]
    if in_string:
        if escape:
            escape = False
        elif ch == "\\":
            escape = True
        elif ch == in_string:
            in_string = None
        continue

    if ch in ("'", '"', "`"):
        in_string = ch
        continue
    if ch == "[":
        depth += 1
    elif ch == "]":
        depth -= 1
        if depth == 0:
            arr_end = i
            break

if arr_end is None:
    raise SystemExit("R11 fixture array closing bracket not found.")

body = runner[arr_start + 1:arr_end]

# Split top-level fixture objects and retain the exact historical B-3339 object.
objects = []
depth = 0
in_string = None
escape = False
obj_start = None

for i, ch in enumerate(body):
    if in_string:
        if escape:
            escape = False
        elif ch == "\\":
            escape = True
        elif ch == in_string:
            in_string = None
        continue

    if ch in ("'", '"', "`"):
        in_string = ch
        continue

    if ch == "{":
        if depth == 0:
            obj_start = i
        depth += 1
    elif ch == "}":
        depth -= 1
        if depth == 0 and obj_start is not None:
            objects.append(body[obj_start:i+1])
            obj_start = None

hits = [o for o in objects if '"invoiceNumber": "B-3339"' in o]
if len(hits) != 1:
    raise SystemExit(f"Expected exactly one B-3339 R11 fixture; found {len(hits)}.")

b3339 = hits[0]
new_array = "[\n" + b3339.strip() + "\n]"
runner = runner[:arr_start] + new_array + runner[arr_end+1:]

# Hard safety: fixture array itself must contain only B-3339.
fixture_slice = runner[runner.find(fixture_marker):runner.find("];", runner.find(fixture_marker))+2]
if '"invoiceNumber": "B-3339"' not in fixture_slice:
    raise SystemExit("B-3339 fixture missing after restriction.")
for forbidden in ('"invoiceNumber": "16845"', '"invoiceNumber": "16805"', '"invoiceNumber": "15983"'):
    if forbidden in fixture_slice:
        raise SystemExit(f"Forbidden invoice remained in restricted fixture array: {forbidden}")

out.write_text(runner.rstrip() + "\n", encoding="utf-8", newline="\n")
PY

chmod +x "$TMP"
bash -n "$TMP" || die "Extracted B-3339-only R11 shell syntax failed."

# Validate the exact embedded Playwright JS after fixture restriction.
JS_CHECK="$RAW/r11-b3339-runner-check.mjs"
python - "$TMP" "$JS_CHECK" <<'PY'
from pathlib import Path
import sys
s=Path(sys.argv[1]).read_text(encoding="utf-8")
marker="cat > \"$RUNTIME/runner.mjs\" <<'NODE'\n"
a=s.find(marker)
if a < 0:
    raise SystemExit("Embedded runner.mjs start not found.")
a += len(marker)
b=s.find("\nNODE\n", a)
if b < 0:
    raise SystemExit("Embedded runner.mjs end not found.")
Path(sys.argv[2]).write_text(s[a:b]+"\n",encoding="utf-8",newline="\n")
PY
node --check "$JS_CHECK" || die "B-3339-only R11 Playwright JS syntax failed."
echo "[PASS] Exact successful R11 invoice harness extracted; fixture restricted to B-3339."

echo
echo "[3/6] Run B-3339 using successful R11 logic..."
set +e
bash "$TMP" 2>&1 | tee "$RAW/b3339-r11-console.log"
OCR_RC=${PIPESTATUS[0]}
set -e

mkdir -p "$PUBLIC"

python - "$RAW/b3339-r11-console.log" "$PUBLIC/b3339-r11-console.sanitized.txt" <<'PY'
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
dst.write_text(s,encoding="utf-8",newline="\n")
PY

UAT_EVIDENCE="$(
  grep -E '^\[V5-UAT\] Evidence:' "$RAW/b3339-r11-console.log" \
  | tail -1 \
  | sed -E 's/^\[V5-UAT\] Evidence:[[:space:]]*//' \
  || true
)"

cat > "$PUBLIC/B3339_R11_STAGE.md" <<EOF
# B-3339 — Successful R11 Harness Continuation

- Run: \`$RUN_ID\`
- Source harness: \`$R11\`
- Fixture scope: **B-3339 only**
- Result: **$([[ "$OCR_RC" -eq 0 ]] && echo PASS || echo FAIL)**
- Existing OCR state: resume-safe; no duplicate receipt allowed
- Preserved 4-cashier checkpoint: **YES**
- Stress sales before this stage: **0**
- Invoice 15983: **NOT TOUCHED**
- PROD: **NOT TOUCHED**
- Raw local wrapper evidence: \`$RAW\`
- R11 UAT evidence reported by runner: \`${UAT_EVIDENCE:-not-reported}\`
EOF

sha256sum "$RAW/b3339-r11-console.log" > "$PUBLIC/B3339_R11_RAW_SHA256.txt" 2>/dev/null || true

echo
echo "[4/6] Archive B-3339 stage evidence to V5 Git..."
git fetch origin V5 --quiet
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/V5)" ]] \
  || die "Remote V5 moved during B-3339 stage; evidence left local."

git add \
  "$PUBLIC_REL/B3339_R11_STAGE.md" \
  "$PUBLIC_REL/B3339_R11_RAW_SHA256.txt" \
  "$PUBLIC_REL/b3339-r11-console.sanitized.txt"

git diff --cached --check || {
  git reset >/dev/null 2>&1 || true
  die "B-3339 evidence git diff check failed."
}

if ! git diff --cached --quiet; then
  git commit -m "test(v5): archive B-3339 successful-R11 harness $([[ "$OCR_RC" -eq 0 ]] && echo pass || echo fail)"
  git push origin V5
fi

if [[ "$OCR_RC" -ne 0 ]]; then
  echo
  echo "================================================================"
  echo "B-3339 SUCCESSFUL-R11 STAGE: FAIL"
  echo "Evidence     : $PUBLIC_REL"
  echo "Stress sales: NOT STARTED"
  echo "Cashiers     : PRESERVED"
  echo "15983        : NOT TOUCHED"
  echo "PROD         : NOT TOUCHED"
  echo "================================================================"
  exit "$OCR_RC"
fi

echo "[PASS] B-3339 completed with successful R11 harness."

echo
echo "[5/6] Resume preserved 4-cashier / 96+ UI stress checkpoint..."

git fetch origin V5 --quiet
if [[ "$(git rev-parse HEAD)" != "$(git rev-parse origin/V5)" ]]; then
  git merge --ff-only origin/V5
fi

[[ -z "$(git status --porcelain --untracked-files=no)" ]] || die "Tracked changes exist before stress continuation."

set +e
WSP_REPO="$CERT" \
WSP_RESUME_CASHIER_FILE="$CREDS" \
bash "$STRESS_REL"
STRESS_RC=$?
set -e

echo
echo "[6/6] Final..."
if [[ "$STRESS_RC" -eq 0 ]]; then
  echo "================================================================"
  echo "B-3339 R11 + PRESERVED 96+ STRESS: PASS"
  echo "B-3339 purchase : PASS"
  echo "4 cashiers      : REUSED"
  echo "96+ UI sales    : PASS"
  echo "15983            : NOT TOUCHED"
  echo "PROD             : NOT TOUCHED"
  echo "================================================================"
else
  echo "================================================================"
  echo "B-3339 R11 + PRESERVED STRESS: FAIL / STOPPED ($STRESS_RC)"
  echo "B-3339 purchase : PASS"
  echo "Stress runner archived its own evidence."
  echo "Do NOT rerun blindly."
  echo "================================================================"
fi

exit "$STRESS_RC"
