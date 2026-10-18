#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, openSync, closeSync, unlinkSync, statSync, existsSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { homedir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { host, focusRoom } from './host.mjs';
import { resolveSession, sessionFiles, records, putRecord, live } from './state.mjs';

const { values: args } = parseArgs({ options: {
  host: { type: 'string' }, state: { type: 'string' }, cwd: { type: 'string' },
  session: { type: 'string' }, 'session-root': { type: 'string' },
  label: { type: 'string', default: 'room' }, brief: { type: 'string' }, parent: { type: 'string' },
} });
if (!args.host || !args.state) throw new Error('Usage: npm run proof -- --host pi-rooms-proof --state PATH [--cwd PATH | --session ID_OR_FILE] [--brief TEXT]');
const state = resolve(args.state);
mkdirSync(state, { recursive: true, mode: 0o700 });
// A failed/crashed launch leaves this lock for explicit inspection, never an automatic duplicate retry.
const lock = join(state, '.launch.lock');
const fd = openSync(lock, 'wx', 0o600);
try {
  const selected = args.session ? resolveSession(args.session,
    sessionFiles(args['session-root'] ?? join(process.env.PI_CODING_AGENT_DIR ?? join(homedir(), '.pi/agent'), 'sessions'))) : undefined;
  const cwd = selected?.cwd ?? resolve(args.cwd ?? process.cwd());
  if (!statSync(cwd).isDirectory()) throw new Error('Working directory is not a directory');
  const id = selected?.id ?? randomUUID();
  const old = records(state).find(r => r.id === id);
  if (live(old)) {
    focusRoom(args.host, old);
    console.log(JSON.stringify({ id, focused: true }));
  } else {
    if (old?.launchPending || existsSync(join(state, `${encodeURIComponent(id)}.owner`))) throw new Error('Uncertain previous launch/owner: inspect proof state before recovery');
    const result = host(args.host, ['tab', 'create', '--cwd', cwd, '--label', args.label,
      '--env', `PI_ROOMS_STATE_DIR=${state}`, '--env', `PI_ROOMS_HOST=${args.host}`,
      '--env', `PI_INTERCOM_SCOPE_ID=${args.host}`, '--no-focus']);
    const pane = result.root_pane.pane_id;
    putRecord(state, { ...old, id, file: selected?.file, cwd, label: old?.label ?? args.label,
      parent: old?.parent ?? args.parent, pane, pid: null, launchPending: true });
    const extension = join(dirname(fileURLToPath(import.meta.url)), 'extension.ts');
    const piArgs = ['--extension', extension, ...(selected ? ['--session', selected.file] : ['--session-id', id])];
    if (args.brief && !selected) piArgs.push('--', args.brief);
    const started = host(args.host, ['agent', 'start', `room-${id.slice(0, 8)}`, '--kind', 'pi', '--pane', pane, '--', ...piArgs]);
    let registered;
    for (let attempt = 0; attempt < 100; attempt++) {
      registered = records(state).find(r => r.id === id && r.pane === pane && live(r));
      if (registered) break;
      await delay(100);
    }
    if (!registered) throw new Error(`Pi launch accepted but registration unconfirmed in ${pane}; inspect before retrying`);
    console.log(JSON.stringify({ id, pane, registered: true, started }));
  }
} finally {
  closeSync(fd);
  unlinkSync(lock);
}
