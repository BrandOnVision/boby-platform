/**
 * Firm Portal - Post New Job Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Button, Input, Select, useToast } from '@boby/ui';
import { useAuth } from '../context/AuthContext';
import { jobsApi } from '../lib/api';

const JOB_TYPES = [
    { value: 'guard', label: 'Security Guard' },
    { value: 'security_driver', label: 'Security Driver' },
    { value: 'bodyguard', label: 'Close Protection / Bodyguard' },
    { value: 'locksmith', label: 'Locksmith' },
    { value: 'investigator', label: 'Private Investigator' },
    { value: 'neighbourhood_patrol', label: 'Neighbourhood Patrol' },
    { value: 'property_protection', label: 'Property Protection' },
    { value: 'firm_contract', label: 'Firm Contract Work' },
    { value: 'other', label: 'Other Security Service' },
];

const STATES = [
    { value: 'QLD', label: 'Queensland' },
    { value: 'NSW', label: 'New South Wales' },
    { value: 'VIC', label: 'Victoria' },
    { value: 'SA', label: 'South Australia' },
    { value: 'WA', label: 'Western Australia' },
    { value: 'NT', label: 'Northern Territory' },
    { value: 'TAS', label: 'Tasmania' },
    { value: 'ACT', label: 'Australian Capital Territory' },
];

const PAY_TYPES = [
    { value: 'hourly', label: 'Hourly Rate' },
    { value: 'daily', label: 'Daily Rate' },
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'negotiable', label: 'Negotiable' },
];

export default function NewJobPage() {
    const { firmId, firm } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        job_type: '',
        location_city: '',
        location_state: firm?.state || '',
        pay_type: 'hourly',
        pay_min: '',
        pay_max: '',
        requires_licence: true,
        is_urgent: false,
    });

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!firmId) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'No firm linked to your account. Please contact support.',
            });
            return;
        }

        // Validation
        if (!formData.title.trim()) {
            addToast({ type: 'error', title: 'Error', message: 'Job title is required' });
            return;
        }
        if (!formData.job_type) {
            addToast({ type: 'error', title: 'Error', message: 'Job type is required' });
            return;
        }
        if (!formData.location_city.trim()) {
            addToast({ type: 'error', title: 'Error', message: 'City is required' });
            return;
        }
        if (!formData.location_state) {
            addToast({ type: 'error', title: 'Error', message: 'State is required' });
            return;
        }
        if (!formData.description.trim()) {
            addToast({ type: 'error', title: 'Error', message: 'Description is required' });
            return;
        }

        setIsSubmitting(true);

        try {
            await jobsApi.create({
                title: formData.title.trim(),
                description: formData.description.trim(),
                job_type: formData.job_type,
                location_city: formData.location_city.trim(),
                location_state: formData.location_state,
                pay_type: formData.pay_type,
                pay_min: formData.pay_min ? parseFloat(formData.pay_min) : undefined,
                pay_max: formData.pay_max ? parseFloat(formData.pay_max) : undefined,
                requires_licence: formData.requires_licence,
                is_urgent: formData.is_urgent,
                firm_id: firmId,
            });

            addToast({
                type: 'success',
                title: 'Job Posted!',
                message: 'Your job listing is now live and visible to agents.',
            });

            // Navigate to jobs list
            navigate('/jobs');
        } catch (error) {
            console.error('Failed to post job:', error);
            addToast({
                type: 'error',
                title: 'Failed to Post Job',
                message: error instanceof Error ? error.message : 'Please try again',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check if firm is linked
    if (!firmId) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <span className="text-4xl mb-4 block">⚠️</span>
                            <h2 className="text-lg font-semibold text-amber-900">
                                Firm Required
                            </h2>
                            <p className="text-amber-700 mt-2">
                                You need to be linked to a firm to post jobs.
                                Please complete your firm setup or contact support.
                            </p>
                            <div className="mt-4 flex gap-3 justify-center">
                                <Button onClick={() => navigate('/')}>
                                    Go to Dashboard
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
                <p className="text-gray-500">
                    Fill in the details to find security personnel.
                    {firm && <span className="text-amber-600"> Posting as {firm.name}</span>}
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardContent className="p-6 space-y-6">
                        {/* Job Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Job Title *
                            </label>
                            <Input
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="e.g., Event Security Officer - Gold Coast"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Be specific to attract the right candidates
                            </p>
                        </div>

                        {/* Job Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Job Type *
                            </label>
                            <Select
                                options={JOB_TYPES}
                                value={formData.job_type}
                                onChange={(e) => handleChange('job_type', e.target.value)}
                                placeholder="Select job type"
                            />
                        </div>

                        {/* Location */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City *
                                </label>
                                <Input
                                    value={formData.location_city}
                                    onChange={(e) => handleChange('location_city', e.target.value)}
                                    placeholder="e.g., Brisbane"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State *
                                </label>
                                <Select
                                    options={STATES}
                                    value={formData.location_state}
                                    onChange={(e) => handleChange('location_state', e.target.value)}
                                    placeholder="Select state"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Job Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Describe the job requirements, duties, schedule, and any specific skills or experience needed..."
                                rows={6}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.description.length}/2000 characters
                            </p>
                        </div>

                        {/* Pay */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Compensation
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Select
                                    options={PAY_TYPES}
                                    value={formData.pay_type}
                                    onChange={(e) => handleChange('pay_type', e.target.value)}
                                />
                                <Input
                                    type="number"
                                    value={formData.pay_min}
                                    onChange={(e) => handleChange('pay_min', e.target.value)}
                                    placeholder="Min $ (optional)"
                                    min="0"
                                />
                                <Input
                                    type="number"
                                    value={formData.pay_max}
                                    onChange={(e) => handleChange('pay_max', e.target.value)}
                                    placeholder="Max $ (optional)"
                                    min="0"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Showing pay helps attract more qualified candidates
                            </p>
                        </div>

                        {/* Options */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.requires_licence}
                                    onChange={(e) => handleChange('requires_licence', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                                />
                                <span className="text-sm text-gray-700">
                                    Requires valid security licence
                                </span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_urgent}
                                    onChange={(e) => handleChange('is_urgent', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                                />
                                <div>
                                    <span className="text-sm text-gray-700">
                                        🔥 Mark as urgent
                                    </span>
                                    <p className="text-xs text-gray-500">
                                        Highlights the job and sends priority notifications
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/jobs')}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin mr-2">⏳</span>
                                        Posting...
                                    </>
                                ) : (
                                    'Post Job'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
