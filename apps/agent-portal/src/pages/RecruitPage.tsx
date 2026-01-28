/**
 * Recruit Peelers Page
 * 
 * Allows agents to:
 * - View their sponsor code
 * - Send email invitations
 * - Copy their signup link
 * - View pending invitations
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getToken } from '../lib/api';
import { Card, Button, Input } from '@boby/ui';

interface PendingInvitation {
    id: string;
    recipient_email: string;
    recipient_name: string | null;
    status: string;
    expires_at: string;
    created_at: string;
}

interface InvitationStats {
    invitations: Array<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        created_at: string;
    }>;
    total: number;
    sponsorCode: string;
}

export function RecruitPage() {
    const { user } = useAuth();
    const [sponsorCode, setSponsorCode] = useState('');
    const [signupLink, setSignupLink] = useState('');
    const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
    const [acceptedInvitations, setAcceptedInvitations] = useState<InvitationStats['invitations']>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const API_BASE = import.meta.env.VITE_API_URL || 'https://api.getboby.ai';
    const baseUrl = 'https://getboby.ai';

    // Fetch sponsor code and invitations
    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        const token = getToken();
        if (!token) return;

        try {
            // Get invitation stats (includes sponsor code)
            const statsResponse = await fetch(`${API_BASE}/api/membership/invitations`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const statsData = await statsResponse.json();

            if (statsData.code === 200 && statsData.data) {
                setSponsorCode(statsData.data.sponsorCode || user?.sponsorCode || '');
                setAcceptedInvitations(statsData.data.invitations || []);
            } else if (user?.sponsorCode) {
                setSponsorCode(user.sponsorCode);
            }

            // Get pending invitations
            const pendingResponse = await fetch(`${API_BASE}/api/membership/pending-invitations`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const pendingData = await pendingResponse.json();

            if (pendingData.code === 200 && pendingData.data) {
                setPendingInvitations(pendingData.data.invitations || []);
            }
        } catch (error) {
            console.error('Error fetching recruitment data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Update signup link when sponsor code changes
    useEffect(() => {
        if (sponsorCode) {
            setSignupLink(`${baseUrl}/membership-portal.html#register?sponsor=${sponsorCode}`);
        }
    }, [sponsorCode]);

    const copyToClipboard = async (text: string, type: 'code' | 'link') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'code') {
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
            } else {
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
            }
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const sendInvitation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsSending(true);
        setMessage(null);

        try {
            const token = getToken();
            const response = await fetch(`${API_BASE}/api/membership/send-invitation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    name: name.trim() || undefined,
                }),
            });

            const data = await response.json();

            if (data.code === 200) {
                setMessage({
                    type: 'success',
                    text: data.data?.sent
                        ? 'Invitation sent successfully!'
                        : 'Invitation created! Share the link manually.',
                });
                setEmail('');
                setName('');
                // Refresh pending invitations
                fetchData();
            } else {
                setMessage({
                    type: 'error',
                    text: data.message || 'Failed to send invitation',
                });
            }
        } catch (error) {
            console.error('Send invitation error:', error);
            setMessage({
                type: 'error',
                text: 'Failed to send invitation. Please try again.',
            });
        } finally {
            setIsSending(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <div className="p-4 lg:p-6 space-y-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-grey-200 rounded w-48" />
                    <div className="h-32 bg-grey-200 rounded" />
                    <div className="h-48 bg-grey-200 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 space-y-6 max-w-4xl">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Recruit Peelers</h1>
                <p className="text-text-muted mt-1">
                    Invite new members to join BOBY. You earn commissions when your recruits purchase products or services.
                </p>
            </div>

            {/* Sponsor Code Card */}
            <Card className="p-6 bg-primary/10 border-primary/30">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Your Sponsor Code</h2>
                <div className="flex items-center gap-3">
                    <code className="flex-1 bg-white px-4 py-3 rounded-lg font-mono text-lg font-bold text-text-primary border border-grey-300">
                        {sponsorCode || 'Loading...'}
                    </code>
                    <Button
                        onClick={() => copyToClipboard(sponsorCode, 'code')}
                        disabled={!sponsorCode}
                        className="shrink-0"
                    >
                        {copiedCode ? 'Copied!' : 'Copy'}
                    </Button>
                </div>
                <p className="text-sm text-text-muted mt-3">
                    Share this code with potential new members. When they sign up using your code, you'll earn commissions on their purchases.
                </p>
            </Card>

            {/* Send Invitation Form */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Send Invitation</h2>
                <form onSubmit={sendInvitation} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Email Address
                        </label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Name <span className="text-text-muted">(Optional)</span>
                        </label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter their name"
                        />
                    </div>

                    {message && (
                        <div
                            className={`p-3 rounded-lg text-sm ${message.type === 'success'
                                ? 'bg-success/10 text-success border border-success/30'
                                : 'bg-danger/10 text-danger border border-danger/30'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <Button type="submit" disabled={isSending || !email.trim()} className="w-full">
                        {isSending ? 'Sending...' : 'Send Invitation'}
                    </Button>
                </form>
            </Card>

            {/* Personal Signup Link */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Your Personal Signup Link</h2>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={signupLink}
                        readOnly
                        className="flex-1 bg-grey-100 px-4 py-3 rounded-lg text-sm text-text-primary border border-grey-300 truncate"
                    />
                    <Button
                        onClick={() => copyToClipboard(signupLink, 'link')}
                        disabled={!signupLink}
                        className="shrink-0"
                    >
                        {copiedLink ? 'Copied!' : 'Copy Link'}
                    </Button>
                </div>
                <p className="text-sm text-text-muted mt-3">
                    Anyone who signs up using this link will automatically be linked to you as their sponsor.
                </p>
            </Card>

            {/* Pending Invitations */}
            {pendingInvitations.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">Pending Invitations</h2>
                    <div className="space-y-3">
                        {pendingInvitations.map((invitation) => (
                            <div
                                key={invitation.id}
                                className="flex items-center justify-between p-4 bg-grey-100 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                                        <span className="text-sm font-bold text-warning">
                                            {(invitation.recipient_name?.[0] || invitation.recipient_email[0]).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary">
                                            {invitation.recipient_name || 'No name provided'}
                                        </p>
                                        <p className="text-sm text-text-muted">{invitation.recipient_email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-2 py-1 text-xs font-medium bg-warning/20 text-warning rounded">
                                        Pending
                                    </span>
                                    <p className="text-xs text-text-muted mt-1">
                                        Sent {formatDate(invitation.created_at)} • Expires {formatDate(invitation.expires_at)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Accepted Invitations / Your Team */}
            {acceptedInvitations.length > 0 && (
                <Card className="p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">
                        Your Team ({acceptedInvitations.length} member{acceptedInvitations.length !== 1 ? 's' : ''})
                    </h2>
                    <div className="space-y-3">
                        {acceptedInvitations.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-4 bg-grey-100 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                                        <span className="text-sm font-bold text-success">
                                            {(member.first_name?.[0] || member.email[0]).toUpperCase()}
                                            {(member.last_name?.[0] || '').toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary">
                                            {member.first_name} {member.last_name}
                                        </p>
                                        <p className="text-sm text-text-muted">{member.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="inline-block px-2 py-1 text-xs font-medium bg-success/20 text-success rounded">
                                        Active
                                    </span>
                                    <p className="text-xs text-text-muted mt-1">
                                        Joined {formatDate(member.created_at)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Empty State */}
            {pendingInvitations.length === 0 && acceptedInvitations.length === 0 && (
                <Card className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-grey-200 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold text-text-muted">RP</span>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">No Referrals Yet</h3>
                    <p className="text-text-muted mb-4">
                        Start inviting people to build your team and earn commissions!
                    </p>
                </Card>
            )}
        </div>
    );
}
