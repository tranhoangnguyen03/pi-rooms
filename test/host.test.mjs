import test from 'node:test';
import assert from 'node:assert/strict';
import { matchingPane } from '../proof/host.mjs';

test('host-restored Pi is found even without a live local record', () => {
  const pane = { agent: 'pi', pane_id: 'p1', agent_session: { kind: 'path', value: '/saved.jsonl' } };
  assert.equal(matchingPane({ panes: [pane] }, { id: 'room', file: '/saved.jsonl', pid: null }), pane);
});
test('historical shell metadata is not a live Pi binding', () => {
  assert.equal(matchingPane({ panes: [{ agent_session: { kind: 'id', value: 'room' } }] }, { id: 'room' }), undefined);
});
test('multiple matching live bindings fail closed', () => {
  const pane = { agent: 'pi', agent_session: { kind: 'id', value: 'room' } };
  assert.throws(() => matchingPane({ panes: [pane, { ...pane }] }, { id: 'room' }), /Multiple live/);
});
