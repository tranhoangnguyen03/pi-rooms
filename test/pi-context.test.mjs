import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { savedContext } from '../proof/context.mjs';

test('installed Pi projects active branch and compaction without changing source', { skip: !process.env.PI_MODULE_URL }, async t => {
  const root = mkdtempSync(join(tmpdir(), 'rooms-context-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const file = join(root, 'fixture.jsonl');
  const entry = (id, parentId, text) => ({ type: 'message', id, parentId, timestamp: new Date().toISOString(), message: { role: 'user', content: text, timestamp: Date.now() } });
  const entries = [
    { type: 'session', version: 3, id: 'fixture', cwd: root },
    entry('a', null, 'root'), entry('b', 'a', 'abandoned'), entry('c', 'a', 'selected'),
    { type: 'compaction', id: 'd', parentId: 'c', timestamp: new Date().toISOString(), summary: 'summary of root', firstKeptEntryId: 'c', tokensBefore: 100 },
    entry('e', 'd', 'latest'),
  ];
  writeFileSync(file, entries.map(e => JSON.stringify(e)).join('\n') + '\n');
  const before = readFileSync(file);
  const result = await savedContext(file, process.env.PI_MODULE_URL);
  const text = JSON.stringify(result.messages);
  assert.ok(!text.includes('abandoned'));
  assert.ok(text.includes('summary of root'));
  assert.ok(text.includes('selected'));
  assert.ok(text.includes('latest'));
  assert.equal(result.throughEntryId, 'e');
  assert.deepEqual(readFileSync(file), before);
});
