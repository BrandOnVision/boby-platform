/**
 * Agent Portal Earnings Page
 * 
 * Phase 2: Enhanced with date filtering, earnings chart, mobile-friendly cards
 * Brand-compliant: Gold accents, clean typography, no emojis
 */

import { useState, useMemo } from 'react';
import { Button, Card, CardContent, CardTitle } from '@boby/ui';
import { useEarnings, formatCurrency, formatDate } from '../hooks/useApi';

// Date range options
type DateRange = 'week' | 'month' | '3months' | 'year' | 'all';
const DATE_RANGES: { id: DateRange; name: string }[] = [
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: '3months', name: 'Last 3 Months' },
    { id: 'year', name: 'This Year' },
    { id: 'all', name: 'All Time' },
];

export function EarningsPage() {
    const { data: earnings, isLoading, error, refetch } = useEarnings();
    const [dateRange, setDateRange] = useState<DateRange>('month');

    // Calculate totals from commissions
    const commissions = earnings?.commissions || [];

    // Summary values
    const thisWeek = earnings?.this_week || 0;
    const totalEarned = earnings?.total_earned || 0;
    const pending = earnings?.pending || 0;

    // Filter commissions by date range
    const filteredCommissions = useMemo(() => {
        if (dateRange === 'all') return commissions;

        const now = new Date();
        const ranges: Record<DateRange, number> = {
            week: 7,
            month: 30,
            '3months': 90,
            year: 365,
            all: Infinity,
        };

        const daysAgo = ranges[dateRange];
        const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

        return commissions.filter(c => new Date(c.created_at) >= cutoffDate);
    }, [commissions, dateRange]);

    // Calculate period totals
    const periodTotal = useMemo(() => {
        return filteredCommissions.reduce((sum, c) => sum + c.amount, 0);
    }, [filteredCommissions]);

    const periodPaid = useMemo(() => {
        return filteredCommissions
            .filter(c => c.status === 'paid' || c.status === 'completed')
            .reduce((sum, c) => sum + c.amount, 0);
    }, [filteredCommissions]);

    // Simple bar chart data - last 6 periods
    const chartData = useMemo(() => {
        if (commissions.length === 0) return [];

        // Group by week/month based on date range
        const periods: { label: string; amount: number }[] = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const startDate = new Date(now);
            let label = '';

            if (dateRange === 'week') {
                startDate.setDate(startDate.getDate() - (i * 7));
                label = `W${6 - i}`;
            } else {
                startDate.setMonth(startDate.getMonth() - i);
                label = startDate.toLocaleDateString('en-AU', { month: 'short' });
            }

            const endDate = new Date(startDate);
            if (dateRange === 'week') {
                endDate.setDate(endDate.getDate() + 7);
            } else {
                endDate.setMonth(endDate.getMonth() + 1);
            }

            const amount = commissions
                .filter(c => {
                    const date = new Date(c.created_at);
                    return date >= startDate && date < endDate;
                })
                .reduce((sum, c) => sum + c.amount, 0);

            periods.push({ label, amount });
        }

        return periods;
    }, [commissions, dateRange]);

    const maxChartValue = Math.max(...chartData.map(d => d.amount), 1);

    // Export to CSV
    const handleExport = () => {
        const headers = ['Date', 'Description', 'Amount', 'Status'];
        const rows = filteredCommissions.map(c => [
            formatDate(c.created_at),
            c.description || 'Commission Payment',
            c.amount.toFixed(2),
            c.status
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `earnings-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Header with Export */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                        Earnings
                    </h1>
                    <p className="text-text-muted mt-1">
                        Track your income and payment history
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        Export
                    </Button>
                </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {DATE_RANGES.map((range) => (
                    <Button
                        key={range.id}
                        variant={dateRange === range.id ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setDateRange(range.id)}
                    >
                        {range.name}
                    </Button>
                ))}
            </div>

            {/* Earnings overview - Clean cards with gold accent for primary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card variant="elevated" padding="md" className="bg-primary border-none">
                    <CardContent>
                        <p className="text-sm text-text-primary/70 mb-1">This Week</p>
                        <p className="text-2xl sm:text-3xl font-bold text-text-primary">
                            {isLoading ? '...' : formatCurrency(thisWeek)}
                        </p>
                    </CardContent>
                </Card>
                <Card variant="elevated" padding="md">
                    <CardContent>
                        <p className="text-sm text-text-muted mb-1">Period Total</p>
                        <p className="text-2xl sm:text-3xl font-bold text-text-primary">
                            {isLoading ? '...' : formatCurrency(periodTotal)}
                        </p>
                    </CardContent>
                </Card>
                <Card variant="elevated" padding="md">
                    <CardContent>
                        <p className="text-sm text-text-muted mb-1">Pending</p>
                        <p className="text-2xl sm:text-3xl font-bold text-warning">
                            {isLoading ? '...' : formatCurrency(pending)}
                        </p>
                    </CardContent>
                </Card>
                <Card variant="elevated" padding="md">
                    <CardContent>
                        <p className="text-sm text-text-muted mb-1">Lifetime</p>
                        <p className="text-2xl sm:text-3xl font-bold text-success">
                            {isLoading ? '...' : formatCurrency(totalEarned)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Earnings Chart */}
            {chartData.length > 0 && (
                <Card variant="default" padding="lg" className="mb-8">
                    <CardTitle className="mb-6">Earnings Trend</CardTitle>
                    <div className="h-40 flex items-end justify-between gap-2">
                        {chartData.map((period, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-primary rounded-t transition-all duration-300 hover:bg-primary-dark"
                                    style={{
                                        height: `${Math.max((period.amount / maxChartValue) * 100, 4)}%`,
                                        minHeight: period.amount > 0 ? '8px' : '2px'
                                    }}
                                    title={formatCurrency(period.amount)}
                                />
                                <span className="text-xs text-text-muted mt-2">{period.label}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Error State */}
            {error && (
                <Card variant="default" padding="lg" className="mb-6 border-danger/30">
                    <CardContent className="text-center">
                        <div className="w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <span className="text-sm font-bold text-danger">ER</span>
                        </div>
                        <p className="text-danger">Failed to load earnings data</p>
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Payment history */}
            <Card variant="default" padding="lg">
                <div className="flex items-center justify-between mb-6">
                    <CardTitle>Payment History</CardTitle>
                    <span className="text-sm text-text-muted">
                        {filteredCommissions.length} transactions
                    </span>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-grey-200 rounded animate-pulse" />
                        ))}
                    </div>
                ) : filteredCommissions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-grey-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <span className="text-lg font-bold text-text-muted">EA</span>
                        </div>
                        <p className="text-text-muted">No payments in this period</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table - Hidden on mobile */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-grey-300">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Description</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Date</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Amount</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-text-muted">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCommissions.map((commission) => (
                                        <tr key={commission.id} className="border-b border-grey-200 hover:bg-grey-100">
                                            <td className="py-4 px-4 font-medium text-text-primary">
                                                {commission.description || 'Commission Payment'}
                                            </td>
                                            <td className="py-4 px-4 text-text-secondary">
                                                {formatDate(commission.created_at)}
                                            </td>
                                            <td className="py-4 px-4 font-semibold text-text-primary text-right">
                                                {formatCurrency(commission.amount)}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${commission.status === 'paid' || commission.status === 'completed'
                                                        ? 'bg-success/10 text-success'
                                                        : 'bg-warning/10 text-warning'
                                                        }`}
                                                >
                                                    {commission.status === 'paid' || commission.status === 'completed' ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards - Visible on mobile only */}
                        <div className="sm:hidden space-y-3">
                            {filteredCommissions.map((commission) => (
                                <div
                                    key={commission.id}
                                    className="p-4 bg-grey-100 rounded-lg flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-medium text-text-primary">
                                            {commission.description || 'Commission Payment'}
                                        </p>
                                        <p className="text-sm text-text-muted">
                                            {formatDate(commission.created_at)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-text-primary">
                                            {formatCurrency(commission.amount)}
                                        </p>
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${commission.status === 'paid' || commission.status === 'completed'
                                                ? 'bg-success/10 text-success'
                                                : 'bg-warning/10 text-warning'
                                                }`}
                                        >
                                            {commission.status === 'paid' || commission.status === 'completed' ? 'Paid' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Card>

            {/* Period Summary */}
            {!isLoading && filteredCommissions.length > 0 && (
                <div className="mt-6 p-4 bg-grey-100 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-sm text-text-muted">
                        {DATE_RANGES.find(r => r.id === dateRange)?.name} Summary
                    </div>
                    <div className="flex items-center gap-6">
                        <div>
                            <span className="text-sm text-text-muted mr-2">Paid:</span>
                            <span className="font-bold text-success">{formatCurrency(periodPaid)}</span>
                        </div>
                        <div>
                            <span className="text-sm text-text-muted mr-2">Pending:</span>
                            <span className="font-bold text-warning">{formatCurrency(periodTotal - periodPaid)}</span>
                        </div>
                        <div>
                            <span className="text-sm text-text-muted mr-2">Total:</span>
                            <span className="font-bold text-text-primary">{formatCurrency(periodTotal)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
