import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Agent Portal Settings Page
 *
 * Account settings, preferences, and security options
 * Brand-compliant: Gold accents, 2-letter markers, no emojis
 */
import { useState } from 'react';
import { Button, Card, CardContent, CardTitle } from '@boby/ui';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
export function SettingsPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    // Notification settings state
    const [notifications, setNotifications] = useState([
        {
            id: 'job_alerts',
            name: 'Job Alerts',
            description: 'Get notified when new jobs match your preferences',
            marker: 'JA',
            enabled: true,
        },
        {
            id: 'shift_reminders',
            name: 'Shift Reminders',
            description: 'Receive reminders before upcoming shifts',
            marker: 'SR',
            enabled: true,
        },
        {
            id: 'payment_notifications',
            name: 'Payment Notifications',
            description: 'Get notified when payments are processed',
            marker: 'PN',
            enabled: true,
        },
        {
            id: 'marketing_emails',
            name: 'Marketing & Updates',
            description: 'Receive news and promotional content',
            marker: 'MK',
            enabled: false,
        },
    ]);
    // Privacy settings state
    const [privacy, setPrivacy] = useState([
        {
            id: 'profile_visible',
            name: 'Profile Visible to Employers',
            description: 'Allow employers to find you in agent search',
            marker: 'PV',
            enabled: true,
        },
        {
            id: 'show_availability',
            name: 'Show Availability',
            description: 'Display your availability calendar to employers',
            marker: 'AV',
            enabled: true,
        },
    ]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [saveMessage, setSaveMessage] = useState(null);
    const toggleSetting = (setSettings, id) => {
        setSettings(prev => prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s)));
        setSaveMessage({ type: 'success', text: 'Settings updated' });
        // Auto-clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
    };
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const handleDeleteAccount = () => {
        // Would call API to delete account
        // For now, just log out
        logout();
        navigate('/login');
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-text-primary", children: "Settings" }), _jsx("p", { className: "text-text-muted mt-1", children: "Manage your account preferences and security" })] }), saveMessage && (_jsxs("div", { className: `mb-6 p-3 rounded-lg flex items-center gap-2 ${saveMessage.type === 'success'
                    ? 'bg-success/10 border border-success/30'
                    : 'bg-danger/10 border border-danger/30'}`, children: [_jsx("span", { className: `w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${saveMessage.type === 'success'
                            ? 'bg-success/20 text-success'
                            : 'bg-danger/20 text-danger'}`, children: saveMessage.type === 'success' ? 'OK' : 'ER' }), _jsx("span", { className: saveMessage.type === 'success' ? 'text-success' : 'text-danger', children: saveMessage.text })] })), _jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { variant: "default", padding: "lg", children: [_jsx(CardTitle, { className: "mb-4", children: "Account Information" }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center gap-4 p-4 bg-grey-100 rounded-lg", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-primary flex items-center justify-center", children: _jsxs("span", { className: "text-sm font-bold text-text-primary", children: [user?.firstName?.[0], user?.lastName?.[0] || user?.email?.[0]] }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("p", { className: "font-medium text-text-primary", children: [user?.firstName, " ", user?.lastName] }), _jsx("p", { className: "text-sm text-text-muted", children: user?.email }), user?.telepathcode && (_jsx("p", { className: "text-xs font-mono text-primary-dark mt-1", children: user.telepathcode }))] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => navigate('/profile'), children: "Edit Profile" })] }) })] }), _jsxs(Card, { variant: "default", padding: "lg", children: [_jsx(CardTitle, { className: "mb-4", children: "Notifications" }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: notifications.map(setting => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-grey-100 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center ${setting.enabled ? 'bg-primary/20' : 'bg-grey-300'}`, children: _jsx("span", { className: `text-xs font-bold ${setting.enabled ? 'text-primary-dark' : 'text-text-muted'}`, children: setting.marker }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-text-primary", children: setting.name }), _jsx("p", { className: "text-sm text-text-muted", children: setting.description })] })] }), _jsx("button", { onClick: () => toggleSetting(setNotifications, setting.id), className: `relative w-11 h-6 rounded-full transition-colors border-2 shrink-0 ${setting.enabled
                                                    ? 'bg-primary border-primary'
                                                    : 'bg-grey-200 border-grey-400'}`, role: "switch", "aria-checked": setting.enabled, children: _jsx("span", { className: `absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${setting.enabled ? 'left-5' : 'left-0.5'}` }) })] }, setting.id))) }) })] }), _jsxs(Card, { variant: "default", padding: "lg", children: [_jsx(CardTitle, { className: "mb-4", children: "Privacy" }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: privacy.map(setting => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-grey-100 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-lg flex items-center justify-center ${setting.enabled ? 'bg-primary/20' : 'bg-grey-300'}`, children: _jsx("span", { className: `text-xs font-bold ${setting.enabled ? 'text-primary-dark' : 'text-text-muted'}`, children: setting.marker }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-text-primary", children: setting.name }), _jsx("p", { className: "text-sm text-text-muted", children: setting.description })] })] }), _jsx("button", { onClick: () => toggleSetting(setPrivacy, setting.id), className: `relative w-11 h-6 rounded-full transition-colors border-2 shrink-0 ${setting.enabled
                                                    ? 'bg-primary border-primary'
                                                    : 'bg-grey-200 border-grey-400'}`, role: "switch", "aria-checked": setting.enabled, children: _jsx("span", { className: `absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${setting.enabled ? 'left-5' : 'left-0.5'}` }) })] }, setting.id))) }) })] }), _jsxs(Card, { variant: "default", padding: "lg", children: [_jsx(CardTitle, { className: "mb-4", children: "Security" }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-grey-100 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-grey-300 flex items-center justify-center", children: _jsx("span", { className: "text-xs font-bold text-text-muted", children: "PW" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-text-primary", children: "Password" }), _jsx("p", { className: "text-sm text-text-muted", children: "Changes apply to all Boby portals" })] })] }), _jsx(Button, { variant: "outline", size: "sm", children: "Change" })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-grey-100 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-grey-300 flex items-center justify-center", children: _jsx("span", { className: "text-xs font-bold text-text-muted", children: "2F" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-text-primary", children: "Two-Factor Authentication" }), _jsx("p", { className: "text-sm text-text-muted", children: "Not enabled" })] })] }), _jsx(Button, { variant: "outline", size: "sm", children: "Enable" })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-grey-100 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-grey-300 flex items-center justify-center", children: _jsx("span", { className: "text-xs font-bold text-text-muted", children: "SS" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-text-primary", children: "Active Sessions" }), _jsx("p", { className: "text-sm text-text-muted", children: "1 active session" })] })] }), _jsx(Button, { variant: "outline", size: "sm", children: "View" })] })] }) })] }), _jsxs(Card, { variant: "default", padding: "lg", className: "border-danger/30", children: [_jsx(CardTitle, { className: "mb-4 text-danger", children: "Danger Zone" }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-4 bg-grey-100 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center", children: _jsx("span", { className: "text-xs font-bold text-danger", children: "SO" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-text-primary", children: "Sign Out" }), _jsx("p", { className: "text-sm text-text-muted", children: "Sign out of your account" })] })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: handleLogout, children: "Sign Out" })] }), _jsxs("div", { className: "flex items-center justify-between p-4 bg-danger/5 rounded-lg border border-danger/20", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-danger/20 flex items-center justify-center", children: _jsx("span", { className: "text-xs font-bold text-danger", children: "DA" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-danger", children: "Delete Account" }), _jsx("p", { className: "text-sm text-text-muted", children: "Permanently delete your account and data" })] })] }), showDeleteConfirm ? (_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "danger", size: "sm", onClick: handleDeleteAccount, children: "Confirm Delete" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowDeleteConfirm(false), children: "Cancel" })] })) : (_jsx(Button, { variant: "danger", size: "sm", onClick: () => setShowDeleteConfirm(true), children: "Delete" }))] })] }) })] }), _jsx(Card, { variant: "default", padding: "md", children: _jsxs(CardContent, { className: "text-center", children: [_jsx("p", { className: "text-sm text-text-muted", children: "Boby Agent Portal v1.0.0" }), _jsx("p", { className: "text-xs text-text-muted mt-1", children: "Protected by BOBY Sovereign Identity" })] }) })] })] }));
}
//# sourceMappingURL=SettingsPage.js.map