/**
 * Agent Portal Jobs Page
 * 
 * Displays available job listings with filtering and search
 * Phase 2: Added search, location filter, sort options
 * Brand-compliant: Gold accents, 2-letter markers, no emojis
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardContent, CircleBadge, Input } from '@boby/ui';
import { useJobs, useJobTypes, formatCurrency, formatRelativeTime } from '../hooks/useApi';

// Australian states for location filter
const STATES = [
    { id: 'all', name: 'All Locations' },
    { id: 'QLD', name: 'QLD' },
    { id: 'NSW', name: 'NSW' },
    { id: 'VIC', name: 'VIC' },
    { id: 'WA', name: 'WA' },
    { id: 'SA', name: 'SA' },
    { id: 'TAS', name: 'TAS' },
    { id: 'NT', name: 'NT' },
    { id: 'ACT', name: 'ACT' },
];

// Sort options
type SortOption = 'newest' | 'oldest' | 'rate_high' | 'rate_low';
const SORT_OPTIONS: { id: SortOption; name: string }[] = [
    { id: 'newest', name: 'Newest First' },
    { id: 'oldest', name: 'Oldest First' },
    { id: 'rate_high', name: 'Highest Pay' },
    { id: 'rate_low', name: 'Lowest Pay' },
];

export function JobsPage() {
    const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
    const [selectedState, setSelectedState] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [showUrgentOnly, setShowUrgentOnly] = useState(false);
    const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

    const { data: jobsData, isLoading, error, refetch } = useJobs({
        type: selectedType,
        state: selectedState !== 'all' ? selectedState : undefined,
        limit: 50
    });
    const { data: typesData } = useJobTypes();

    // Job type display names with markers
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

    // Filter and sort jobs
    const filteredJobs = useMemo(() => {
        let jobs = jobsData?.jobs || [];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            jobs = jobs.filter(job =>
                job.title.toLowerCase().includes(query) ||
                job.description?.toLowerCase().includes(query) ||
                job.location_city?.toLowerCase().includes(query)
            );
        }

        // Urgent filter
        if (showUrgentOnly) {
            jobs = jobs.filter(job => job.is_urgent);
        }

        // Featured filter
        if (showFeaturedOnly) {
            jobs = jobs.filter(job => job.is_featured);
        }

        // Sort
        switch (sortBy) {
            case 'oldest':
                jobs = [...jobs].sort((a, b) =>
                    new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime()
                );
                break;
            case 'rate_high':
                jobs = [...jobs].sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0));
                break;
            case 'rate_low':
                jobs = [...jobs].sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
                break;
            case 'newest':
            default:
                jobs = [...jobs].sort((a, b) =>
                    new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
                );
                break;
        }

        return jobs;
    }, [jobsData?.jobs, searchQuery, sortBy, showUrgentOnly, showFeaturedOnly]);

    // Map job type to circle level for visual representation
    const getCircleLevel = (jobType: string, isUrgent: boolean, isFeatured: boolean): 'center' | 'inner' | 'mid' | 'outer' | 'public' => {
        if (isFeatured) return 'center';
        if (isUrgent) return 'inner';
        if (jobType === 'firm_contract' || jobType === 'bodyguard') return 'mid';
        return 'outer';
    };

    // Format hourly rate
    const formatRate = (rate?: number): string => {
        if (!rate) return 'Negotiable';
        return `${formatCurrency(rate)}/hr`;
    };

    // Get marker for job type
    const getJobMarker = (jobType: string): string => {
        return jobTypeConfig[jobType]?.marker || 'JB';
    };

    // Active filter count
    const activeFilterCount = [
        showUrgentOnly,
        showFeaturedOnly,
        selectedState !== 'all',
        selectedType,
    ].filter(Boolean).length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                        Available Jobs
                    </h1>
                    <p className="text-text-muted mt-1">
                        {isLoading ? 'Loading...' : `${filteredJobs.length} positions found`}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Refresh
                </Button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <Input
                    placeholder="Search jobs by title, description, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                />
            </div>

            {/* Filter Toggle + Quick Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <Button
                    variant={showFilters ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded bg-grey-300 text-[8px] font-bold flex items-center justify-center">FT</span>
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-primary text-text-primary text-xs font-bold flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </span>
                </Button>

                {/* Quick Filter Chips */}
                <button
                    onClick={() => setShowUrgentOnly(!showUrgentOnly)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${showUrgentOnly
                            ? 'bg-danger/10 border-danger/30 text-danger'
                            : 'bg-grey-100 border-grey-300 text-text-muted hover:border-grey-400'
                        }`}
                >
                    Urgent Only
                </button>
                <button
                    onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${showFeaturedOnly
                            ? 'bg-primary/20 border-primary/30 text-primary-dark'
                            : 'bg-grey-100 border-grey-300 text-text-muted hover:border-grey-400'
                        }`}
                >
                    Featured Only
                </button>

                {/* Sort Dropdown */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="ml-auto px-3 py-1.5 rounded-lg border border-grey-300 bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    {SORT_OPTIONS.map(option => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                    ))}
                </select>
            </div>

            {/* Expanded Filters Panel */}
            {showFilters && (
                <Card variant="default" padding="md" className="mb-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        {/* Job Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Job Type</label>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={!selectedType ? 'primary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSelectedType(undefined)}
                                >
                                    All Types
                                </Button>
                                {(typesData?.types || []).map((type) => (
                                    <Button
                                        key={type.id}
                                        variant={selectedType === type.id ? 'primary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setSelectedType(type.id)}
                                    >
                                        {type.name}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Location Filter */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Location</label>
                            <div className="flex flex-wrap gap-2">
                                {STATES.map((state) => (
                                    <Button
                                        key={state.id}
                                        variant={selectedState === state.id ? 'primary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setSelectedState(state.id)}
                                    >
                                        {state.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {activeFilterCount > 0 && (
                        <div className="mt-4 pt-4 border-t border-grey-200">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedType(undefined);
                                    setSelectedState('all');
                                    setShowUrgentOnly(false);
                                    setShowFeaturedOnly(false);
                                    setSearchQuery('');
                                }}
                            >
                                Clear All Filters
                            </Button>
                        </div>
                    )}
                </Card>
            )}

            {/* Error State */}
            {error && (
                <Card variant="default" padding="lg" className="mb-4 border-danger/30">
                    <CardContent className="text-center">
                        <div className="w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <span className="text-sm font-bold text-danger">ER</span>
                        </div>
                        <p className="text-danger mb-2">Failed to load jobs</p>
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
                        <Card key={i} variant="default" padding="none" className="overflow-hidden animate-pulse">
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

            {/* Job listings */}
            {!isLoading && !error && (
                <div className="space-y-4">
                    {filteredJobs.length === 0 ? (
                        <Card variant="default" padding="lg">
                            <CardContent className="text-center py-12">
                                <div className="w-16 h-16 bg-grey-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <span className="text-lg font-bold text-text-muted">JB</span>
                                </div>
                                <p className="text-text-muted mb-2">No jobs found matching your criteria</p>
                                {activeFilterCount > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedType(undefined);
                                            setSelectedState('all');
                                            setShowUrgentOnly(false);
                                            setShowFeaturedOnly(false);
                                            setSearchQuery('');
                                        }}
                                    >
                                        Clear Filters
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        filteredJobs.map((job) => (
                            <Link key={job.id} to={`/jobs/${job.slug}`} className="block">
                                <Card variant="default" padding="none" className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
                                    <CardContent className="p-4 sm:p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                {/* Job type marker */}
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${job.is_featured ? 'bg-primary' :
                                                        job.is_urgent ? 'bg-danger/10' : 'bg-grey-200'
                                                    }`}>
                                                    <span className={`text-sm font-bold ${job.is_featured ? 'text-text-primary' :
                                                            job.is_urgent ? 'text-danger' : 'text-text-muted'
                                                        }`}>
                                                        {getJobMarker(job.job_type)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <h3 className="font-semibold text-text-primary">{job.title}</h3>
                                                        <CircleBadge
                                                            level={getCircleLevel(job.job_type, job.is_urgent, job.is_featured)}
                                                            size="sm"
                                                        />
                                                        {job.is_urgent && (
                                                            <span className="text-xs bg-danger/10 text-danger px-2 py-0.5 rounded font-medium">
                                                                URGENT
                                                            </span>
                                                        )}
                                                        {job.is_featured && (
                                                            <span className="text-xs bg-primary/20 text-primary-dark px-2 py-0.5 rounded font-medium">
                                                                FEATURED
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-text-secondary">
                                                        {jobTypeConfig[job.job_type]?.label || job.job_type}
                                                    </p>
                                                    <p className="text-sm text-text-muted">
                                                        {job.location_city}, {job.location_state}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:items-end gap-2">
                                                <div className="text-right">
                                                    <p className="text-sm text-text-muted">
                                                        Posted {formatRelativeTime(job.posted_at)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-bold text-success">
                                                        {formatRate(job.hourly_rate)}
                                                    </span>
                                                    <Button variant="primary" size="sm">View</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            )}

            {/* Results summary */}
            {!isLoading && !error && filteredJobs.length > 0 && (
                <div className="mt-6 text-center text-sm text-text-muted">
                    Showing {filteredJobs.length} of {jobsData?.total || filteredJobs.length} jobs
                </div>
            )}
        </div>
    );
}
