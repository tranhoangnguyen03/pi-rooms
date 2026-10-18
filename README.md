# Pi Rooms

**You manage the work. Pi manages the agents and sessions.**

Pi Rooms investigates a thin layer for connected, persistent, human-led Pi sessions. Each room remains an ordinary interactive Pi session; Herdr hosts its terminal and pi-intercom provides live communication.

## Status

Phase 0: integration proof. **Not a production-ready launcher.** No autonomous orchestration, replacement chat UI, automatic worktrees, or automatic consolidation.

See [the product handoff](pi-rooms-product-handoff.md), [Phase 0 findings and design](docs/phase0-findings.md), and [proof instructions](proof/README.md).

**Verdict: conditional go.** Native Pi, `/bro simplify`, tab navigation, exact resume and lifecycle rebinding worked in the Linux proof. Production ownership/recovery and human-first messaging still need work. See [issue #1](https://github.com/tranhoangnguyen03/pi-rooms/issues/1) for scope.

Run `npm test` for dependency-free checks. No npm package is published; the package is intentionally private.
