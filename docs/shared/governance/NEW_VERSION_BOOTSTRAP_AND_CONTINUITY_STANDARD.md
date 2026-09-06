# New Version Bootstrap and Continuity Standard

Status: **REQUIRED FOR V5 AND LATER**

A new WineShopPOS version starts from current PROD/main structure and governance,
not from an obsolete development generation.

At version creation:

1. fetch current `origin/main`;
2. read the prior version retrospective;
3. record inherited PROD SHA;
4. create/use the new version branch/worktree;
5. bind every non-main branch to DEV only;
6. create `docs/versions/<version>/` immediately;
7. establish zero-tolerance active-version hygiene immediately;
8. run inherited regression/security baseline before feature work.

Before PROD-promotion preparation:

```bash
git ls-files --others --exclude-standard
git status --porcelain --untracked-files=no
```

Both must return no output for the active development version.

Do not achieve this by destructively cleaning legitimate historical PROD/main
dirt. Prefer isolated worktrees for release work.

Continuation executors must be resume-aware. They must detect completed stages
and continue from the first incomplete stage rather than replaying successful
database, service, Git, or frontend operations.

Selective promotion must classify the complete path set:

`tracked modified/deleted paths UNION new non-ignored untracked additions`

Then validate against an explicit allowlist and stage accepted paths
individually. Unknown path = BLOCK.

For migrations, classify actual risk first:

- existing-business-data mutation;
- schema mutation;
- security/grant/function mutation;
- new-object-only work;
- blast radius and reversibility.

Then choose rollback/backup evidence appropriate to the risk. Do not invent
universal tooling gates before risk classification.

Resolve release dependencies early:

- PROD/DEV refs;
- public frontend keys;
- known service endpoints;
- build/runtime tools;
- browser runtime;
- E2E credentials when required;
- Azure/Supabase auth;
- rollback mechanism.

Use differential deployment:

`verified source/config delta exists ? deploy : do not deploy`

Keep release identities separate:

1. qualified candidate/runtime SHA;
2. clean documentation successor when different;
3. production promotion/deployed app SHA;
4. deployed frontend hash;
5. hotfix SHA(s);
6. documentation closure SHA;
7. latest main SHA.

Every completed version must record a whole-version retrospective covering goals,
features, DEV/QA/UAT, security/data changes, release strategy, failures/root
causes, recovery, PROD verification, hotfixes and permanent next-version lessons.

Improvement target:

`same-or-higher safety + higher quality + fewer repeated operations`

Never:

`faster by removing safety gates`
