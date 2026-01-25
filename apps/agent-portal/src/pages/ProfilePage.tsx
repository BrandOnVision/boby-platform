/**
 * Agent Portal Profile Page
 * 
 * Displays and allows editing of agent profile from API
 * Includes credentials section with API integration
 * Brand-compliant: Gold accents, 2-letter markers, no emojis
 */

import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardTitle, Input, CircleBadge } from '@boby/ui';
import { useAuth } from '../context/AuthContext';
import { profileApi, getToken } from '../lib/api';
import { useQuery } from '@tanstack/react-query';

// Credential status type
type CredentialStatus = 'verified' | 'pending' | 'expired' | 'not_submitted';

interface Credential {
    id: string;
    name: string;
    marker: string;
    status: CredentialStatus;
    expiryDate?: string;
    licenceNumber?: string;
    description?: string;
}

// API Base URL
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3000';

// Fetch agent account details
async function fetchAgentAccount() {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/membership/account`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });
    const data = await response.json();
    if (data.code !== 200) {
        throw new Error(data.message || 'Failed to fetch account');
    }
    return data.data;
}

export function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Fetch agent account data
    const { data: accountData, isLoading: isLoadingAccount } = useQuery({
        queryKey: ['agentAccount'],
        queryFn: fetchAgentAccount,
        staleTime: 60000, // 1 minute
    });

    // Form state
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    // Update form when user changes
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
            });
        }
    }, [user]);

    // Build credentials list from API data
    const buildCredentials = (): Credential[] => {
        const agentProfile = accountData?.agentProfile;
        const credentials: Credential[] = [];

        // Security Licence - from agent profile
        const licenceStatus: CredentialStatus = agentProfile?.is_licence_verified
            ? 'verified'
            : agentProfile?.licence_number
                ? 'pending'
                : 'not_submitted';

        const licenceExpiry = agentProfile?.licence_expiry;
        const isExpired = licenceExpiry && new Date(licenceExpiry) < new Date();

        credentials.push({
            id: 'security_licence',
            name: 'Security Licence',
            marker: 'SL',
            status: isExpired ? 'expired' : licenceStatus,
            expiryDate: licenceExpiry,
            licenceNumber: agentProfile?.licence_number,
            description: agentProfile?.licence_number
                ? `#${agentProfile.licence_number}`
                : 'Required for security work'
        });

        // Parse additional credentials from JSON field
        const additionalCreds = agentProfile?.credentials;
        if (additionalCreds && typeof additionalCreds === 'object') {
            // First Aid
            if (additionalCreds.first_aid) {
                credentials.push({
                    id: 'first_aid',
                    name: 'First Aid Certificate',
                    marker: 'FA',
                    status: additionalCreds.first_aid.verified ? 'verified' : 'pending',
                    expiryDate: additionalCreds.first_aid.expiry,
                    description: additionalCreds.first_aid.provider || 'CPR & First Aid'
                });
            } else {
                credentials.push({
                    id: 'first_aid',
                    name: 'First Aid Certificate',
                    marker: 'FA',
                    status: 'not_submitted',
                    description: 'CPR & First Aid'
                });
            }

            // RSA
            if (additionalCreds.rsa) {
                credentials.push({
                    id: 'rsa',
                    name: 'RSA (Responsible Service)',
                    marker: 'RS',
                    status: additionalCreds.rsa.verified ? 'verified' : 'pending',
                    expiryDate: additionalCreds.rsa.expiry,
                    description: 'Alcohol service certification'
                });
            } else {
                credentials.push({
                    id: 'rsa',
                    name: 'RSA (Responsible Service)',
                    marker: 'RS',
                    status: 'not_submitted',
                    description: 'Alcohol service certification'
                });
            }

            // Crowd Control
            if (additionalCreds.crowd_control) {
                credentials.push({
                    id: 'crowd_control',
                    name: 'Crowd Control',
                    marker: 'CC',
                    status: additionalCreds.crowd_control.verified ? 'verified' : 'pending',
                    expiryDate: additionalCreds.crowd_control.expiry,
                    description: 'Venue security qualification'
                });
            } else {
                credentials.push({
                    id: 'crowd_control',
                    name: 'Crowd Control',
                    marker: 'CC',
                    status: 'not_submitted',
                    description: 'Venue security qualification'
                });
            }
        } else {
            // Default credentials when no data
            credentials.push(
                { id: 'first_aid', name: 'First Aid Certificate', marker: 'FA', status: 'not_submitted', description: 'CPR & First Aid' },
                { id: 'rsa', name: 'RSA (Responsible Service)', marker: 'RS', status: 'not_submitted', description: 'Alcohol service certification' },
                { id: 'crowd_control', name: 'Crowd Control', marker: 'CC', status: 'not_submitted', description: 'Venue security qualification' }
            );
        }

        return credentials;
    };

    const credentials = buildCredentials();

    // Count credentials by status
    const verifiedCount = credentials.filter(c => c.status === 'verified').length;
    const totalCount = credentials.length;
    const progressPercent = (verifiedCount / totalCount) * 100;

    // Get initials for avatar
    const initials = user
        ? `${(user.firstName?.[0] || user.email?.[0] || 'A').toUpperCase()}${(user.lastName?.[0] || 'G').toUpperCase()}`
        : 'AG';

    // Get display name
    const displayName = user
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'Agent'
        : 'Agent';

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSaveMessage(null);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);

        try {
            await profileApi.update({
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
            });

            // Refresh user data
            await refreshUser();

            setSaveMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (error) {
            setSaveMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Failed to save profile'
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Determine circle level based on roles
    const getCircleLevel = (): 'center' | 'inner' | 'mid' | 'outer' | 'public' => {
        if (!user?.roles) return 'public';
        if (user.roles.includes('guard')) return 'center';
        if (user.roles.includes('special_agent')) return 'inner';
        if (user.roles.includes('peeler')) return 'mid';
        return 'outer';
    };

    // Get status styling
    const getStatusStyles = (status: CredentialStatus) => {
        switch (status) {
            case 'verified':
                return {
                    bg: 'bg-success/10',
                    border: 'border-success/30',
                    markerBg: 'bg-success/20',
                    markerText: 'text-success',
                    text: 'text-success',
                    label: 'Verified'
                };
            case 'pending':
                return {
                    bg: 'bg-warning/10',
                    border: 'border-warning/30',
                    markerBg: 'bg-warning/20',
                    markerText: 'text-warning',
                    text: 'text-warning',
                    label: 'Pending Review'
                };
            case 'expired':
                return {
                    bg: 'bg-danger/10',
                    border: 'border-danger/30',
                    markerBg: 'bg-danger/20',
                    markerText: 'text-danger',
                    text: 'text-danger',
                    label: 'Expired'
                };
            default:
                return {
                    bg: 'bg-grey-100',
                    border: 'border-grey-300',
                    markerBg: 'bg-grey-300',
                    markerText: 'text-text-muted',
                    text: 'text-text-muted',
                    label: 'Not Submitted'
                };
        }
    };

    // Format expiry date
    const formatExpiry = (date?: string) => {
        if (!date) return null;
        const d = new Date(date);
        const now = new Date();
        const daysUntil = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil < 0) {
            return { text: `Expired ${Math.abs(daysUntil)} days ago`, isUrgent: true };
        } else if (daysUntil < 30) {
            return { text: `Expires in ${daysUntil} days`, isUrgent: true };
        } else {
            return { text: `Expires ${d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}`, isUrgent: false };
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                    Profile
                </h1>
                <p className="text-text-muted mt-1">
                    Manage your account and credentials
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Profile card - 2-letter marker instead of emoji */}
                <Card variant="elevated" padding="lg" className="lg:col-span-1">
                    <CardContent className="text-center">
                        <div className="w-24 h-24 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
                            <span className="text-2xl font-bold text-text-primary">{initials}</span>
                        </div>
                        <h2 className="text-xl font-bold text-text-primary">{displayName}</h2>
                        <p className="text-text-muted mb-2">{user?.email}</p>

                        {/* TelePathCode display */}
                        {user?.telepathcode && (
                            <p className="text-xs font-mono text-primary-dark bg-primary/20 px-2 py-1 rounded inline-block mb-4">
                                {user.telepathcode}
                            </p>
                        )}

                        <div className="flex justify-center gap-2 mb-4">
                            <CircleBadge level={getCircleLevel()} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-grey-200">
                            <div>
                                <p className="text-2xl font-bold text-text-primary">{accountData?.trustScore || 94}</p>
                                <p className="text-sm text-text-muted">Trust Score</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text-primary">{accountData?.agentProfile?.total_referrals || 0}</p>
                                <p className="text-sm text-text-muted">Referrals</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details form */}
                <Card variant="default" padding="lg" className="lg:col-span-2">
                    <CardTitle className="mb-6">Personal Information</CardTitle>

                    {/* Save message */}
                    {saveMessage && (
                        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${saveMessage.type === 'success'
                            ? 'bg-success/10 border border-success/30'
                            : 'bg-danger/10 border border-danger/30'
                            }`}>
                            <span className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${saveMessage.type === 'success'
                                ? 'bg-success/20 text-success'
                                : 'bg-danger/20 text-danger'
                                }`}>
                                {saveMessage.type === 'success' ? 'OK' : 'ER'}
                            </span>
                            <span className={saveMessage.type === 'success' ? 'text-success' : 'text-danger'}>
                                {saveMessage.text}
                            </span>
                        </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                        />
                        <Input
                            label="Last Name"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            disabled
                            className="opacity-60"
                        />
                        <Input
                            label="Phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end mt-6">
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </Card>

                {/* Credentials Section - Enhanced Design */}
                <Card variant="default" padding="lg" className="lg:col-span-3">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <CardTitle>Credentials & Certifications</CardTitle>
                            <p className="text-sm text-text-muted mt-1">
                                {verifiedCount} of {totalCount} verified
                            </p>
                        </div>
                        {/* Progress indicator */}
                        <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-grey-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-success rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium text-text-primary">
                                {Math.round(progressPercent)}%
                            </span>
                        </div>
                    </div>

                    {isLoadingAccount ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="animate-pulse p-4 rounded-lg bg-grey-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-grey-200 rounded-lg" />
                                        <div className="flex-1">
                                            <div className="h-4 bg-grey-200 rounded w-3/4 mb-2" />
                                            <div className="h-3 bg-grey-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {credentials.map((cred) => {
                                const styles = getStatusStyles(cred.status);
                                const expiry = formatExpiry(cred.expiryDate);

                                return (
                                    <div
                                        key={cred.id}
                                        className={`flex items-start gap-4 p-4 rounded-lg border-2 ${styles.bg} ${styles.border} transition-all hover:shadow-md`}
                                    >
                                        {/* 2-letter marker */}
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${styles.markerBg}`}>
                                            <span className={`text-sm font-bold ${styles.markerText}`}>
                                                {cred.marker}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className="font-semibold text-text-primary">{cred.name}</p>
                                                    <p className="text-sm text-text-muted">{cred.description}</p>
                                                </div>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${styles.markerBg} ${styles.markerText}`}>
                                                    {styles.label}
                                                </span>
                                            </div>
                                            {expiry && (
                                                <p className={`text-xs mt-2 ${expiry.isUrgent ? 'text-danger font-medium' : 'text-text-muted'}`}>
                                                    {expiry.text}
                                                </p>
                                            )}
                                            {cred.status === 'not_submitted' && (
                                                <Button variant="outline" size="sm" className="mt-3">
                                                    Upload
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Add credential hint */}
                    <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary-dark">TIP</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text-primary">Complete your credentials</p>
                                <p className="text-xs text-text-muted">More verified credentials unlock higher-paying jobs and priority matching.</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

