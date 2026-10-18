# Disposable Phase 0 proof

Not V1. No automatic host bootstrap, hard startup budget, durable mail, production crash recovery, or universal session lock. Requires a POSIX shell, Node >=22, Pi, Herdr, and already configured intercom/Bro. Tested versions/results: [findings](../docs/phase0-findings.md).

## Run safely

Use a unique host name starting `pi-rooms-proof` and a private state directory. Never use a shared host. The host name doubles as the intercom routing scope. Do not set `PI_CODING_AGENT_DIR`: that would replace ordinary Pi configuration.

```sh
mkdir -p /tmp/pi-rooms-proof-example
printf '[session]\nresume_agents_on_restore = false\n' > /tmp/pi-rooms-proof-example/herdr.toml
HERDR_CONFIG_PATH=/tmp/pi-rooms-proof-example/herdr.toml herdr --session pi-rooms-proof-example
```

This opens Herdr interactively. From another terminal:

```sh
node proof/cli.mjs --host pi-rooms-proof-example \
  --state /tmp/pi-rooms-proof-example/state --cwd /tmp/pi-rooms-proof-example \
  --label parent --brief 'Reply Parent ready and stop. Do not use tools or contact anyone.'
```

The CLI prints the permanent session ID and verified extension registration. A brief invokes the user's configured model and incurs normal usage. Omit `--brief` for an idle session (not persisted until conversation begins).

Create another room with the same host/state and a different `--label`, optionally `--cwd` and `--parent <id>`. `/rooms` focuses existing terminals; stopped rooms are displayed but not automatically started.

```sh
node proof/cli.mjs --host pi-rooms-proof-example \
  --state /tmp/pi-rooms-proof-example/state --session <id-or-absolute-jsonl-path>
```

Default lookup scans Pi's usual session directory. `--session-root PATH` supplies an alternative lookup root; it does not change Pi's storage configuration. Exact IDs beat prefixes; ambiguous matches fail. Never pass existing IDs through Pi's new-session flag.

`/rooms-proof-info` reports effective context and loaded commands. `/rooms-proof-resume <absolute-file>` uses the same Pi command-context switching API; also test the real `/resume` picker. These commands are proof instrumentation, not proposed product commands.

## Repeat the interactive checks

1. Create parent and child in different dirs, one containing spaces; verify no focus change during creation.
2. Obtain a short child response; run `/bro simplify`, resize and switch tabs, close with Escape.
3. Type an unsent marker; switch away/back and verify it remains.
4. Use `/rooms`; verify actual focused tab in `herdr --session NAME api snapshot`.
5. Exit child; resume its exact ID; compare ID/path/cwd and history.
6. In parent `/resume` the already-live child. Verify focus changes, not the parent's identity.
7. Test clone/new/fork/reload; inspect state records for independent identities.
8. Send explicitly authorized test messages only between exact proof session IDs. Inspect session results and focus; never infer a reply from a delivery receipt.
9. Exit test agents normally, then `herdr session stop pi-rooms-proof-example --json`. Keep or remove disposable transcripts explicitly; do not delete unrelated Pi history.

## Tests

```sh
npm test
# Optional installed-Pi projection test (otherwise explicitly skipped):
PI_MODULE_URL=file:///absolute/path/to/pi/dist/core/session-manager.js npm test
```

No dependency installation needed. Default tests cover lookup, malformed ancillary files, metadata, liveness and exclusive claims. Optional test uses the installed Pi projection implementation and checks branching, compaction and read-only behavior.

## Deliberate limits

- Launch lock serializes this proof's launchers; a concurrent caller fails rather than waiting.
- Owner files fail closed after a crash. Inspect process and host state before removing a stale owner or pending-launch marker. Never clear them automatically.
- Extension owner acquisition is late relative to Pi opening its transcript; this is not a global file lock. Different state dirs and standalone Pi can bypass it.
- PID reuse is not handled. Network filesystems and multi-user security are not supported.
- Fresh non-persisted room recovery is manual. Missing-session navigation is not implemented.
- Helper modules can remain cached through `/reload` during development; restart proof Pi processes after helper changes.
- `savedContext` reads complete newline-terminated entries and uses persisted last-leaf semantics. It does not claim to know a live in-memory tree cursor. Explicit `PI_MODULE_URL` is a proof hook, not a production dependency strategy.
- Global extensions may invoke background network activity; the proof does not disable them because native compatibility is the point. Never commit raw session transcripts or environment dumps.
