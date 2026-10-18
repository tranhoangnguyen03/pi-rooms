import { execFileSync } from 'node:child_process';

export function host(name, args) {
  if (!name || !name.startsWith('pi-rooms-proof')) throw new Error('Proof requires an explicit pi-rooms-proof* host');
  const output = execFileSync('herdr', ['--session', name, ...args], { encoding: 'utf8', timeout: 45000 });
  const result = JSON.parse(output);
  if (result.error) throw new Error(JSON.stringify(result.error));
  return result.result;
}

export function focusRoom(name, record) {
  const snapshot = host(name, ['api', 'snapshot']).snapshot;
  const pane = snapshot.panes.find(p =>
    (p.agent_session?.kind === 'path' && p.agent_session.value === record.file) ||
    (p.agent_session?.kind === 'id' && p.agent_session.value === record.id));
  // A launch-time pane can move; refuse stale mappings rather than focusing a different occupant.
  if (!pane) throw new Error('No verified live Herdr binding for this session');
  return host(name, ['tab', 'focus', pane.tab_id]);
}
