import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from 'react';
export interface Sort { id: string; direction: 'asc' | 'desc' }
export interface Column<T> { id: string; header?: ReactNode; accessor?: keyof T | ((row: T) => unknown); sortable?: boolean; searchable?: boolean; width?: CSSProperties['width']; cell?: (value: unknown, row: T) => ReactNode; compare?: (first: any, second: any, firstRow: T, secondRow: T) => number; filter?: (value: unknown, filter: unknown, row: T) => boolean }
export interface TableProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  data?: readonly T[]; columns?: readonly Column<T>[]; getRowId?: (row: T, index: number) => string | number;
  sort?: Sort | null; defaultSort?: Sort | null; onSortChange?: (sort: Sort) => void;
  query?: string; defaultQuery?: string; onQueryChange?: (query: string) => void; filters?: Record<string, unknown>;
  page?: number; defaultPage?: number; pageSize?: number; onPageChange?: (page: number) => void;
  selectionMode?: 'none' | 'single' | 'multiple'; selectedIds?: readonly (string | number)[]; defaultSelectedIds?: readonly (string | number)[]; onSelectionChange?: (ids: (string | number)[]) => void;
  showSearch?: boolean; caption?: ReactNode; emptyContent?: ReactNode; onRowClick?: (row: T) => void;
}
export function DataTable<T = Record<string, unknown>>(props: TableProps<T>): ReactElement;
export default DataTable;
export function getCellValue<T>(column: Column<T>, row: T): unknown;
export function getTableRows<T>(data: readonly T[], columns: readonly Column<T>[], options?: { query?: string; filters?: Record<string, unknown>; sort?: Sort | null }): T[];