# AI-10 Repair and AI-11 CI/CD Release Gate

**Date:** 2026-09-01

AI-11 is the final AI engineering/evaluation implementation milestone for this release. After AI-11 succeeds, remaining business validation is manual owner validation.

## AI-10 V2 failure and repair

The prior 24-case run reached all cases but Microsoft evaluator execution was not release-valid because of Windows pip self-upgrade failure, South India `gpt-5-mini` 429 throttling, a transient connection error, and Azure Responsible AI correctly filtering the intentional jailbreak test before a general LLM judge could score it.

AI-10 V3.1:
- keeps the production Owner AI on `gpt-5-mini` but uses a separate non-reasoning Azure judge deployment because local `azure-ai-evaluation==1.18.3` Prompty evaluators send `max_tokens`, which GPT-5 rejects;
- pins `azure-ai-evaluation==1.18.3`;
- uses `python -m pip` and does not self-upgrade pip;
- serializes live cases;
- throttles judge calls and retries 429/5xx/connection failures;
- keeps adversarial security cases as deterministic mandatory blockers rather than sending them to a general LLM judge that is expected to content-filter them;
- builds eligible groundedness context from trusted WineShopPOS Supabase RPCs in memory;
- writes no raw answers, secrets, shop IDs or raw business payloads to repository evidence.

## AI-11

`.github/workflows/ai-11-owner-ai-quality-gate.yml` runs the deterministic contract, lint, build, the 24-case live golden dataset, Microsoft quality evaluators, and the versioned release gate.

After AI-11 green, the release executor fast-forwards the exact V3 release commit to `main`, builds it and deploys the frontend to Azure Storage. No additional AI evaluation phase is required.

## Edit Product release fix

The same release candidate:
- removes the top-right **Back** and **Close** buttons;
- removes **Apply**;
- keeps **Save & Close** and **Cancel**;
- re-reads `get_products` after save and verifies persisted `selling_price` matches the entered Selling Price before navigating away.
