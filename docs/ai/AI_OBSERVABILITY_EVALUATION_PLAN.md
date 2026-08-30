# AI Observability & Evaluation Plan

## Current status

The AI Function App already has Application Insights. Basic Function health/failure monitoring exists.

Full Foundry trace integration, continuous AI quality evaluation and release gates are **not yet declared complete**.

## Production monitoring — 100% of requests

Track:

- request count
- success/failure
- HTTP status
- latency / P95
- fallback rate
- model/token consumption where available
- selected tool names
- tool execution success/failure
- request/trace correlation ID
- safe pseudonymous tenant/shop identifiers
- Function exceptions

Do not log secrets or raw bearer tokens.

## AI quality evaluators

Recommended:

- Tool Call Accuracy
- Tool Call Success
- Tool Output Utilization
- Task Adherence
- Intent Resolution
- Groundedness
- Relevance
- Task Completion

## Suggested release gates

These are WineShopPOS product targets, not vendor defaults:

- Tool Call Success ≥ 99%
- Tool Call Accuracy ≥ 95%
- Task Adherence ≥ 95%
- Intent Resolution ≥ 90%
- Groundedness ≥ 4.0 / 5
- Relevance ≥ 4.0 / 5
- cross-shop leakage = 0
- unauthorized writes = 0
- tenant-isolation failures = 0

Any cross-tenant or unauthorized-write failure is a release blocker regardless of average quality score.

## Evaluation cadence

- deterministic authorization/tool checks: 100%
- production technical monitoring: 100%
- failed/fallback AI requests: 100% review/evaluation
- quality LLM-judge sampling: initially high; later approximately 10–20% of successful requests
- golden dataset: 100% pre-release

## Golden dataset starter

Include questions such as:

- How is my shop performing today?
- What should I reorder?
- Which products are at risk of stockout?
- Why did profit change?
- Did supplier prices increase?
- Are there shift variances?
- What expenses affected today?

For each case define expected tools, required facts, allowed shop scope and forbidden behavior.
