import { readFileSync } from 'node:fs';

// Use the installed Pi projection function; never open a live file through a writable manager.
export async function savedContext(file, piModuleUrl) {
  const { buildSessionContext } = await import(piModuleUrl);
  const lines = readFileSync(file, 'utf8').split('\n');
  // An in-progress final append is not a complete snapshot entry.
  if (lines.at(-1) !== '') lines.pop();
  const entries = lines.filter(Boolean).map(line => JSON.parse(line)).filter(e => e.type !== 'session');
  return { throughEntryId: entries.at(-1)?.id ?? null, ...buildSessionContext(entries) };
}
