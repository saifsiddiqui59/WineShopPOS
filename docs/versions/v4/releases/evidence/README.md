# V4 Release Evidence

This directory contains repository-safe V4 release/reconciliation evidence.

Policy:

- safe textual evidence may be tracked here;
- raw evidence containing credentials, tokens, passwords, private keys or
  equivalent secrets must remain outside Git under
  `/e/WineShopPOS_RELEASE_EVIDENCE/`;
- when raw evidence is excluded, commit only a sanitized pointer/hash record;
- release evidence does not override current source, migrations or verified
  live state.
