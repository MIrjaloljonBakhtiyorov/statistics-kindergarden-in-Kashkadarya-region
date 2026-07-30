# Daily commit template

Commit message:

```text
day-XX: short action and module
```

Commit body:

```text
Date: YYYY-MM-DD
Scope:
- module or page changed

Changed:
- short summary of actual implementation

Verified:
- command 1
- command 2

Risk:
- known limitation or none
```

Example:

```text
day-02: stabilize parent messages layout

Date: 2026-08-01
Scope:
- parent portal messages section

Changed:
- fixed chat window flex state after contact selection
- kept message input visible on mobile, tablet, and desktop

Verified:
- pnpm run lint
- pnpm run build

Risk:
- none
```
