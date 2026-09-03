#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_DIR="/e/WineShopPOS_patch_logs/ai-10-v3-${timestamp}"
mkdir -p "$RUN_DIR"
PYTHON_BIN="${PYTHON_BIN:-python}"
"$PYTHON_BIN" -m venv "$RUN_DIR/.venv"
if [[ -x "$RUN_DIR/.venv/Scripts/python.exe" ]]; then VENV_PY="$RUN_DIR/.venv/Scripts/python.exe"; else VENV_PY="$RUN_DIR/.venv/bin/python"; fi
"$VENV_PY" -m pip install --disable-pip-version-check --quiet "azure-ai-evaluation==1.18.3"
node scripts/ai-evaluation/validate-golden-dataset.mjs
export AI_EVAL_OUTPUT="$RUN_DIR/evaluation-results.json"
"$VENV_PY" scripts/ai-evaluation/run-live-golden-evaluation.py
node scripts/ai-evaluation/apply-quality-gates.mjs "$AI_EVAL_OUTPUT"
echo "AI_10_V3_1=PASS"
echo "RESULTS=$AI_EVAL_OUTPUT"
