import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import { existsSync } from 'node:fs';
import { records, putRecord, live, readHeader, claim } from './state.mjs';
import { focusRoom } from './host.mjs';

export default function (pi: ExtensionAPI) {
  const root = process.env.PI_ROOMS_STATE_DIR;
  const host = process.env.PI_ROOMS_HOST;
  if (!root || !host) return;
  let current: any;
  let release: (() => void) | undefined;

  pi.on('session_start', (_event, ctx) => {
    const id = ctx.sessionManager.getSessionId();
    const old = records(root).find(r => r.id === id);
    if (live(old) && old.pid !== process.pid) {
      ctx.ui.notify('Room already live; refusing duplicate managed session', 'error');
      ctx.shutdown();
      return;
    }
    try { release = claim(root, id); }
    catch { ctx.ui.notify('Session ownership uncertain; inspect proof .owner file before retrying', 'error'); ctx.shutdown(); return; }
    current = { ...old, id, file: ctx.sessionManager.getSessionFile(), cwd: ctx.cwd,
      pid: process.pid, launchPending: false, pane: process.env.HERDR_PANE_ID, label: old?.label ?? id.slice(0, 8) };
    putRecord(root, current);
  });
  pi.on('session_shutdown', () => {
    if (!current) return;
    const record = records(root).find(r => r.id === current.id);
    if (record?.pid === process.pid) putRecord(root, { ...record, pid: null });
    release?.();
    release = undefined;
    current = undefined;
  });
  pi.on('session_before_switch', (event, ctx) => {
    if (!event.targetSessionFile) return;
    const target = readHeader(event.targetSessionFile);
    const record = records(root).find(r => r.id === target.id);
    if (!live(record) || record.pid === process.pid) return;
    try { focusRoom(host, record); }
    catch (error) { ctx.ui.notify(String(error), 'error'); }
    return { cancel: true };
  });
  pi.registerCommand('rooms', {
    description: 'Phase 0: focus a registered room (stopped rooms are not auto-restarted)',
    handler: async (_args, ctx) => {
      const rooms = records(root);
      const options = rooms.map(r => `${r.label} [${r.id}] — ${live(r) ? 'running' : 'stopped'}${existsSync(r.file ?? '') ? '' : ' / not persisted'}`);
      const choice = await ctx.ui.select('Proof rooms', options);
      if (!choice) return;
      const record = rooms[options.indexOf(choice)];
      if (!live(record)) { ctx.ui.notify('Stopped: resume using the proof CLI', 'info'); return; }
      try { focusRoom(host, record); } catch (error) { ctx.ui.notify(String(error), 'error'); }
    },
  });
  // Deterministic lifecycle probes use Pi's normal command-context APIs, without model calls.
  pi.registerCommand('rooms-proof-resume', {
    description: 'Proof only: switch an exact session file through Pi lifecycle hooks',
    handler: async (file, ctx) => { await ctx.switchSession(file); },
  });
  pi.registerCommand('rooms-proof-info', {
    description: 'Proof only: report effective cwd and loaded command count',
    handler: async (_args, ctx) => {
      ctx.ui.notify(JSON.stringify({ id: ctx.sessionManager.getSessionId(), cwd: ctx.cwd,
        commands: pi.getCommands().map(c => c.name) }), 'info');
    },
  });
}
