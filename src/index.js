'use client';
import { createElement, useEffect, useRef, useState } from 'react';

export const getCellValue = (column, row) => typeof column.accessor === 'function' ? column.accessor(row) : row[column.accessor ?? column.id];

export function getTableRows(data, columns, { query = '', filters = {}, sort = null } = {}) {
  const search = query.trim().toLocaleLowerCase();
  let rows = data.map((row, index) => ({ row, index }));
  rows = rows.filter(({ row }) => {
    if (search && !columns.some((column) => column.searchable !== false && String(getCellValue(column, row) ?? '').toLocaleLowerCase().includes(search))) return false;
    return columns.every((column) => {
      const filter = filters[column.id];
      if (filter === undefined || filter === '') return true;
      const value = getCellValue(column, row);
      return column.filter ? column.filter(value, filter, row) : String(value ?? '').toLocaleLowerCase().includes(String(filter).toLocaleLowerCase());
    });
  });
  const column = sort && columns.find((item) => item.id === sort.id);
  if (sort && !['asc', 'desc'].includes(sort.direction)) throw new TypeError('Sort direction must be asc or desc.');
  if (column) rows.sort((left, right) => {
    const first = getCellValue(column, left.row);
    const second = getCellValue(column, right.row);
    let order;
    if (column.compare) order = column.compare(first, second, left.row, right.row);
    else if (typeof first === 'number' && typeof second === 'number') order = first - second;
    else order = String(first ?? '').localeCompare(String(second ?? ''), undefined, { numeric: true, sensitivity: 'base' });
    return (sort.direction === 'desc' ? -order : order) || left.index - right.index;
  });
  return rows.map(({ row }) => row);
}

function Check({ mixed = false, ...props }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = mixed; }, [mixed]);
  return createElement('input', { ...props, ref, type: 'checkbox' });
}

export function DataTable({ data = [], columns = [], getRowId = (row, index) => row.id ?? index,
  sort: controlledSort, defaultSort = null, onSortChange, query: controlledQuery, defaultQuery = '', onQueryChange, filters = {},
  page: controlledPage, defaultPage = 0, pageSize = 10, onPageChange, selectionMode = 'none',
  selectedIds: controlledSelection, defaultSelectedIds = [], onSelectionChange, showSearch = true,
  caption, emptyContent = 'No rows', onRowClick, className, style, ...props
}) {
  if (!Number.isSafeInteger(pageSize) || pageSize <= 0) throw new RangeError('pageSize must be a positive integer.');
  if (!['none', 'single', 'multiple'].includes(selectionMode)) throw new TypeError('Invalid selection mode.');
  if (new Set(columns.map((column) => column.id)).size !== columns.length) throw new TypeError('Column ids must be unique.');
  const [internalSort, setSort] = useState(defaultSort);
  const [internalQuery, setQuery] = useState(defaultQuery);
  const [internalPage, setPage] = useState(defaultPage);
  const [internalSelection, setSelection] = useState(defaultSelectedIds);
  const sort = controlledSort === undefined ? internalSort : controlledSort;
  const query = controlledQuery ?? internalQuery;
  const requestedPage = controlledPage ?? internalPage;
  if (!Number.isSafeInteger(requestedPage) || requestedPage < 0) throw new RangeError('page must be a nonnegative integer.');
  const indexed = data.map((row, index) => ({ row, id: getRowId(row, index) }));
  const ids = new Map(indexed.map(({ row, id }) => [row, id]));
  if (new Set(indexed.map(({ id }) => id)).size !== indexed.length) throw new TypeError('Row ids must be unique.');
  const available = new Set(indexed.map(({ id }) => id));
  const selected = new Set((controlledSelection ?? internalSelection).filter((id) => available.has(id)));
  const processed = getTableRows(data, columns, { query, filters, sort });
  const pageCount = Math.max(1, Math.ceil(processed.length / pageSize));
  const page = Math.min(requestedPage, pageCount - 1);
  const displayed = processed.slice(page * pageSize, (page + 1) * pageSize);
  function changePage(next) { if (controlledPage === undefined) setPage(next); onPageChange?.(next); }
  function changeSelection(next) { if (controlledSelection === undefined) setSelection(next); onSelectionChange?.(next); }
  function toggle(id) {
    const next = new Set(selected);
    if (selectionMode === 'single') { changeSelection(selected.has(id) ? [] : [id]); return; }
    if (next.has(id)) next.delete(id); else next.add(id);
    changeSelection([...next]);
  }
  const selectedOnPage = displayed.filter((row) => selected.has(ids.get(row))).length;
  const cellStyle = { padding: '7px 10px', textAlign: 'left', borderBottom: '1px solid #d5d9de', verticalAlign: 'middle' };
  const headers = columns.map((column) => createElement('th', { key: column.id, scope: 'col', style: { ...cellStyle, width: column.width }, 'aria-sort': sort?.id === column.id ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined },
    column.sortable === false ? column.header : createElement('button', { type: 'button', 'aria-label': `Sort ${String(column.header ?? column.id)}`, onClick: () => {
      const next = sort?.id === column.id && sort.direction === 'asc' ? { id: column.id, direction: 'desc' } : { id: column.id, direction: 'asc' };
      if (controlledSort === undefined) setSort(next);
      onSortChange?.(next); changePage(0);
    }, style: { border: 0, background: 'transparent', color: 'inherit', font: 'inherit', padding: 0, cursor: 'pointer' } }, column.header ?? column.id)));
  if (selectionMode !== 'none') headers.unshift(createElement('th', { key: '__selection', scope: 'col', style: cellStyle }, selectionMode === 'multiple' ? createElement(Check, {
    'aria-label': 'Select page', checked: displayed.length > 0 && selectedOnPage === displayed.length, mixed: selectedOnPage > 0 && selectedOnPage < displayed.length, disabled: !displayed.length,
    onChange: () => {
      const next = new Set(selected);
      for (const row of displayed) { const id = ids.get(row); if (selectedOnPage === displayed.length) next.delete(id); else next.add(id); }
      changeSelection([...next]);
    },
  }) : 'Select'));
  const rows = displayed.map((row) => {
    const id = ids.get(row);
    const cells = columns.map((column) => createElement('td', { key: column.id, style: cellStyle }, column.cell ? column.cell(getCellValue(column, row), row) : String(getCellValue(column, row) ?? '')));
    if (selectionMode !== 'none') cells.unshift(createElement('td', { key: '__selection', style: cellStyle }, createElement(Check, { 'aria-label': `Select row ${id}`, checked: selected.has(id), onClick: (event) => event.stopPropagation(), onChange: () => toggle(id) })));
    return createElement('tr', { key: id, 'aria-selected': selectionMode === 'none' ? undefined : selected.has(id), onClick: () => onRowClick?.(row), style: { background: selected.has(id) ? '#edf3ff' : undefined } }, cells);
  });
  if (!rows.length) rows.push(createElement('tr', { key: '__empty' }, createElement('td', { colSpan: columns.length + Number(selectionMode !== 'none'), style: cellStyle }, emptyContent)));
  return createElement('div', { ...props, className, style: { ...style, minWidth: 0, letterSpacing: 0 } },
    showSearch && createElement('input', { type: 'search', 'aria-label': 'Search rows', value: query, onChange: (event) => { const next = event.currentTarget.value; if (controlledQuery === undefined) setQuery(next); onQueryChange?.(next); changePage(0); }, style: { font: 'inherit', padding: 6, marginBottom: 8, maxWidth: '100%', boxSizing: 'border-box' } }),
    createElement('div', { style: { overflowX: 'auto' } }, createElement('table', { style: { width: '100%', borderCollapse: 'collapse', font: 'inherit' } }, caption && createElement('caption', null, caption), createElement('thead', null, createElement('tr', null, headers)), createElement('tbody', null, rows))),
    createElement('nav', { 'aria-label': 'Table pagination', style: { display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, flexWrap: 'wrap' } },
      createElement('button', { type: 'button', title: 'Previous page', 'aria-label': 'Previous page', disabled: page === 0, onClick: () => changePage(page - 1) }, '<'),
      createElement('span', { 'aria-live': 'polite' }, `${page + 1} / ${pageCount} (${processed.length} rows)`),
      createElement('button', { type: 'button', title: 'Next page', 'aria-label': 'Next page', disabled: page === pageCount - 1, onClick: () => changePage(page + 1) }, '>')));
}
export default DataTable;