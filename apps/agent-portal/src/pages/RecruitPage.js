import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export function RecruitPage() {
    const { user } = useAuth();
    const [sponsorCode, setSponsorCode] = useState('');
    const [signupLink, setSignupLink] = useState('');
    const [pendingInvitations, setPendingInvitations] = useState([]);
    const [acceptedInvitations, setAcceptedInvitations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [message, setMessage] = useState(null);
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
        if (!token)
            return;
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
            }
            else if (user?.sponsorCode) {
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
        }
        catch (error) {
            console.error('Error fetching recruitment data:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    // Update signup link when sponsor code changes
    useEffect(() => {
        if (sponsorCode) {
            setSignupLink(`${baseUrl}/membership-portal.html#register?sponsor=${sponsorCode}`);
        }
    }, [sponsorCode]);
    const copyToClipboard = async (text, type) => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'code') {
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
            }
            else {
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
            }
        }
        catch (error) {
            console.error('Failed to copy:', error);
        }
    };
    const sendInvitation = async (e) => {
        e.preventDefault();
        if (!email.trim())
            return;
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
            }
            else {
                setMessage({
                    type: 'error',
                    text: data.message || 'Failed to send invitation',
                });
            }
        }
        catch (error) {
            console.error('Send invitation error:', error);
            setMessage({
                type: 'error',
                text: 'Failed to send invitation. Please try again.',
            });
        }
        finally {
            setIsSending(false);
        }
    };
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };
    if (isLoading) {
        return (_jsx("div", { className: "p-4 lg:p-6 space-y-6", children: _jsxs("div", { className: "animate-pulse space-y-4", children: [_jsx("div", { className: "h-8 bg-grey-200 rounded w-48" }), _jsx("div", { className: "h-32 bg-grey-200 rounded" }), _jsx("div", { className: "h-48 bg-grey-200 rounded" })] }) }));
    }
    return (_jsxs("div", { className: "p-4 lg:p-6 space-y-6 max-w-4xl", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-text-primary", children: "Recruit Peelers" }), _jsx("p", { className: "text-text-muted mt-1", children: "Invite new members to join BOBY. You earn commissions when your recruits purchase products or services." })] }), _jsxs(Card, { className: "p-6 bg-primary/10 border-primary/30", children: [_jsx("h2", { className: "text-lg font-semibold text-text-primary mb-4", children: "Your Sponsor Code" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("code", { className: "flex-1 bg-white px-4 py-3 rounded-lg font-mono text-lg font-bold text-text-primary border border-grey-300", children: sponsorCode || 'Loading...' }), _jsx(Button, { onClick: () => copyToClipboard(sponsorCode, 'code'), disabled: !sponsorCode, className: "shrink-0", children: copiedCode ? 'Copied!' : 'Copy' })] }), _jsx("p", { className: "text-sm text-text-muted mt-3", children: "Share this code with potential new members. When they sign up using your code, you'll earn commissions on their purchases." })] }), _jsxs(Card, { className: "p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-text-primary mb-4", children: "Send Invitation" }), _jsxs("form", { onSubmit: sendInvitation, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: "Email Address" }), _jsx(Input, { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "Enter email address", required: true })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: ["Name ", _jsx("span", { className: "text-text-muted", children: "(Optional)" })] }), _jsx(Input, { type: "text", value: name, onChange: (e) => setName(e.target.value), placeholder: "Enter their name" })] }), message && (_jsx("div", { className: `p-3 rounded-lg text-sm ${message.type === 'success'
                                    ? 'bg-success/10 text-success border border-success/30'
                                    : 'bg-danger/10 text-danger border border-danger/30'}`, children: message.text })), _jsx(Button, { type: "submit", disabled: isSending || !email.trim(), className: "w-full", children: isSending ? 'Sending...' : 'Send Invitation' })] })] }), _jsxs(Card, { className: "p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-text-primary mb-4", children: "Your Personal Signup Link" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "text", value: signupLink, readOnly: true, className: "flex-1 bg-grey-100 px-4 py-3 rounded-lg text-sm text-text-primary border border-grey-300 truncate" }), _jsx(Button, { onClick: () => copyToClipboard(signupLink, 'link'), disabled: !signupLink, className: "shrink-0", children: copiedLink ? 'Copied!' : 'Copy Link' })] }), _jsx("p", { className: "text-sm text-text-muted mt-3", children: "Anyone who signs up using this link will automatically be linked to you as their sponsor." })] }), pendingInvitations.length > 0 && (_jsxs(Card, { className: "p-6", children: [_jsx("h2", { className: "text-lg font-semibold text-text-primary mb-4", children: "Pending Invitations" }), _jsx("div", { className: "space-y-3", children: pendingInvitations.map((invitation) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-grey-100 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center", children: _jsx("span", { className: "text-sm font-bold text-warning", children: (invitation.recipient_name?.[0] || invitation.recipient_email[0]).toUpperCase() }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-text-primary", children: invitation.recipient_name || 'No name provided' }), _jsx("p", { className: "text-sm text-text-muted", children: invitation.recipient_email })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: "inline-block px-2 py-1 text-xs font-medium bg-warning/20 text-warning rounded", children: "Pending" }), _jsxs("p", { className: "text-xs text-text-muted mt-1", children: ["Sent ", formatDate(invitation.created_at), " \u2022 Expires ", formatDate(invitation.expires_at)] })] })] }, invitation.id))) })] })), acceptedInvitations.length > 0 && (_jsxs(Card, { className: "p-6", children: [_jsxs("h2", { className: "text-lg font-semibold text-text-primary mb-4", children: ["Your Team (", acceptedInvitations.length, " member", acceptedInvitations.length !== 1 ? 's' : '', ")"] }), _jsx("div", { className: "space-y-3", children: acceptedInvitations.map((member) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-grey-100 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-success/20 flex items-center justify-center", children: _jsxs("span", { className: "text-sm font-bold text-success", children: [(member.first_name?.[0] || member.email[0]).toUpperCase(), (member.last_name?.[0] || '').toUpperCase()] }) }), _jsxs("div", { children: [_jsxs("p", { className: "font-medium text-text-primary", children: [member.first_name, " ", member.last_name] }), _jsx("p", { className: "text-sm text-text-muted", children: member.email })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: "inline-block px-2 py-1 text-xs font-medium bg-success/20 text-success rounded", children: "Active" }), _jsxs("p", { className: "text-xs text-text-muted mt-1", children: ["Joined ", formatDate(member.created_at)] })] })] }, member.id))) })] })), pendingInvitations.length === 0 && acceptedInvitations.length === 0 && (_jsxs(Card, { className: "p-6 text-center", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-grey-200 flex items-center justify-center mx-auto mb-4", children: _jsx("span", { className: "text-2xl font-bold text-text-muted", children: "RP" }) }), _jsx("h3", { className: "text-lg font-semibold text-text-primary mb-2", children: "No Referrals Yet" }), _jsx("p", { className: "text-text-muted mb-4", children: "Start inviting people to build your team and earn commissions!" })] }))] }));
}
//# sourceMappingURL=RecruitPage.js.map