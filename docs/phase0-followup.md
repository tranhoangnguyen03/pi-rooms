# Phase 0 follow-up: remaining gates

## Decision

**Go for V1 implementation planning with Rooms-owned recovery. No-go for shipping the proof as V1 or using unchanged Herdr automatic agent restore.** Native busy/modal messaging works with the installed default steering behavior, but it is not human-first. No global configuration or dependency was changed.

## Live experiments (same Linux/version baseline)

### Busy recipient — passed for default steering

Sent BUSY-INBOUND-1 while recipient was active in a controlled run that executed `sleep 20`. Incoming peer content appeared after the tool completed, then the model acknowledged it. `BUSY-UNSENT-MARKER` stayed in the editor throughout. The recipient was unfocused. Model provider returned 429/503 retries before the successful run; these affected timing, not routing. This does not prove precedence over an already submitted human message.

### Bro modal — passed, with an important semantic distinction

Opened `/bro simplify`, verified visible overlay, sent MODAL-PROBE-2 while it was open. Bro finished its explanation; the incoming message triggered an ordinary Pi response behind the overlay. The modal retained its controls and Escape closed it. **The overlay does not pause the agent.** Product documentation must not imply that an open modal blocks peer work.

### Stopped recipient — delivery observed; response blocked by provider

Exited child normally, sent OFFLINE-PROBE to its exact ID while stopped, then resumed the exact saved file. The queued message appeared and triggered a turn in the resumed session. Provider rate limits prevented confirming a completed OFFLINE-ACK before the controlled host-restart test. Thus mailbox receipt/reinjection passed, completed offline-response exchange did not. No broker restart occurred; this is still volatile mailbox delivery, not durable mail.

### Herdr-owned restoration — correct transcript, missing Rooms integration

Enabled `resume_agents_on_restore = true` **only in the private proof config**, reloaded that host, stopped/restarted its named server. Two Pi conversations returned with the correct saved JSONL paths. However the explicit `--extension proof/extension.ts` was not restored: room records remained `pid: null`, and `/rooms` became a normal model prompt instead of a registered command. Interrupted incoming work was not automatically resumed merely by opening its saved conversation.

This is a concrete integration failure, not a reason to replace Herdr. Recommendation: dedicated managed host with automatic agent restore disabled; Rooms reconstructs launches with explicit extension and environment. An alternative future fix is a supported Herdr restore launch contract that preserves these inputs. Do not enable two recovery owners.

The proof CLI now checks fresh Herdr session bindings before trusting stale local records. A host-restored Pi is focused rather than duplicated, even if Rooms is absent. Three regression tests cover restored binding, historical shell metadata and duplicate bindings. The corrected host-match helper was exercised in the later live launch/recovery sequence; host-restored/no-extension detection specifically is unit-tested against the observed snapshot shape.

### Crash recovery — conservative refusal passed; inspected recovery passed

Killed only the disposable child's registered PID with SIGKILL. Retry refused the stale `.owner` file rather than launching another writer. Verified that PID no longer existed and the named host had no agent for that transcript; removed only that disposable owner marker. Exact-file resume then registered successfully with the same ID/path and no startup brief supplied or replayed. This proves the manual reconciliation sequence, **not automatic safe lease recovery**. V1 must add process-start identity, reconciliation and crash-stage coverage.

### Human-first configuration — source-confirmed gap

Installed intercom 0.17.1 reads `busyDelivery` and `inboundTrigger` from its agent-wide config. There is no per-session environment override in the inspected implementation. Changing `PI_CODING_AGENT_DIR` would change normal Pi configuration and is not an acceptable workaround.

Smallest proposed upstream change: validated process-local environment overrides for those two settings, falling back to existing config, with tests for invalid values and config precedence. Suggested names (not currently supported): `PI_INTERCOM_BUSY_DELIVERY`, `PI_INTERCOM_INBOUND_TRIGGER`. No upstream patch/issue was published in this work. Until that exists, V1 must either explicitly disclose default steering or wait for the override; do not silently change the user's global config.

## Remaining work is implementation, not an unresolved hosting bet

- Atomic pre-launch ownership across native switches and launches; robust stale-owner reconciliation.
- Rooms-owned startup after host restart, preserving explicit extension and scoped environment.
- Bounded preliminary gathering and interrupted-start UX (not just a cooperative prompt).
- Per-managed-process human-first setting, or explicit acceptance of steering.
- Negative cross-scope tests, submitted-human-input precedence, platform matrix and broader fault injection.

The earlier estimate of 17–27 engineering days plus integration contingency remains reasonable; automatic recovery is not already solved by these proof files.

## Verification / cleanup

10 local tests passed with installed Pi projection enabled. CI runs 9 dependency-free tests and explicitly skips the installed-Pi test. Proof Pi sessions exited; the named host stopped; private tmux removed. Private config returned to `resume_agents_on_restore = false`. Shared broker, other Pi sessions and global settings untouched. Raw transcripts retained locally, not published.
