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
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [message, setMessage] = useState('');
    const [applySuccess, setApplySuccess] = useState(false);
    const [applyError, setApplyError] = useState('');

    // Fetch job details
    const { data: jobData, isLoading, error } = useQuery({
        queryKey: ['job', slug],
        queryFn: () => jobsApi.getBySlug(slug!),
        enabled: !!slug,
    });

    // Apply mutation
    const applyMutation = useMutation({
        mutationFn: (data: { message: string }) => {
            if (!jobData?.job?.id) throw new Error('Job ID not available');
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
        onError: (err: Error) => {
            setApplyError(err.message || 'Failed to submit application');
        },
    });

    const job = jobData?.job;

    // Job type display names
    const jobTypeLabels: Record<string, string> = {
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
    const getJobMarker = (type: string): string => {
        const markers: Record<string, string> = {
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
    const getCircleLevel = (jobType: string, isUrgent: boolean, isFeatured: boolean): 'center' | 'inner' | 'mid' | 'outer' | 'public' => {
        if (isFeatured) return 'center';
        if (isUrgent) return 'inner';
        if (jobType === 'firm_contract' || jobType === 'bodyguard') return 'mid';
        return 'outer';
    };

    const formatRate = (payType?: string, payMin?: number, payMax?: number): string => {
        if (!payMin && !payMax) return 'Negotiable';
        if (payMin && payMax) {
            return `${formatCurrency(payMin)} - ${formatCurrency(payMax)}/${payType === 'hourly' ? 'hr' : 'job'}`;
        }
        if (payMin) return `From ${formatCurrency(payMin)}/${payType === 'hourly' ? 'hr' : 'job'}`;
        if (payMax) return `Up to ${formatCurrency(payMax)}/${payType === 'hourly' ? 'hr' : 'job'}`;
        return 'Negotiable';
    };

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        applyMutation.mutate({ message });
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-grey-200 rounded w-1/4" />
                    <Card variant="default" padding="lg">
                        <CardContent>
                            <div className="space-y-4">
                                <div className="h-6 bg-grey-200 rounded w-1/2" />
                                <div className="h-4 bg-grey-200 rounded w-1/3" />
                                <div className="h-20 bg-grey-200 rounded" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card variant="default" padding="lg" className="text-center">
                    <CardContent>
                        <div className="w-16 h-16 bg-danger/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <span className="text-lg font-bold text-danger">ER</span>
                        </div>
                        <h2 className="text-xl font-bold text-text-primary mb-2">Job Not Found</h2>
                        <p className="text-text-muted mb-4">This job may have been removed or expired.</p>
                        <Button variant="primary" onClick={() => navigate('/jobs')}>
                            Back to Jobs
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Back link */}
            <Link
                to="/jobs"
                className="inline-flex items-center text-text-muted hover:text-text-primary mb-6 transition-colors"
            >
                <span className="mr-2">←</span> Back to Jobs
            </Link>

            {/* Job Header */}
            <Card variant="default" padding="lg" className="mb-6">
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center shrink-0">
                            <span className="text-xl font-bold text-text-primary">
                                {getJobMarker(job.job_type)}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                <h1 className="text-2xl font-bold text-text-primary">{job.title}</h1>
                                <CircleBadge
                                    level={getCircleLevel(job.job_type, job.is_urgent, job.is_featured)}
                                    size="sm"
                                />
                            </div>
                            <p className="text-text-secondary flex items-center gap-2">
                                <span className="inline-block w-4 h-4 rounded-full bg-grey-300" />
                                {job.location_city}, {job.location_state}
                                <span className="mx-2">•</span>
                                <span className="inline-block w-4 h-4 rounded-full bg-grey-300" />
                                {jobTypeLabels[job.job_type] || job.job_type}
                                <span className="mx-2">•</span>
                                <span className="inline-block w-4 h-4 rounded-full bg-grey-300" />
                                Posted {formatRelativeTime(job.posted_at)}
                            </p>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2 mt-4 flex-wrap">
                        {job.is_urgent && (
                            <span className="text-xs bg-danger/10 text-danger px-3 py-1 rounded-full font-medium">
                                URGENT
                            </span>
                        )}
                        {job.is_featured && (
                            <span className="text-xs bg-primary/20 text-primary-dark px-3 py-1 rounded-full font-medium">
                                FEATURED
                            </span>
                        )}
                        {job.requires_licence && (
                            <span className="text-xs bg-grey-200 text-text-secondary px-3 py-1 rounded-full">
                                Licence Required
                            </span>
                        )}
                        {job.requires_insurance && (
                            <span className="text-xs bg-grey-200 text-text-secondary px-3 py-1 rounded-full">
                                Insurance Required
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Pay & Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card variant="elevated" padding="md">
                    <CardContent className="text-center">
                        <p className="text-sm text-text-muted mb-1">Pay Rate</p>
                        <p className="text-xl font-bold text-success">
                            {formatRate(job.pay_type, job.pay_min, job.pay_max)}
                        </p>
                    </CardContent>
                </Card>
                <Card variant="default" padding="md">
                    <CardContent className="text-center">
                        <p className="text-sm text-text-muted mb-1">Views</p>
                        <p className="text-xl font-bold text-text-primary">{job.view_count || 0}</p>
                    </CardContent>
                </Card>
                <Card variant="default" padding="md">
                    <CardContent className="text-center">
                        <p className="text-sm text-text-muted mb-1">Applications</p>
                        <p className="text-xl font-bold text-text-primary">{job.enquiry_count || 0}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Description */}
            <Card variant="default" padding="lg" className="mb-6">
                <CardContent>
                    <h2 className="text-lg font-bold text-text-primary mb-4">Job Description</h2>
                    <div className="prose prose-sm max-w-none text-text-secondary whitespace-pre-wrap">
                        {job.description}
                    </div>
                </CardContent>
            </Card>

            {/* Requirements */}
            {(job.min_rank_level || job.experience_years) && (
                <Card variant="default" padding="lg" className="mb-6">
                    <CardContent>
                        <h2 className="text-lg font-bold text-text-primary mb-4">Requirements</h2>
                        <ul className="space-y-2 text-text-secondary">
                            {(job.min_rank_level ?? 0) > 0 && (
                                <li className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-xs font-bold text-primary-dark">RK</span>
                                    Minimum Rank Level: {job.min_rank_level}
                                </li>
                            )}
                            {job.experience_years && (
                                <li className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-xs font-bold text-primary-dark">XP</span>
                                    {job.experience_years}+ years experience
                                </li>
                            )}
                            {job.requires_licence && (
                                <li className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-xs font-bold text-primary-dark">SL</span>
                                    Valid Security Licence required
                                </li>
                            )}
                            {job.requires_insurance && (
                                <li className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-xs font-bold text-primary-dark">IN</span>
                                    Public liability insurance required
                                </li>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Apply Section */}
            <Card variant="elevated" padding="lg" className="border-2 border-primary/30">
                <CardContent>
                    {applySuccess ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-success">OK</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">Application Submitted</h3>
                            <p className="text-text-muted mb-4">
                                Your application has been sent. The poster will contact you if interested.
                            </p>
                            <Button variant="outline" onClick={() => navigate('/jobs')}>
                                Browse More Jobs
                            </Button>
                        </div>
                    ) : showApplyForm ? (
                        <form onSubmit={handleApply}>
                            <h3 className="text-lg font-bold text-text-primary mb-4">Apply for this Job</h3>

                            {applyError && (
                                <div className="bg-danger/10 text-danger px-4 py-3 rounded-lg mb-4">
                                    {applyError}
                                </div>
                            )}

                            <div className="mb-4">
                                <p className="text-sm text-text-muted mb-2">Applying as:</p>
                                <div className="flex items-center gap-3 p-3 bg-grey-100 rounded-lg">
                                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-text-primary">
                                            {user?.firstName?.[0]}{user?.lastName?.[0] || user?.email?.[0]}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-sm text-text-muted">{user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <Input
                                    label="Message (Optional)"
                                    placeholder="Introduce yourself and explain why you're a good fit..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                                <p className="text-xs text-text-muted mt-1">
                                    Your verified profile and credentials will be shared with the poster.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={applyMutation.isPending}
                                    className="flex-1"
                                >
                                    {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowApplyForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-text-primary">Interested in this job?</h3>
                                <p className="text-text-muted">
                                    Apply now and your verified profile will be shared with the poster.
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => setShowApplyForm(true)}
                            >
                                Apply Now
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
