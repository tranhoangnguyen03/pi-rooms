# Phase 0 findings and recommended design

**Follow-up:** [remaining-gate results](phase0-followup.md) supersede the unverified busy/modal/recovery rows below. Herdr-native restore lost the explicit Rooms extension; recommend Rooms-owned recovery. The original matrix is retained as the first experiment record.

## Verdict: conditional go

The central technical direction works: full interactive Pi processes in full-size Herdr tabs, native extension UI, session-identity navigation and exact resume. Proceed to V1 planning, **not a production release of this proof**. Human-first messaging configuration, crash-safe ownership and restore coordination need explicit follow-up.

Test environment: Linux x86_64; Node 26.12.0; Pi 1.3.0; Herdr 0.9.5 / protocol 22; pi-intercom 0.17.1; pi-bro 0.23.1. Date: 2026-10-18. Herdr ran under a disposable tmux PTY, not as a replacement host: tmux supplied the terminal needed in this headless environment. All rooms were ordinary interactive Pi with normal global configuration. No trust bypass, existing-session contact or global config mutation.

## Evidence matrix

These are observed results, not inferred from documentation. Raw transcripts remain local because global instructions and provider metadata are private.

| Question | Result | Evidence / limitation |
|---|---|---|
| External bootstrap | PASS, experimental harness | `herdr --session pi-rooms-proof` started in a 140×45 PTY; explicitly addressed snapshot returned protocol 22. Production CLI auto-bootstrap not implemented. |
| No-focus full tabs | PASS | `tab create --no-focus` and `agent start --kind pi` created independent child and parent; focused tab remained original shell. |
| Paths with spaces | PASS | Child cwd ended in `child with spaces`; Herdr argv and Pi cwd matched. |
| Ordinary configuration | PASS for this installation | Existing footer, skills, MCP configuration, intercom and `/bro` loaded. `/rooms-proof-info` listed existing commands. No global settings changed. Other project-trust combinations untested. |
| `/bro simplify` | PASS | Real child answer simplified by configured Bro backend. Modal displayed explanation, survived tab-away/back and resize from 140×45 to 110×35; Escape returned to editor. |
| Editor preservation | PASS | `UNSENT-ROOMS-MARKER` survived tab-away/back, unchanged. |
| `/rooms` | PASS | Native selector chose parent; host focused parent's existing tab. Initial snapshot-schema bug fixed; process restart validated fix (reload retained imported module cache during iteration). |
| Exact resume | PASS | Child exited; CLI unique-ID lookup launched same absolute JSONL path in saved cwd, with original ID/history. Final repeat launch focused existing terminal. |
| Ambiguity/corrupt ancillary files | PASS automated | Exact IDs preferred; duplicate exact IDs and ambiguous prefixes rejected. Workflow JSONL under Pi session tree skipped. Explicit invalid session files rejected. |
| Native `/resume` duplicate | PASS | Picker selected child already live elsewhere; before-switch hook cancelled replacement and focused existing child tab. Original session record remained. |
| Cross-directory native switch | PASS for Pi tools | Parent terminal switched into stopped child session; `ctx.cwd` and actual `!pwd` returned child's directory. Herdr shell/foreground cwd remained original: use Pi identity, not host cwd. |
| `/reload`, `/clone`, `/new`, `/fork` | PASS observed | Reload retained identity; clone/new/fork registered fresh IDs and left old records stopped. Fresh `/new` showed `not persisted`. Parent-edge fixtures tested separately; full nested UI not built. |
| Concurrent open | PASS bounded case | Two launchers for an already-live child: one focused existing tab; other failed exclusive launch lock. No extra Pi launched. Cold-launch race tested only through owner-lock unit check, not live stress. |
| Readiness | PASS after correction | Herdr readiness precedes extension registration; CLI now waits for matching live room registration. Final launch returned `registered: true`. |
| Idle intercom delivery | PASS with reply caveat | Child sent exact-ID message to unfocused parent in proof scope. Parent processed it; unsent `UNSENT-MESSAGE-MARKER` remained; focus unchanged. |
| Reply correlation | LIMIT FOUND | `reply` after one-way `send` failed: no active/pending ask context. Agent recovered using addressed `send`; subsequent explicit addressed response reached child. Do not present one-way send as a correlated ask. Provider rate-limit retry also occurred. |
| Busy/modal intercom, stopped mailbox | NOT VERIFIED | No controlled busy-boundary/modal/offline test completed. Do not extrapolate idle result. Shared broker was never restarted. |
| Scoped isolation | CONFIGURED, partial verification | All launch tabs received unique `PI_INTERCOM_SCOPE_ID`; only exact disposable recipients contacted. Cross-scope negative delivery test not performed. |
| Saved context | PASS fixture | Installed Pi `buildSessionContext` projected selected branch + compaction summary, excluded abandoned branch, left file byte-identical. Live branch cursor/partial append behavior still needs contract. |
| Startup stop | PARTIAL | One brief produced `Parent ready` and settled without tools; child did likewise. No enforced tool/time budget or interrupted-start replay implementation. |
| Crashes / host restart | NOT VERIFIED | Proof config disables Herdr automatic agent restore. Stale owner and pending-launch records fail closed; manual inspection required. No automatic crash recovery claim. |
| Cleanup | PASS | Disposable Pi processes exited; named Herdr proof session stopped; private tmux server removed. Shared intercom broker and other sessions untouched. |

## Advisor decisions

AGY and Claude independently critiqued the plan. Adopted: full tabs, exact file paths, user-owned work, explicit recovery ownership, isolated messaging scope, no shared-broker restart. Claude's fresh UUID recommendation avoids a second permanent room identity; `--session-id` is only for genuinely new sessions.

Rejected/qualified:
- Intercom duplicate-address detection is **not** a transcript write lock.
- Room identity remains Pi session ID, with canonical file path as locator/conflict check—not path alone.
- Pi cross-cwd switches do recreate cwd-bound services; observed `!pwd` disproved the claim that tools necessarily retain the launching cwd. Herdr's shell metadata can remain stale.
- Do not assume agent-start avoids all shell behavior; we verified ordinary args and spaces only.
- Do not flatten all JSONL entries for consolidation; use Pi's projection semantics.
- One model run is not a hard startup budget. Ordinary tools can be restored via Pi APIs, but a startup guard needs a separate design and test.

## Recommended V1 architecture

One npm package: CLI + Pi extension + small shared state/host functions. Pi remains an external prerequisite; do not embed another runtime or ship a replacement UI. Global npm install exposes CLI; CLI explicitly loads its extension. Intercom loading/deduplication and minimum supported versions must be checked before publishing.

### Responsibilities

- **Pi:** conversation persistence, native tools/configuration, project trust, editor, extensions.
- **Herdr:** full-size tabs and native PTYs, focus, process hosting.
- **Rooms:** exact resolution, relationships, approved creation, readiness, ownership and explicit recovery.
- **Intercom:** live delivery/replies. No durable offline inbox promise.

Use a tested Herdr CLI boundary rather than implementing its socket protocol. Fresh `api snapshot` provides `agent_session: {kind, value}`; do not cache workspace-qualified pane IDs as identity. Readiness requires Rooms registration, not just host command acceptance.

### Durable and ephemeral state

Durable: group ID, Pi session ID, canonical path, parent ID, label, cwd, approved brief and startup progress. Fresh UUID allocated before launch; missing transcript explicitly not persisted. Runtime: owner process + process-start identity, host binding, generation/launch status. The proof keeps both in one record for simplicity; V1 should separate update ownership and serialize changes. Pi owns all transcripts.

V1 needs one local ownership authority spanning managed launches and native switches. Atomic acquisition must occur before starting a managed writer; stale detection must include process-start identity, not only PID. A failed/unknown launch must be reconciled against host state before retry. Current proof locks are deliberately conservative, not a complete lease service. Unmanaged Pi remains outside the guarantee unless upstream adds a session-file lock.

### `/resume` policy

Relationships follow sessions, never terminals. Before switch, cancel and focus an existing live target. Otherwise let Pi switch, then rebind using the new context. `/new`, fork and clone become unlinked sessions unless user explicitly attaches them. `/tree` stays within the same identity. Do not automatically migrate family edges or replay child startup.

### Recovery ownership

Herdr already supports agent restore. Do not have it compete with a Rooms restarter. Proof disables automatic host restore only in its private config. Before V1 choose either tested Herdr-owned process restoration with Rooms reconciliation, or Rooms-owned restoration with a dedicated host configured accordingly. No global Herdr configuration mutation.

### Child approval and startup

Parent prepares a short brief and references, not a full transcript clone. Compact native list with expandable details and cwd editing; one approval creates approved children without focus theft. Record each launch separately so retry cannot duplicate successful children. Preserve ordinary trust/auth prompts and label rooms needing attention.

Startup is a bounded read-first introduction, not a delegated assignment. V1 must enforce a small execution budget and restore normal tools after startup. On interruption, report incomplete and ask/await direction rather than replaying silently. No autonomous nesting.

### Communication and consolidation

Permission remains agent conduct, not a transport approval gate. A precise request authorizes its direct response, not a continuing autonomous conversation. Prefer exact IDs and explicit reply correlation; `ask` and `send` have different semantics. Stop/unknown recipients require honest status and explicit recovery.

Installed intercom reads busy policy from agent-wide config: per-room human-first requires an upstream override or an explicit user-wide setting choice. Do not silently change global configuration or create another broker.

For consolidation, read selected saved context and normal artifact files. Prefer Pi projection APIs from a byte snapshot, never a writable manager on a live transcript. Identify snapshot boundary and labels for peer-origin content. A live in-memory tree cursor may not match a file-only reader: obtain it from the room or state clearly that this is persisted context. No mandatory reports or knowledge store.

## Remaining product choices

1. Initial supported platform: recommend local Linux/macOS only after separate macOS testing; current evidence is Linux only.
2. Human-first delivery: recommend upstream per-session override, retain default steer only if explicitly accepted.
3. Recovery owner: test Herdr-native restore first, avoid a second restarter.
4. Standalone duplicate guarantee: explicitly managed-only until Pi supplies file locking.
5. Offline messages: no durable guarantee; recover then communicate.

## Estimate after proof

Core integration risk is reduced. Remaining V1: ownership/recovery 5–8 days; creation/startup/navigation 4–6; messaging/context 3–5; packaging, trust/platform/error tests 5–8. **17–27 engineering days**, with 1–2 weeks contingency for upstream messaging/ownership work and additional platforms. Not a quote or a promise that these proof files can be shipped unchanged.

## Sources

- [Pi](https://github.com/earendil-works/pi): installed 1.3.0 docs and session/runtime implementation.
- [Herdr](https://github.com/herdrdev/herdr): installed 0.9.5 CLI help, protocol schema and live snapshots.
- [pi-intercom](https://github.com/nicobailon/pi-intercom): installed 0.17.1 README, identity, outbox and config implementation.
- [pi-bro](https://github.com/tranhoangnguyen03/pi-bro): installed 0.23.1 modal plus live simplification.
