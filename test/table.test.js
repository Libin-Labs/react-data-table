import { beforeEach, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as element } from 'react';
import { setupDOM, click, input } from './helpers/dom.js';
import Table, { getTableRows } from '../src/index.js';
let ui;
const data = [{ id: 'a', name: 'Zulu', score: 2 }, { id: 'b', name: 'Alpha', score: 1 }, { id: 'c', name: 'Beta', score: 1 }];
const columns = [{ id: 'name', header: 'Name' }, { id: 'score', header: 'Score' }];
beforeEach(async () => { ui = await setupDOM(); });
afterEach(async () => ui.cleanup());
test('stable sorting, global search and per-column filtering preserve input', () => {
  assert.deepEqual(getTableRows(data, columns, { sort: { id: 'score', direction: 'asc' } }).map((row) => row.id), ['b', 'c', 'a']);
  assert.deepEqual(getTableRows(data, columns, { query: 'beta' }).map((row) => row.id), ['c']);
  assert.equal(getTableRows(data, columns, { filters: { score: 1 } }).length, 2);
  assert.equal(data[0].name, 'Zulu');
});
test('header buttons sort, pagination works and search resets the page', async () => {
  await ui.render(element(Table, { data, columns, pageSize: 1 }));
  await click(ui.container.querySelector('[aria-label="Sort Name"]'));
  assert.ok(ui.container.querySelector('tbody').textContent.includes('Alpha'));
  await click(ui.container.querySelector('[aria-label="Next page"]'));
  assert.ok(ui.container.querySelector('tbody').textContent.includes('Beta'));
  await input(ui.container.querySelector('input[type="search"]'), 'zulu');
  assert.ok(ui.container.querySelector('tbody').textContent.includes('Zulu'));
  assert.equal(ui.container.querySelector('[aria-label="Previous page"]').disabled, true);
});
test('page selection preserves off-page ids and empty states render', async () => {
  const changes = [];
  await ui.render(element(Table, { data, columns, pageSize: 1, selectionMode: 'multiple', onSelectionChange: (ids) => changes.push(ids) }));
  await click(ui.container.querySelector('[aria-label="Select page"]'));
  await click(ui.container.querySelector('[aria-label="Next page"]'));
  await click(ui.container.querySelector('[aria-label="Select page"]'));
  assert.deepEqual(changes.at(-1), ['a', 'b']);
  await input(ui.container.querySelector('input[type="search"]'), 'missing');
  assert.ok(ui.container.textContent.includes('No rows'));
});