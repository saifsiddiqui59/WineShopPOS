# V4 SaaS Subscription + Disposable Demo

- DEV control layer: server-side subscription/trial enforcement.
- Demo business data: sessionStorage only; no Supabase business writes.
- Demo users are isolated behind #/demo and cannot mount real shop pages.
- Demo trial default: 2 days, starts on first demo login, server-side expiry.
- Logout removes demo workspace; next session restores seed.
- Platform Control: #/platform-admin.
- Plans: BASIC, PLUS, PRO, ENTERPRISE.
- Runtime controls: latest/minimum version, force-update notice, update message, flash announcement.
- Existing accounts without subscription rows remain LEGACY/ACTIVE during transition.
- Current DEV platform owner: mdsaif72496@gmail.com.
- Production is not modified by this V4 executor.
