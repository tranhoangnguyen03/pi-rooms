import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolveSession, sessionFiles, putRecord, records, live, claim } from '../proof/state.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'rooms-unit-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
function session(root, id, name = id) {
  const file = join(root, `${name}.jsonl`);
  writeFileSync(file, JSON.stringify({ type: 'session', id, cwd: root }) + '\n');
  return file;
}
test('exact IDs beat prefixes; ambiguous and missing IDs fail', t => {
  const root = fixture(t); session(root, 'abc'); session(root, 'abcd');
  const files = sessionFiles(root);
  assert.equal(resolveSession('abc', files).id, 'abc');
  assert.throws(() => resolveSession('ab', files), /Ambiguous/);
  assert.throws(() => resolveSession('missing', files), /Missing/);
});
test('duplicate exact IDs are rejected, including different files', t => {
  const root = fixture(t); session(root, 'same', 'one'); session(root, 'same', 'two');
  assert.throws(() => resolveSession('same', sessionFiles(root)), /Ambiguous/);
});
test('non-session JSONL does not break discovery; explicit corrupt file fails', t => {
  const root = fixture(t); session(root, 'valid');
  writeFileSync(join(root, 'workflow.jsonl'), '{"type":"event"}\n');
  writeFileSync(join(root, 'broken.jsonl'), 'not json');
  assert.equal(resolveSession('valid', sessionFiles(root)).id, 'valid');
  assert.throws(() => resolveSession(join(root, 'broken.jsonl'), []));
});
test('exact path retains original cwd and leaves source byte-identical', t => {
  const root = fixture(t); const file = session(root, 'id'); const before = readFileSync(file);
  assert.deepEqual(resolveSession(file, []), { id: 'id', cwd: root, file });
  assert.deepEqual(readFileSync(file), before);
});
test('records roundtrip and live/stopped states are explicit', t => {
  const root = fixture(t); putRecord(root, { id: 'one', parent: 'parent', pid: process.pid });
  assert.equal(live(records(root)[0]), true);
  putRecord(root, { ...records(root)[0], pid: null });
  assert.equal(live(records(root)[0]), false);
  assert.equal(records(root)[0].parent, 'parent');
});
test('exclusive owner claim fails closed and releases only its owner', t => {
  const root = fixture(t); const release = claim(root, 'same');
  assert.throws(() => claim(root, 'same'), /EEXIST/);
  release(); claim(root, 'same')();
});
