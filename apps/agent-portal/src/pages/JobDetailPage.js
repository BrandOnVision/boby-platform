import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Agent Portal Job Detail Page
 *
 * Displays full job details and application form
 * Brand-compliant: Gold accents, 2-letter markers, no emojis
 */
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, CardContent, CircleBadge, Input } from '@boby/ui';
import { useAuth } from '../context/AuthContext';
import { jobsApi } from '../lib/api';
import { formatCurrency, formatRelativeTime } from '../hooks/useApi';
import { useQuery, useMutation } from '@tanstack/react-query';
export function JobDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [message, setMessage] = useState('');
    const [applySuccess, setApplySuccess] = useState(false);
    const [applyError, setApplyError] = useState('');
    // Fetch job details
    const { data: jobData, isLoading, error } = useQuery({
        queryKey: ['job', slug],
        queryFn: () => jobsApi.getBySlug(slug),
        enabled: !!slug,
    });
    // Apply mutation
    const applyMutation = useMutation({
        mutationFn: (data) => {
            if (!jobData?.job?.id)
                throw new Error('Job ID not available');
            return jobsApi.enquire(jobData.job.id, {
                enquirer_type: 'agent',
                enquirer_id: user?.id,
                enquirer_email: user?.email,
                enquirer_name: `${user?.firstName} ${user?.lastName}`.trim(),
                message: data.message,
            });
        },
        onSuccess: () => {
            setApplySuccess(true);
            setShowApplyForm(false);
            setApplyError('');
        },
        onError: (err) => {
            setApplyError(err.message || 'Failed to submit application');
        },
    });
    const job = jobData?.job;
    // Job type display names
    const jobTypeLabels = {
        'guard': 'Security Guard',
        'security_driver': 'Security Driver',
        'bodyguard': 'Bodyguard',
        'locksmith': 'Locksmith',
        'investigator': 'Investigator',
        'firm_contract': 'Firm Contract',
        'neighbourhood_patrol': 'Neighbourhood Patrol',
        'property_protection': 'Property Protection',
        'private_investigator': 'Private Investigator',
        'other': 'Other',
    };
    // 2-letter marker for job type
    const getJobMarker = (type) => {
        const markers = {
            'security_driver': 'SD',
            'bodyguard': 'BG',
            'locksmith': 'LK',
            'investigator': 'PI',
            'guard': 'SG',
            'firm_contract': 'FC',
            'neighbourhood_patrol': 'NP',
            'property_protection': 'PP',
            'private_investigator': 'PI',
            'other': 'OT',
        };
        return markers[type] || 'JB';
    };
    // Circle level based on job type
    const getCircleLevel = (jobType, isUrgent, isFeatured) => {
        if (isFeatured)
            return 'center';
        if (isUrgent)
            return 'inner';
        if (jobType === 'firm_contract' || jobType === 'bodyguard')
            return 'mid';
        return 'outer';
    };
    const formatRate = (payType, payMin, payMax) => {
        if (!payMin && !payMax)
            return 'Negotiable';
        if (payMin && payMax) {
            return `${formatCurrency(payMin)} - ${formatCurrency(payMax)}/${payType === 'hourly' ? 'hr' : 'job'}`;
        }
        if (payMin)
            return `From ${formatCurrency(payMin)}/${payType === 'hourly' ? 'hr' : 'job'}`;
        if (payMax)
            return `Up to ${formatCurrency(payMax)}/${payType === 'hourly' ? 'hr' : 'job'}`;
        return 'Negotiable';
    };
    const handleApply = (e) => {
        e.preventDefault();
        applyMutation.mutate({ message });
    };
    if (isLoading) {
        return (_jsx("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsxs("div", { className: "animate-pulse space-y-4", children: [_jsx("div", { className: "h-8 bg-grey-200 rounded w-1/4" }), _jsx(Card, { variant: "default", padding: "lg", children: _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "h-6 bg-grey-200 rounded w-1/2" }), _jsx("div", { className: "h-4 bg-grey-200 rounded w-1/3" }), _jsx("div", { className: "h-20 bg-grey-200 rounded" })] }) }) })] }) }));
    }
    if (error || !job) {
        return (_jsx("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsx(Card, { variant: "default", padding: "lg", className: "text-center", children: _jsxs(CardContent, { children: [_jsx("div", { className: "w-16 h-16 bg-danger/10 rounded-lg flex items-center justify-center mx-auto mb-4", children: _jsx("span", { className: "text-lg font-bold text-danger", children: "ER" }) }), _jsx("h2", { className: "text-xl font-bold text-text-primary mb-2", children: "Job Not Found" }), _jsx("p", { className: "text-text-muted mb-4", children: "This job may have been removed or expired." }), _jsx(Button, { variant: "primary", onClick: () => navigate('/jobs'), children: "Back to Jobs" })] }) }) }));
    }
    return (_jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in", children: [_jsxs(Link, { to: "/jobs", className: "inline-flex items-center text-text-muted hover:text-text-primary mb-6 transition-colors", children: [_jsx("span", { className: "mr-2", children: "\u2190" }), " Back to Jobs"] }), _jsx(Card, { variant: "default", padding: "lg", className: "mb-6", children: _jsxs(CardContent, { children: [_jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsx("div", { className: "w-16 h-16 rounded-lg bg-primary flex items-center justify-center shrink-0", children: _jsx("span", { className: "text-xl font-bold text-text-primary", children: getJobMarker(job.job_type) }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-2", children: [_jsx("h1", { className: "text-2xl font-bold text-text-primary", children: job.title }), _jsx(CircleBadge, { level: getCircleLevel(job.job_type, job.is_urgent, job.is_featured), size: "sm" })] }), _jsxs("p", { className: "text-text-secondary flex items-center gap-2", children: [_jsx("span", { className: "inline-block w-4 h-4 rounded-full bg-grey-300" }), job.location_city, ", ", job.location_state, _jsx("span", { className: "mx-2", children: "\u2022" }), _jsx("span", { className: "inline-block w-4 h-4 rounded-full bg-grey-300" }), jobTypeLabels[job.job_type] || job.job_type, _jsx("span", { className: "mx-2", children: "\u2022" }), _jsx("span", { className: "inline-block w-4 h-4 rounded-full bg-grey-300" }), "Posted ", formatRelativeTime(job.posted_at)] })] })] }), _jsxs("div", { className: "flex gap-2 mt-4 flex-wrap", children: [job.is_urgent && (_jsx("span", { className: "text-xs bg-danger/10 text-danger px-3 py-1 rounded-full font-medium", children: "URGENT" })), job.is_featured && (_jsx("span", { className: "text-xs bg-primary/20 text-primary-dark px-3 py-1 rounded-full font-medium", children: "FEATURED" })), job.requires_licence && (_jsx("span", { className: "text-xs bg-grey-200 text-text-secondary px-3 py-1 rounded-full", children: "Licence Required" })), job.requires_insurance && (_jsx("span", { className: "text-xs bg-grey-200 text-text-secondary px-3 py-1 rounded-full", children: "Insurance Required" }))] })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [_jsx(Card, { variant: "elevated", padding: "md", children: _jsxs(CardContent, { className: "text-center", children: [_jsx("p", { className: "text-sm text-text-muted mb-1", children: "Pay Rate" }), _jsx("p", { className: "text-xl font-bold text-success", children: formatRate(job.pay_type, job.pay_min, job.pay_max) })] }) }), _jsx(Card, { variant: "default", padding: "md", children: _jsxs(CardContent, { className: "text-center", children: [_jsx("p", { className: "text-sm text-text-muted mb-1", children: "Views" }), _jsx("p", { className: "text-xl font-bold text-text-primary", children: job.view_count || 0 })] }) }), _jsx(Card, { variant: "default", padding: "md", children: _jsxs(CardContent, { className: "text-center", children: [_jsx("p", { className: "text-sm text-text-muted mb-1", children: "Applications" }), _jsx("p", { className: "text-xl font-bold text-text-primary", children: job.enquiry_count || 0 })] }) })] }), _jsx(Card, { variant: "default", padding: "lg", className: "mb-6", children: _jsxs(CardContent, { children: [_jsx("h2", { className: "text-lg font-bold text-text-primary mb-4", children: "Job Description" }), _jsx("div", { className: "prose prose-sm max-w-none text-text-secondary whitespace-pre-wrap", children: job.description })] }) }), (job.min_rank_level || job.experience_years) && (_jsx(Card, { variant: "default", padding: "lg", className: "mb-6", children: _jsxs(CardContent, { children: [_jsx("h2", { className: "text-lg font-bold text-text-primary mb-4", children: "Requirements" }), _jsxs("ul", { className: "space-y-2 text-text-secondary", children: [(job.min_rank_level ?? 0) > 0 && (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-xs font-bold text-primary-dark", children: "RK" }), "Minimum Rank Level: ", job.min_rank_level] })), job.experience_years && (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-xs font-bold text-primary-dark", children: "XP" }), job.experience_years, "+ years experience"] })), job.requires_licence && (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-xs font-bold text-primary-dark", children: "SL" }), "Valid Security Licence required"] })), job.requires_insurance && (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-xs font-bold text-primary-dark", children: "IN" }), "Public liability insurance required"] }))] })] }) })), _jsx(Card, { variant: "elevated", padding: "lg", className: "border-2 border-primary/30", children: _jsx(CardContent, { children: applySuccess ? (_jsxs("div", { className: "text-center py-4", children: [_jsx("div", { className: "w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("span", { className: "text-2xl font-bold text-success", children: "OK" }) }), _jsx("h3", { className: "text-xl font-bold text-text-primary mb-2", children: "Application Submitted" }), _jsx("p", { className: "text-text-muted mb-4", children: "Your application has been sent. The poster will contact you if interested." }), _jsx(Button, { variant: "outline", onClick: () => navigate('/jobs'), children: "Browse More Jobs" })] })) : showApplyForm ? (_jsxs("form", { onSubmit: handleApply, children: [_jsx("h3", { className: "text-lg font-bold text-text-primary mb-4", children: "Apply for this Job" }), applyError && (_jsx("div", { className: "bg-danger/10 text-danger px-4 py-3 rounded-lg mb-4", children: applyError })), _jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "text-sm text-text-muted mb-2", children: "Applying as:" }), _jsxs("div", { className: "flex items-center gap-3 p-3 bg-grey-100 rounded-lg", children: [_jsx("div", { className: "w-10 h-10 bg-primary rounded-full flex items-center justify-center", children: _jsxs("span", { className: "text-sm font-bold text-text-primary", children: [user?.firstName?.[0], user?.lastName?.[0] || user?.email?.[0]] }) }), _jsxs("div", { children: [_jsxs("p", { className: "font-medium text-text-primary", children: [user?.firstName, " ", user?.lastName] }), _jsx("p", { className: "text-sm text-text-muted", children: user?.email })] })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx(Input, { label: "Message (Optional)", placeholder: "Introduce yourself and explain why you're a good fit...", value: message, onChange: (e) => setMessage(e.target.value) }), _jsx("p", { className: "text-xs text-text-muted mt-1", children: "Your verified profile and credentials will be shared with the poster." })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { type: "submit", variant: "primary", disabled: applyMutation.isPending, className: "flex-1", children: applyMutation.isPending ? 'Submitting...' : 'Submit Application' }), _jsx(Button, { type: "button", variant: "outline", onClick: () => setShowApplyForm(false), children: "Cancel" })] })] })) : (_jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-bold text-text-primary", children: "Interested in this job?" }), _jsx("p", { className: "text-text-muted", children: "Apply now and your verified profile will be shared with the poster." })] }), _jsx(Button, { variant: "primary", size: "lg", onClick: () => setShowApplyForm(true), children: "Apply Now" })] })) }) })] }));
}
//# sourceMappingURL=JobDetailPage.js.map