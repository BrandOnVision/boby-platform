import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
const SORT_OPTIONS = [
    { id: 'newest', name: 'Newest First' },
    { id: 'oldest', name: 'Oldest First' },
    { id: 'rate_high', name: 'Highest Pay' },
    { id: 'rate_low', name: 'Lowest Pay' },
];
export function JobsPage() {
    const [selectedType, setSelectedType] = useState(undefined);
    const [selectedState, setSelectedState] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
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
    const jobTypeConfig = {
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
            jobs = jobs.filter(job => job.title.toLowerCase().includes(query) ||
                job.description?.toLowerCase().includes(query) ||
                job.location_city?.toLowerCase().includes(query));
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
                jobs = [...jobs].sort((a, b) => new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime());
                break;
            case 'rate_high':
                jobs = [...jobs].sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0));
                break;
            case 'rate_low':
                jobs = [...jobs].sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
                break;
            case 'newest':
            default:
                jobs = [...jobs].sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());
                break;
        }
        return jobs;
    }, [jobsData?.jobs, searchQuery, sortBy, showUrgentOnly, showFeaturedOnly]);
    // Map job type to circle level for visual representation
    const getCircleLevel = (jobType, isUrgent, isFeatured) => {
        if (isFeatured)
            return 'center';
        if (isUrgent)
            return 'inner';
        if (jobType === 'firm_contract' || jobType === 'bodyguard')
            return 'mid';
        return 'outer';
    };
    // Format hourly rate
    const formatRate = (rate) => {
        if (!rate)
            return 'Negotiable';
        return `${formatCurrency(rate)}/hr`;
    };
    // Get marker for job type
    const getJobMarker = (jobType) => {
        return jobTypeConfig[jobType]?.marker || 'JB';
    };
    // Active filter count
    const activeFilterCount = [
        showUrgentOnly,
        showFeaturedOnly,
        selectedState !== 'all',
        selectedType,
    ].filter(Boolean).length;
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-text-primary", children: "Available Jobs" }), _jsx("p", { className: "text-text-muted mt-1", children: isLoading ? 'Loading...' : `${filteredJobs.length} positions found` })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => refetch(), children: "Refresh" })] }), _jsx("div", { className: "mb-4", children: _jsx(Input, { placeholder: "Search jobs by title, description, or location...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full" }) }), _jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-4", children: [_jsx(Button, { variant: showFilters ? 'primary' : 'outline', size: "sm", onClick: () => setShowFilters(!showFilters), children: _jsxs("span", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-4 h-4 rounded bg-grey-300 text-[8px] font-bold flex items-center justify-center", children: "FT" }), "Filters", activeFilterCount > 0 && (_jsx("span", { className: "w-5 h-5 rounded-full bg-primary text-text-primary text-xs font-bold flex items-center justify-center", children: activeFilterCount }))] }) }), _jsx("button", { onClick: () => setShowUrgentOnly(!showUrgentOnly), className: `px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${showUrgentOnly
                            ? 'bg-danger/10 border-danger/30 text-danger'
                            : 'bg-grey-100 border-grey-300 text-text-muted hover:border-grey-400'}`, children: "Urgent Only" }), _jsx("button", { onClick: () => setShowFeaturedOnly(!showFeaturedOnly), className: `px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${showFeaturedOnly
                            ? 'bg-primary/20 border-primary/30 text-primary-dark'
                            : 'bg-grey-100 border-grey-300 text-text-muted hover:border-grey-400'}`, children: "Featured Only" }), _jsx("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), className: "ml-auto px-3 py-1.5 rounded-lg border border-grey-300 bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50", children: SORT_OPTIONS.map(option => (_jsx("option", { value: option.id, children: option.name }, option.id))) })] }), showFilters && (_jsxs(Card, { variant: "default", padding: "md", className: "mb-4", children: [_jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text-secondary mb-2", children: "Job Type" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { variant: !selectedType ? 'primary' : 'ghost', size: "sm", onClick: () => setSelectedType(undefined), children: "All Types" }), (typesData?.types || []).map((type) => (_jsx(Button, { variant: selectedType === type.id ? 'primary' : 'ghost', size: "sm", onClick: () => setSelectedType(type.id), children: type.name }, type.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text-secondary mb-2", children: "Location" }), _jsx("div", { className: "flex flex-wrap gap-2", children: STATES.map((state) => (_jsx(Button, { variant: selectedState === state.id ? 'primary' : 'ghost', size: "sm", onClick: () => setSelectedState(state.id), children: state.name }, state.id))) })] })] }), activeFilterCount > 0 && (_jsx("div", { className: "mt-4 pt-4 border-t border-grey-200", children: _jsx(Button, { variant: "ghost", size: "sm", onClick: () => {
                                setSelectedType(undefined);
                                setSelectedState('all');
                                setShowUrgentOnly(false);
                                setShowFeaturedOnly(false);
                                setSearchQuery('');
                            }, children: "Clear All Filters" }) }))] })), error && (_jsx(Card, { variant: "default", padding: "lg", className: "mb-4 border-danger/30", children: _jsxs(CardContent, { className: "text-center", children: [_jsx("div", { className: "w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center mx-auto mb-3", children: _jsx("span", { className: "text-sm font-bold text-danger", children: "ER" }) }), _jsx("p", { className: "text-danger mb-2", children: "Failed to load jobs" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => refetch(), children: "Try Again" })] }) })), isLoading && (_jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => (_jsx(Card, { variant: "default", padding: "none", className: "overflow-hidden animate-pulse", children: _jsx(CardContent, { className: "p-4 sm:p-6", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-grey-200" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-5 bg-grey-200 rounded w-1/3" }), _jsx("div", { className: "h-4 bg-grey-200 rounded w-1/4" })] })] }) }) }, i))) })), !isLoading && !error && (_jsx("div", { className: "space-y-4", children: filteredJobs.length === 0 ? (_jsx(Card, { variant: "default", padding: "lg", children: _jsxs(CardContent, { className: "text-center py-12", children: [_jsx("div", { className: "w-16 h-16 bg-grey-200 rounded-lg flex items-center justify-center mx-auto mb-4", children: _jsx("span", { className: "text-lg font-bold text-text-muted", children: "JB" }) }), _jsx("p", { className: "text-text-muted mb-2", children: "No jobs found matching your criteria" }), activeFilterCount > 0 && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                    setSelectedType(undefined);
                                    setSelectedState('all');
                                    setShowUrgentOnly(false);
                                    setShowFeaturedOnly(false);
                                    setSearchQuery('');
                                }, children: "Clear Filters" }))] }) })) : (filteredJobs.map((job) => (_jsx(Link, { to: `/jobs/${job.slug}`, className: "block", children: _jsx(Card, { variant: "default", padding: "none", className: "overflow-hidden hover:border-primary/50 transition-colors cursor-pointer", children: _jsx(CardContent, { className: "p-4 sm:p-6", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: `w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${job.is_featured ? 'bg-primary' :
                                                    job.is_urgent ? 'bg-danger/10' : 'bg-grey-200'}`, children: _jsx("span", { className: `text-sm font-bold ${job.is_featured ? 'text-text-primary' :
                                                        job.is_urgent ? 'text-danger' : 'text-text-muted'}`, children: getJobMarker(job.job_type) }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1 flex-wrap", children: [_jsx("h3", { className: "font-semibold text-text-primary", children: job.title }), _jsx(CircleBadge, { level: getCircleLevel(job.job_type, job.is_urgent, job.is_featured), size: "sm" }), job.is_urgent && (_jsx("span", { className: "text-xs bg-danger/10 text-danger px-2 py-0.5 rounded font-medium", children: "URGENT" })), job.is_featured && (_jsx("span", { className: "text-xs bg-primary/20 text-primary-dark px-2 py-0.5 rounded font-medium", children: "FEATURED" }))] }), _jsx("p", { className: "text-text-secondary", children: jobTypeConfig[job.job_type]?.label || job.job_type }), _jsxs("p", { className: "text-sm text-text-muted", children: [job.location_city, ", ", job.location_state] })] })] }), _jsxs("div", { className: "flex flex-col sm:items-end gap-2", children: [_jsx("div", { className: "text-right", children: _jsxs("p", { className: "text-sm text-text-muted", children: ["Posted ", formatRelativeTime(job.posted_at)] }) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-lg font-bold text-success", children: formatRate(job.hourly_rate) }), _jsx(Button, { variant: "primary", size: "sm", children: "View" })] })] })] }) }) }) }, job.id)))) })), !isLoading && !error && filteredJobs.length > 0 && (_jsxs("div", { className: "mt-6 text-center text-sm text-text-muted", children: ["Showing ", filteredJobs.length, " of ", jobsData?.total || filteredJobs.length, " jobs"] }))] }));
}
//# sourceMappingURL=JobsPage.js.map