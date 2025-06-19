'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import LoadingSpinner from './LoadingSpinner';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  className?: string;
}

export default function DataTable<T>({
  data,
  columns,
  keyField,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  actions,
  className,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a: any, b: any) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="medium" color="primary" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 p-6 text-center">
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "px-3 py-3.5 text-left text-sm font-semibold text-slate-900",
                  column.width,
                  column.sortable && "cursor-pointer hover:bg-slate-100"
                )}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
              >
                <div className="flex items-center">
                  {column.header}
                  {sortConfig && sortConfig.key === column.key && (
                    <span className="ml-2">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {actions && <th scope="col" className="relative px-3 py-3.5 text-sm font-semibold">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {sortedData.map((item) => (
            <tr
              key={String(item[keyField])}
              className={cn(
                "hover:bg-slate-50",
                onRowClick && "cursor-pointer"
              )}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
            >
              {columns.map((column) => (
                <td key={`${String(item[keyField])}-${column.key}`} className="whitespace-nowrap px-3 py-4 text-sm text-slate-900">
                  {column.render ? column.render(item) : (item as any)[column.key]}
                </td>
              ))}
              {actions && (
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-900">
                  {actions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}