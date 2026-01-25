/**
 * Firm Portal Jobs Page
 * Lists all jobs posted by the firm
 */

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, Button, StatusBadge, getStatusType, EmptyState, Skeleton } from '@boby/ui';
import { useAuth } from '../context/AuthContext';
import { jobsApi, Job } from '../lib/api';

export default function JobsPage() {
    const { firmId } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const statusFilter = searchParams.get('status') || 'all';

    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadJobs = async () => {
            if (!firmId) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const data = await jobsApi.list(firmId, {
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                });
                setJobs(data.jobs);
            } catch (err) {
                console.error('Failed to load jobs:', err);
                setError('Failed to load jobs. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        loadJobs();
    }, [firmId, statusFilter]);

    const handleFilterChange = (status: string) => {
        if (status === 'all') {
            searchParams.delete('status');
        } else {
            searchParams.set('status', status);
        }
        setSearchParams(searchParams);
    };

    // Calculate stats from jobs
    const jobStats = {
        all: jobs.length,
        active: jobs.filter(j => j.status === 'active').length,
        filled: jobs.filter(j => j.status === 'filled').length,
        closed: jobs.filter(j => ['closed', 'expired', 'paused'].includes(j.status)).length,
    };

    // Filter jobs based on status (if not already filtered by API)
    const displayJobs = statusFilter === 'all'
        ? jobs
        : jobs.filter(j => {
            if (statusFilter === 'closed') {
                return ['closed', 'expired', 'paused'].includes(j.status);
            }
            return j.status === statusFilter;
        });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
                    <p className="text-gray-500">Manage your job postings</p>
                </div>
                <Link to="/jobs/new">
                    <Button>➕ Post New Job</Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { key: 'all', label: 'All', count: jobStats.all },
                    { key: 'active', label: 'Active', count: jobStats.active },
                    { key: 'filled', label: 'Filled', count: jobStats.filled },
                    { key: 'closed', label: 'Closed', count: jobStats.closed },
                ].map((filter) => (
                    <button
                        key={filter.key}
                        onClick={() => handleFilterChange(filter.key)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                            flex items-center gap-2
                            ${statusFilter === filter.key
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }
                        `}
                    >
                        {filter.label}
                        {!isLoading && (
                            <span className={`
                                px-1.5 py-0.5 rounded-full text-xs
                                ${statusFilter === filter.key
                                    ? 'bg-white/20'
                                    : 'bg-gray-200'
                                }
                            `}>
                                {filter.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Error State */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <p className="text-red-700">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Jobs List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    <Skeleton height="1.5rem" width="60%" />
                                    <Skeleton height="1rem" width="40%" />
                                    <Skeleton height="1rem" width="80%" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : displayJobs.length === 0 ? (
                <Card>
                    <CardContent className="p-8">
                        <EmptyState
                            icon="💼"
                            title="No jobs found"
                            description={
                                statusFilter !== 'all'
                                    ? `No ${statusFilter} jobs. Try a different filter.`
                                    : "You haven't posted any jobs yet. Get started by posting your first job!"
                            }
                            action={
                                <Link to="/jobs/new">
                                    <Button>Post Your First Job</Button>
                                </Link>
                            }
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {displayJobs.map((job) => (
                        <Card key={job.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h3 className="font-semibold text-gray-900">
                                                {job.title}
                                            </h3>
                                            {job.is_urgent && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                                    🔥 Urgent
                                                </span>
                                            )}
                                            {job.is_featured && (
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                                    ⭐ Featured
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                            <span>📍 {job.location_city}, {job.location_state}</span>
                                            <span>📁 {job.job_type.replace(/_/g, ' ')}</span>
                                            <span>📅 {new Date(job.posted_at).toLocaleDateString()}</span>
                                            <span>👁 {job.view_count || 0} views</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                {job.enquiry_count || 0} applicants
                                            </p>
                                            <StatusBadge type={getStatusType(job.status)} size="sm">
                                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                            </StatusBadge>
                                        </div>
                                        <Link to={`/applications?job=${job.id}`}>
                                            <Button variant="outline" size="sm">
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* No Firm Warning */}
            {!firmId && !isLoading && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4">
                        <p className="text-amber-800">
                            ⚠️ You need to be linked to a firm to view and post jobs.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
