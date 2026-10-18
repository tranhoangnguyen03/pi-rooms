import { execFileSync } from 'node:child_process';

export function host(name, args) {
  if (!name || !name.startsWith('pi-rooms-proof')) throw new Error('Proof requires an explicit pi-rooms-proof* host');
  const output = execFileSync('herdr', ['--session', name, ...args], { encoding: 'utf8', timeout: 45000 });
  const result = JSON.parse(output);
  if (result.error) throw new Error(JSON.stringify(result.error));
  return result.result;
}

export function matchingPane(snapshot, record) {
  const matches = snapshot.panes.filter(p => p.agent === 'pi' && (
    (p.agent_session?.kind === 'path' && p.agent_session.value === record.file) ||
    (p.agent_session?.kind === 'id' && p.agent_session.value === record.id)));
  if (matches.length > 1) throw new Error('Multiple live host bindings: inspect duplicate sessions');
  return matches[0];
}

export function focusRoom(name, record) {
  const snapshot = host(name, ['api', 'snapshot']).snapshot;
  const pane = matchingPane(snapshot, record);
  // A launch-time pane can move; refuse stale mappings rather than focusing a different occupant.
  if (!pane) throw new Error('No verified live Herdr binding for this session');
  return host(name, ['tab', 'focus', pane.tab_id]);
}
