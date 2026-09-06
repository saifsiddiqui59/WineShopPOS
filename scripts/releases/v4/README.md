# V4 Release Executor Archive

These are tracked V4 historical/release executors that previously existed as
local untracked files in the V4 repository root.

They are preserved under the canonical `scripts/` repository surface to remove
root-level drift and to keep release tooling auditable.

Rules:

- treat them as version-specific historical/release tooling;
- invoke from the repository root unless the individual script explicitly says otherwise;
- do not treat an old executor as current release authority;
- current release authority comes from `docs/shared/release/`,
  `docs/versions/v4/releases/`, current source/migrations, and verified live state;
- do not copy PROD credentials/runtime state into these scripts.
