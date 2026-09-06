# Chapter V2-09 — AI Production Quality

Status: **Existing Owner Assistant is production-working. Harden it; never rebuild it.**

Scope:

- Application Insights / Foundry tracing
- request_id correlation
- golden evaluation dataset
- groundedness/relevance
- numeric correctness
- tool correctness
- tenant/shop correctness
- quality gates
- monitoring/dashboarding
- Explanation verification
- multi-tool Investigation verification
- Daily Summary verification

Absolute failures include tenant crossover and wrong business numeric results.

AI failure must never break core POS availability.
