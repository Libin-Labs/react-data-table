# @lp-labs/react-data-table

Semantic React tables with stable sorting, filtering, pagination and selection. React 18+ is the only runtime peer. Includes TypeScript, ESM, CommonJS and browser entries. No CSS import required.

## Installation

```sh
npm install @lp-labs/react-data-table
```

Requires React 18 or later in the host application. Server-side rendering is supported. Node.js consumers require Node.js 18 or later.

## Quick Start

```jsx
import DataTable from '@lp-labs/react-data-table';

const rows = [
  { id: 'keyboard', name: 'Keyboard', price: 49 },
  { id: 'mouse', name: 'Mouse', price: 25 },
];

const columns = [
  { id: 'name', header: 'Name' },
  { id: 'price', header: 'Price', cell: (value) => `$${Number(value).toFixed(2)}` },
];

export default function Example() {
  return (
    <DataTable
      data={rows}
      columns={columns}
      caption="Products"
      pageSize={20}
      selectionMode="multiple"
    />
  );
}
```

## Columns

Column options: unique `id`, `header`, `accessor` (property or function), `cell(value,row)`, `compare(a,b,rowA,rowB)`, `sortable` and `searchable` (default true), `filter(value,query,row)`, and `width`. The pure `getTableRows` helper performs stable sorting and filtering without mutating input. `getCellValue` is also exported.

Without an accessor, a column reads `row[column.id]`. Use `cell` for display formatting and `accessor` for the underlying value used by sorting and filtering.

## DataTable API

| Prop | Default | Description |
| --- | --- | --- |
| `data` | `[]` | Row data |
| `columns` | `[]` | Column definitions with unique IDs |
| `getRowId(row, index)` | `row.id ?? index` | Stable row identifier |
| `sort` / `defaultSort` | `null` | `{ id, direction: 'asc' \| 'desc' }` |
| `query` / `defaultQuery` | `''` | Global search text |
| `filters` | `{}` | Per-column filter values keyed by column ID |
| `page` / `defaultPage` | `0` | Zero-based page index |
| `pageSize` | `10` | Maximum rows per page |
| `selectionMode` | `'none'` | `'none'`, `'single'`, or `'multiple'` |
| `selectedIds` / `defaultSelectedIds` | `[]` | Selected row IDs |
| `showSearch` | `true` | Show the built-in search field |
| `caption` | none | Native table caption |
| `emptyContent` | `'No rows'` | Empty-result content |

Callbacks are `onSortChange(sort)`, `onQueryChange(query)`, `onPageChange(page)`, `onSelectionChange(ids)`, and `onRowClick(row)`. Standard wrapper div attributes and styles are supported. Apply the corresponding callback when supplying a controlled value; `default*` props initialize internal state only.

## Sorting And Filtering

Global search uses `query`/`defaultQuery` and `onQueryChange`; `showSearch` defaults true. Pass `filters` keyed by column id for per-column filters, supplying your own filter controls. Search is case-insensitive substring matching by default. Sorting uses `sort`/`defaultSort` with `{id,direction:'asc'|'desc'}` and `onSortChange`; clicking a column alternates ascending/descending. Native table headings expose sort state.

## Pagination And Selection

Pagination uses zero-based `page`/`defaultPage`, `pageSize` (default `10`), and `onPageChange`. Invalid page sizes throw; pages beyond filtered data are clamped for display. Search and sort interactions request page `0`. Controlled props require applying their corresponding callbacks.

`selectionMode` is `none` (default), `single`, or `multiple`. Use `selectedIds`/`defaultSelectedIds` and `onSelectionChange`; the header checkbox selects only the current page and preserves off-page selections. IDs come from `getRowId(row,index)` or `row.id ?? index`; provide stable unique IDs for changing data. Selection ignores IDs absent from data. No hierarchical cascade or shift-range selection is included.

## Compatibility And Limits

Put custom interactive cell controls in `cell` renderers for keyboard-accessible row actions; `onRowClick` alone is not a keyboard action. Table contents are not virtualized: pagination bounds displayed rows, but sorting/filtering process the full data array in memory. Server-side pagination, column dragging/resizing, CSV export and variable-height virtualization are not included. SSR and React Server Component client boundaries are supported.

## Support

Support maintenance with a [PayPal donation](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/).