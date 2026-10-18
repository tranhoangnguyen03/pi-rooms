# Pi Rooms

**You manage the work. Pi manages the agents and sessions.**

Pi Rooms investigates a thin layer for connected, persistent, human-led Pi sessions. Each room remains an ordinary interactive Pi session; Herdr hosts its terminal and pi-intercom provides live communication.

## Status

Phase 0: integration proof. **Not a production-ready launcher.** No autonomous orchestration, replacement chat UI, automatic worktrees, or automatic consolidation.

See [the product handoff](pi-rooms-product-handoff.md), [Phase 0 findings and design](docs/phase0-findings.md), and [proof instructions](proof/README.md).

**Verdict: go for V1 planning, not a production release.** Native Pi, `/bro simplify`, navigation, exact resume, lifecycle rebinding and busy/modal messaging worked in the Linux proof. [Follow-up tests](docs/phase0-followup.md) found that Herdr automatic restore loses the explicitly loaded Rooms extension: use Rooms-owned recovery. Production ownership and per-session human-first messaging still need implementation. See [issue #1](https://github.com/tranhoangnguyen03/pi-rooms/issues/1) for scope.

Run `npm test` for dependency-free checks. No npm package is published; the package is intentionally private.
