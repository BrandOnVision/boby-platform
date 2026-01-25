/**
 * Agent Portal - My Applications Page
 * 
 * Shows jobs that the agent has applied to with status tracking
 * Brand-compliant: Gold accents, 2-letter markers, no emojis
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, CircleBadge } from '@boby/ui';
import { useQuery } from '@tanstack/react-query';
import { jobsApi } from '../lib/api';
import { formatCurrency, formatRelativeTime } from '../hooks/useApi';

// Application status styling
const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    'pending': { label: 'Pending Review', bg: 'bg-warning/10', text: 'text-warning' },
    'viewed': { label: 'Viewed', bg: 'bg-info/10', text: 'text-info' },
    'shortlisted': { label: 'Shortlisted', bg: 'bg-success/10', text: 'text-success' },
    'rejected': { label: 'Not Selected', bg: 'bg-grey-200', text: 'text-text-muted' },
    'accepted': { label: 'Accepted', bg: 'bg-success/10', text: 'text-success' },
};

// Job type markers
const jobTypeConfig: Record<string, { label: string; marker: string }> = {
    'guard': { label: 'Guard', marker: 'GD' },
    'security_driver': { label: 'Security Driver', marker: 'SD' },
    'bodyguard': { label: 'Bodyguard', marker: 'BG' },
    'locksmith': { label: 'Locksmith', marker: 'LS' },
    'investigator': { label: 'Investigator', marker: 'IV' },
    'firm_contract': { label: 'Firm Contract', marker: 'FC' },
    'neighbourhood_patrol': { label: 'Patrol', marker: 'NP' },
    'property_protection': { label: 'Property Protection', marker: 'PP' },
    'private_investigator': { label: 'PI', marker: 'PI' },
    'other': { label: 'Other', marker: 'OT' },
};

type FilterStatus = 'all' | 'pending' | 'active' | 'closed';

export function MyApplicationsPage() {
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['my-applications'],
        queryFn: () => jobsApi.myApplications(),
    });

    const applications = data?.applications || [];

    // Filter applications
    const filteredApplications = applications.filter(app => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'pending') return app.application_status === 'pending' || !app.application_status;
        if (filterStatus === 'active') return app.job_status === 'active';
        if (filterStatus === 'closed') return app.job_status !== 'active';
        return true;
    });

    // Stats
    const stats = {
        total: applications.length,
        pending: applications.filter(a => a.application_status === 'pending' || !a.application_status).length,
        active: applications.filter(a => a.job_status === 'active').length,
        shortlisted: applications.filter(a => a.application_status === 'shortlisted').length,
    };

    // Format pay rate
    const formatRate = (payType?: string, payMin?: number, payMax?: number): string => {
        if (!payMin && !payMax) return 'Negotiable';
        if (payMin && payMax) {
            return `${formatCurrency(payMin)} - ${formatCurrency(payMax)}/${payType === 'hourly' ? 'hr' : 'job'}`;
        }
        if (payMin) return `From ${formatCurrency(payMin)}/${payType === 'hourly' ? 'hr' : 'job'}`;
        if (payMax) return `Up to ${formatCurrency(payMax)}/${payType === 'hourly' ? 'hr' : 'job'}`;
        return 'Negotiable';
    };

    // Get circle level
    const getCircleLevel = (jobType: string, isUrgent: boolean, isFeatured: boolean): 'center' | 'inner' | 'mid' | 'outer' | 'public' => {
        if (isFeatured) return 'center';
        if (isUrgent) return 'inner';
        if (jobType === 'firm_contract' || jobType === 'bodyguard') return 'mid';
        return 'outer';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                        My Applications
                    </h1>
                    <p className="text-text-muted mt-1">
                        Track your job applications
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card variant="elevated" padding="md" className="bg-primary border-none">
                    <CardContent>
                        <p className="text-sm text-text-primary/70 mb-1">Total Applied</p>
                        <p className="text-3xl font-bold text-text-primary">
                            {isLoading ? '...' : stats.total}
                        </p>
                    </CardContent>
                </Card>
                <Card variant="elevated" padding="md">
                    <CardContent>
                        <p className="text-sm text-text-muted mb-1">Pending Review</p>
                        <p className="text-3xl font-bold text-warning">
                            {isLoading ? '...' : stats.pending}
                        </p>
                    </CardContent>
                </Card>
                <Card variant="elevated" padding="md">
                    <CardContent>
                        <p className="text-sm text-text-muted mb-1">Active Jobs</p>
                        <p className="text-3xl font-bold text-success">
                            {isLoading ? '...' : stats.active}
                        </p>
                    </CardContent>
                </Card>
                <Card variant="elevated" padding="md">
                    <CardContent>
                        <p className="text-sm text-text-muted mb-1">Shortlisted</p>
                        <p className="text-3xl font-bold text-info">
                            {isLoading ? '...' : stats.shortlisted}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <Button
                    variant={filterStatus === 'all' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                >
                    All ({stats.total})
                </Button>
                <Button
                    variant={filterStatus === 'pending' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterStatus('pending')}
                >
                    Pending ({stats.pending})
                </Button>
                <Button
                    variant={filterStatus === 'active' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterStatus('active')}
                >
                    Active Jobs
                </Button>
                <Button
                    variant={filterStatus === 'closed' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilterStatus('closed')}
                >
                    Closed Jobs
                </Button>
            </div>

            {/* Error State */}
            {error && (
                <Card variant="default" padding="lg" className="mb-4 border-danger/30">
                    <CardContent className="text-center">
                        <div className="w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <span className="text-sm font-bold text-danger">ER</span>
                        </div>
                        <p className="text-danger mb-2">Failed to load applications</p>
                        <Button variant="outline" size="sm" onClick={() => refetch()}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} variant="default" padding="none" className="animate-pulse">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-grey-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-grey-200 rounded w-1/3" />
                                        <div className="h-4 bg-grey-200 rounded w-1/4" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Applications List */}
            {!isLoading && !error && (
                <div className="space-y-4">
                    {filteredApplications.length === 0 ? (
                        <Card variant="default" padding="lg">
                            <CardContent className="text-center py-12">
                                <div className="w-16 h-16 bg-grey-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <span className="text-lg font-bold text-text-muted">AP</span>
                                </div>
                                <p className="text-text-muted mb-4">
                                    {filterStatus === 'all'
                                        ? "You haven't applied to any jobs yet"
                                        : "No applications match this filter"}
                                </p>
                                <Link to="/jobs">
                                    <Button variant="primary" size="sm">
                                        Browse Jobs
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredApplications.map((app) => {
                            const status = statusConfig[app.application_status] || statusConfig['pending'];
                            const jobType = jobTypeConfig[app.job_type] || { label: app.job_type, marker: 'JB' };
                            const isJobClosed = app.job_status !== 'active';

                            return (
                                <Card
                                    key={app.enquiry_id}
                                    variant="default"
                                    padding="none"
                                    className={`overflow-hidden transition-colors ${isJobClosed ? 'opacity-60' : 'hover:border-primary/50'}`}
                                >
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                {/* Job Type Marker */}
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${isJobClosed ? 'bg-grey-200' :
                                                    app.is_featured ? 'bg-primary' :
                                                        app.is_urgent ? 'bg-danger/10' : 'bg-grey-200'
                                                    }`}>
                                                    <span className={`text-sm font-bold ${isJobClosed ? 'text-text-muted' :
                                                        app.is_featured ? 'text-text-primary' :
                                                            app.is_urgent ? 'text-danger' : 'text-text-muted'
                                                        }`}>
                                                        {jobType.marker}
                                                    </span>
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <h3 className="font-semibold text-text-primary">{app.job_title}</h3>
                                                        <CircleBadge
                                                            level={getCircleLevel(app.job_type, app.is_urgent, app.is_featured)}
                                                            size="sm"
                                                        />
                                                        {isJobClosed && (
                                                            <span className="text-xs bg-grey-200 text-text-muted px-2 py-0.5 rounded font-medium">
                                                                CLOSED
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-text-secondary">
                                                        {jobType.label}
                                                        {app.poster_name && ` • ${app.poster_name}`}
                                                    </p>
                                                    <p className="text-sm text-text-muted">
                                                        {app.location_city}, {app.location_state}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:items-end gap-2">
                                                {/* Application Status */}
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${status.bg} ${status.text}`}>
                                                    {status.label}
                                                </span>

                                                <p className="text-sm text-text-muted">
                                                    Applied {formatRelativeTime(app.applied_at)}
                                                </p>

                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-bold text-success">
                                                        {formatRate(app.pay_type, app.pay_min, app.pay_max)}
                                                    </span>
                                                    <Link to={`/jobs/${app.job_slug}`}>
                                                        <Button variant="outline" size="sm">View Job</Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Application Message Preview */}
                                        {app.message && (
                                            <div className="mt-4 pt-4 border-t border-grey-200">
                                                <p className="text-sm text-text-muted">
                                                    <span className="font-medium text-text-secondary">Your message: </span>
                                                    {app.message.length > 150
                                                        ? `${app.message.substring(0, 150)}...`
                                                        : app.message}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            )}

            {/* Summary Footer */}
            {!isLoading && filteredApplications.length > 0 && (
                <div className="mt-6 text-center text-sm text-text-muted">
                    Showing {filteredApplications.length} of {stats.total} applications
                </div>
            )}
        </div>
    );
}
