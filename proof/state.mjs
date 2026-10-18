import { mkdirSync, readFileSync, writeFileSync, renameSync, readdirSync, existsSync, openSync, closeSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

export function readHeader(file) {
  const header = JSON.parse(readFileSync(file, 'utf8').split('\n')[0]);
  if (header.type !== 'session' || !header.id || !header.cwd) throw new Error(`Invalid session header: ${file}`);
  return { id: header.id, cwd: header.cwd, file: resolve(file) };
}

export function resolveSession(query, files) {
  if (query.includes('/') || query.endsWith('.jsonl')) return readHeader(resolve(query));
  const headers = files.flatMap(file => {
    try { return [readHeader(file)]; } catch (error) {
      if (error instanceof SyntaxError || String(error.message).startsWith('Invalid session header:')) return [];
      throw error;
    }
  });
  const exact = headers.filter(h => h.id === query);
  const matches = exact.length ? exact : headers.filter(h => h.id.startsWith(query));
  if (matches.length !== 1) throw new Error(`${matches.length ? 'Ambiguous' : 'Missing'} session: ${query}`);
  return matches[0];
}

export function sessionFiles(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap(e => e.isDirectory()
    ? sessionFiles(join(root, e.name)) : e.name.endsWith('.jsonl') ? [join(root, e.name)] : []);
}

export function putRecord(root, record) {
  mkdirSync(root, { recursive: true, mode: 0o700 });
  const target = join(root, `${encodeURIComponent(record.id)}.json`);
  const tmp = `${target}.${randomUUID()}.tmp`;
  writeFileSync(tmp, JSON.stringify(record, null, 2), { mode: 0o600 });
  renameSync(tmp, target);
}

export function records(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(join(root, f), 'utf8')));
}

export function processAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; }
  catch (error) { if (error.code === 'ESRCH') return false; throw error; }
}

// shortcut: PID reuse can produce a conservative false conflict; use OS process-start identity before V1.
export function live(record) { return Boolean(record?.pid && processAlive(record.pid)); }

export function claim(root, id, pid = process.pid) {
  mkdirSync(root, { recursive: true, mode: 0o700 });
  const file = join(root, `${encodeURIComponent(id)}.owner`);
  const fd = openSync(file, 'wx', 0o600);
  try { writeFileSync(fd, String(pid)); } finally { closeSync(fd); }
  return () => {
    if (readFileSync(file, 'utf8') !== String(pid)) throw new Error('Owner changed; refusing release');
    unlinkSync(file);
  };
}
