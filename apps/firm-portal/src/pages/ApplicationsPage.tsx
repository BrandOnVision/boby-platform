/**
 * Firm Portal - Applications Page
 * View and manage job applications/enquiries
 */

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, Button, StatusBadge, getStatusType, EmptyState, Skeleton, useToast } from '@boby/ui';
import { useAuth } from '../context/AuthContext';
import { jobsApi, JobEnquiry, Job } from '../lib/api';

export default function ApplicationsPage() {
    const { firmId } = useAuth();
    const [searchParams] = useSearchParams();
    const jobId = searchParams.get('job');
    const { addToast } = useToast();

    const [job, setJob] = useState<Job | null>(null);
    const [enquiries, setEnquiries] = useState<JobEnquiry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const loadEnquiries = useCallback(async () => {
        if (!jobId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Load job details
            const jobData = await jobsApi.getById(jobId);
            setJob(jobData);

            // Load enquiries
            const data = await jobsApi.getEnquiries(jobId);
            setEnquiries(data.enquiries);
        } catch (error) {
            console.error('Failed to load enquiries:', error);
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to load applications',
            });
        } finally {
            setIsLoading(false);
        }
    }, [jobId, addToast]);

    useEffect(() => {
        loadEnquiries();
    }, [loadEnquiries]);

    const handleUpdateStatus = async (enquiryId: string, status: 'hired' | 'declined') => {
        setUpdatingId(enquiryId);
        try {
            const result = await jobsApi.updateEnquiryStatus(enquiryId, status);

            if (result.success) {
                // Update local state
                setEnquiries(prev =>
                    prev.map(e =>
                        e.id === enquiryId ? { ...e, status } : e
                    )
                );

                addToast({
                    type: 'success',
                    title: status === 'hired' ? 'Applicant Hired' : 'Application Declined',
                    message: status === 'hired'
                        ? 'The applicant has been notified and can be contacted.'
                        : 'The applicant has been informed of your decision.',
                });
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to update application status',
            });
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusLabel = (status: string): string => {
        const labels: Record<string, string> = {
            new: 'New',
            viewed: 'Viewed',
            responded: 'Responded',
            hired: 'Hired',
            declined: 'Declined',
        };
        return labels[status] || status;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Link to="/jobs" className="text-gray-500 hover:text-gray-700">
                        Jobs
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900">Applications</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {job ? `Applications for "${job.title}"` : 'Applications'}
                </h1>
                <p className="text-gray-500">
                    {job
                        ? `${enquiries.length} application${enquiries.length !== 1 ? 's' : ''} received`
                        : 'Select a job to view its applications'
                    }
                </p>
            </div>

            {/* Job Info Card */}
            {job && (
                <Card className="bg-gray-50">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                                    <StatusBadge type={getStatusType(job.status)} size="sm">
                                        {job.status}
                                    </StatusBadge>
                                </div>
                                <p className="text-sm text-gray-500">
                                    📍 {job.location_city}, {job.location_state} •
                                    📁 {job.job_type.replace(/_/g, ' ')} •
                                    👁 {job.view_count || 0} views
                                </p>
                            </div>
                            <Link to={`/jobs`}>
                                <Button variant="outline" size="sm">
                                    ← Back to Jobs
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton height="3rem" width="3rem" rounded="full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton height="1.25rem" width="50%" />
                                        <Skeleton height="1rem" width="80%" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : !jobId ? (
                <Card>
                    <CardContent className="p-8">
                        <EmptyState
                            icon="📋"
                            title="Select a Job"
                            description="Go to Jobs page and click 'View' on a job to see its applications."
                            action={
                                <Link to="/jobs">
                                    <Button>View Jobs</Button>
                                </Link>
                            }
                        />
                    </CardContent>
                </Card>
            ) : enquiries.length === 0 ? (
                <Card>
                    <CardContent className="p-8">
                        <EmptyState
                            icon="📭"
                            title="No Applications Yet"
                            description="This job hasn't received any applications yet. Make sure your job is active and the description is compelling."
                            action={
                                <Link to={`/jobs`}>
                                    <Button variant="outline">Back to Jobs</Button>
                                </Link>
                            }
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {enquiries.map((enquiry) => (
                        <Card key={enquiry.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {/* Applicant Info */}
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg shrink-0">
                                            👤
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-gray-900">
                                                    {enquiry.enquirer_name || 'Anonymous Applicant'}
                                                </h3>
                                                <StatusBadge type={getStatusType(enquiry.status)} size="sm">
                                                    {getStatusLabel(enquiry.status)}
                                                </StatusBadge>
                                            </div>

                                            {enquiry.enquirer_email && (
                                                <a
                                                    href={`mailto:${enquiry.enquirer_email}`}
                                                    className="text-sm text-amber-600 hover:underline"
                                                >
                                                    {enquiry.enquirer_email}
                                                </a>
                                            )}

                                            {enquiry.enquirer_phone && (
                                                <a
                                                    href={`tel:${enquiry.enquirer_phone}`}
                                                    className="text-sm text-gray-500 ml-2"
                                                >
                                                    📞 {enquiry.enquirer_phone}
                                                </a>
                                            )}

                                            {enquiry.agent_profile && (
                                                <div className="flex gap-4 mt-1 text-sm text-gray-600">
                                                    <span>⭐ Trust: {Math.round(enquiry.agent_profile.trust_score * 100)}%</span>
                                                    {enquiry.agent_profile.experience_years > 0 && (
                                                        <span>📅 {enquiry.agent_profile.experience_years}+ years</span>
                                                    )}
                                                    {enquiry.agent_profile.has_licence && (
                                                        <span className="text-green-600">✓ Licensed</span>
                                                    )}
                                                </div>
                                            )}

                                            {enquiry.message && (
                                                <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                    "{enquiry.message}"
                                                </p>
                                            )}

                                            <p className="text-xs text-gray-400 mt-2">
                                                Applied {new Date(enquiry.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {(enquiry.status === 'new' || enquiry.status === 'viewed') && (
                                        <div className="flex sm:flex-col gap-2 shrink-0">
                                            <Button
                                                size="sm"
                                                onClick={() => handleUpdateStatus(enquiry.id, 'hired')}
                                                disabled={updatingId === enquiry.id}
                                            >
                                                {updatingId === enquiry.id ? '...' : '✓ Hire'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleUpdateStatus(enquiry.id, 'declined')}
                                                disabled={updatingId === enquiry.id}
                                            >
                                                {updatingId === enquiry.id ? '...' : '✗ Decline'}
                                            </Button>
                                            {enquiry.enquirer_email && (
                                                <a href={`mailto:${enquiry.enquirer_email}`}>
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        ✉️ Email
                                                    </Button>
                                                </a>
                                            )}
                                        </div>
                                    )}

                                    {enquiry.status === 'hired' && (
                                        <div className="text-center sm:text-right">
                                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                ✓ Hired
                                            </span>
                                        </div>
                                    )}

                                    {enquiry.status === 'declined' && (
                                        <div className="text-center sm:text-right">
                                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
                                                Declined
                                            </span>
                                        </div>
                                    )}
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
                            ⚠️ You need to be linked to a firm to view applications.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
