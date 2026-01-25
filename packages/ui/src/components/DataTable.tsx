/**
 * Data Table Component
 * 
 * Reusable table with sorting, filtering, and pagination
 */

import React, { useState, useMemo } from 'react';
import { cn } from '../lib/cn';

export interface Column<T> {
    /** Unique key for the column */
    key: string;
    /** Header label */
    label: string;
    /** Render function for cell content */
    render?: (item: T, index: number) => React.ReactNode;
    /** Whether column is sortable */
    sortable?: boolean;
    /** Column width */
    width?: string;
    /** Alignment */
    align?: 'left' | 'center' | 'right';
    /** Hide on mobile */
    hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
    /** Data array */
    data: T[];
    /** Column definitions */
    columns: Column<T>[];
    /** Row key extractor */
    getRowKey: (item: T, index: number) => string;
    /** Loading state */
    isLoading?: boolean;
    /** Empty state message */
    emptyMessage?: string;
    /** On row click handler */
    onRowClick?: (item: T, index: number) => void;
    /** Custom className */
    className?: string;
    /** Show row hover effect */
    hoverable?: boolean;
    /** Compact mode */
    compact?: boolean;
    /** Striped rows */
    striped?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends object>({
    data,
    columns,
    getRowKey,
    isLoading = false,
    emptyMessage = 'No data available',
    onRowClick,
    className,
    hoverable = true,
    compact = false,
    striped = false,
}: DataTableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDirection(prev =>
                prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
            );
            if (sortDirection === 'desc') {
                setSortKey(null);
            }
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo(() => {
        if (!sortKey || !sortDirection) return data;

        return [...data].sort((a, b) => {
            const aVal = (a as Record<string, unknown>)[sortKey];
            const bVal = (b as Record<string, unknown>)[sortKey];

            if (aVal === bVal) return 0;
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            const comparison = aVal < bVal ? -1 : 1;
            return sortDirection === 'desc' ? -comparison : comparison;
        });
    }, [data, sortKey, sortDirection]);

    const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3';

    return (
        <div className={cn('overflow-x-auto', className)}>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={cn(
                                    cellPadding,
                                    'text-left text-sm font-semibold text-gray-900',
                                    column.hideOnMobile && 'hidden md:table-cell',
                                    column.align === 'center' && 'text-center',
                                    column.align === 'right' && 'text-right',
                                    column.sortable && 'cursor-pointer select-none hover:bg-gray-100'
                                )}
                                style={{ width: column.width }}
                                onClick={() => column.sortable && handleSort(column.key)}
                            >
                                <div className="flex items-center gap-1">
                                    {column.label}
                                    {column.sortable && (
                                        <span className="text-gray-400">
                                            {sortKey === column.key ? (
                                                sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'
                                            ) : '↕'}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        // Loading skeleton rows
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={`skeleton-${i}`} className="border-b border-gray-100">
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={cn(cellPadding, column.hideOnMobile && 'hidden md:table-cell')}
                                    >
                                        <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: '60%' }} />
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : sortedData.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-4 py-12 text-center text-gray-500"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        sortedData.map((item, index) => (
                            <tr
                                key={getRowKey(item, index)}
                                className={cn(
                                    'border-b border-gray-100 transition-colors',
                                    striped && index % 2 === 1 && 'bg-gray-50',
                                    hoverable && 'hover:bg-gray-50',
                                    onRowClick && 'cursor-pointer'
                                )}
                                onClick={() => onRowClick?.(item, index)}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={cn(
                                            cellPadding,
                                            'text-sm text-gray-900',
                                            column.hideOnMobile && 'hidden md:table-cell',
                                            column.align === 'center' && 'text-center',
                                            column.align === 'right' && 'text-right'
                                        )}
                                    >
                                        {column.render
                                            ? column.render(item, index)
                                            : String((item as Record<string, unknown>)[column.key] ?? '-')
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
