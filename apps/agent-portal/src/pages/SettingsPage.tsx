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

interface ToggleSetting {
    id: string;
    name: string;
    description: string;
    marker: string;
    enabled: boolean;
}

export function SettingsPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Notification settings state
    const [notifications, setNotifications] = useState<ToggleSetting[]>([
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
    const [privacy, setPrivacy] = useState<ToggleSetting[]>([
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
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const toggleSetting = (
        setSettings: React.Dispatch<React.SetStateAction<ToggleSetting[]>>,
        id: string
    ) => {
        setSettings(prev =>
            prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s))
        );
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

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                    Settings
                </h1>
                <p className="text-text-muted mt-1">
                    Manage your account preferences and security
                </p>
            </div>

            {/* Save message */}
            {saveMessage && (
                <div className={`mb-6 p-3 rounded-lg flex items-center gap-2 ${saveMessage.type === 'success'
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

            <div className="space-y-6">
                {/* Account Info */}
                <Card variant="default" padding="lg">
                    <CardTitle className="mb-4">Account Information</CardTitle>
                    <CardContent>
                        <div className="flex items-center gap-4 p-4 bg-grey-100 rounded-lg">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-sm font-bold text-text-primary">
                                    {user?.firstName?.[0]}{user?.lastName?.[0] || user?.email?.[0]}
                                </span>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-text-primary">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-sm text-text-muted">{user?.email}</p>
                                {user?.telepathcode && (
                                    <p className="text-xs font-mono text-primary-dark mt-1">
                                        {user.telepathcode}
                                    </p>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/profile')}
                            >
                                Edit Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card variant="default" padding="lg">
                    <CardTitle className="mb-4">Notifications</CardTitle>
                    <CardContent>
                        <div className="space-y-4">
                            {notifications.map(setting => (
                                <div
                                    key={setting.id}
                                    className="flex items-center justify-between p-4 bg-grey-100 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${setting.enabled ? 'bg-primary/20' : 'bg-grey-300'
                                            }`}>
                                            <span className={`text-xs font-bold ${setting.enabled ? 'text-primary-dark' : 'text-text-muted'
                                                }`}>
                                                {setting.marker}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-text-primary">{setting.name}</p>
                                            <p className="text-sm text-text-muted">{setting.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleSetting(setNotifications, setting.id)}
                                        className={`relative w-11 h-6 rounded-full transition-colors border-2 shrink-0 ${setting.enabled
                                                ? 'bg-primary border-primary'
                                                : 'bg-grey-200 border-grey-400'
                                            }`}
                                        role="switch"
                                        aria-checked={setting.enabled}
                                    >
                                        <span
                                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${setting.enabled ? 'left-5' : 'left-0.5'
                                                }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy */}
                <Card variant="default" padding="lg">
                    <CardTitle className="mb-4">Privacy</CardTitle>
                    <CardContent>
                        <div className="space-y-4">
                            {privacy.map(setting => (
                                <div
                                    key={setting.id}
                                    className="flex items-center justify-between p-4 bg-grey-100 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${setting.enabled ? 'bg-primary/20' : 'bg-grey-300'
                                            }`}>
                                            <span className={`text-xs font-bold ${setting.enabled ? 'text-primary-dark' : 'text-text-muted'
                                                }`}>
                                                {setting.marker}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-text-primary">{setting.name}</p>
                                            <p className="text-sm text-text-muted">{setting.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleSetting(setPrivacy, setting.id)}
                                        className={`relative w-11 h-6 rounded-full transition-colors border-2 shrink-0 ${setting.enabled
                                                ? 'bg-primary border-primary'
                                                : 'bg-grey-200 border-grey-400'
                                            }`}
                                        role="switch"
                                        aria-checked={setting.enabled}
                                    >
                                        <span
                                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${setting.enabled ? 'left-5' : 'left-0.5'
                                                }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card variant="default" padding="lg">
                    <CardTitle className="mb-4">Security</CardTitle>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-grey-100 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-grey-300 flex items-center justify-center">
                                        <span className="text-xs font-bold text-text-muted">PW</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary">Password</p>
                                        <p className="text-sm text-text-muted">Changes apply to all Boby portals</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">
                                    Change
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-grey-100 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-grey-300 flex items-center justify-center">
                                        <span className="text-xs font-bold text-text-muted">2F</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary">Two-Factor Authentication</p>
                                        <p className="text-sm text-text-muted">Not enabled</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">
                                    Enable
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-grey-100 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-grey-300 flex items-center justify-center">
                                        <span className="text-xs font-bold text-text-muted">SS</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary">Active Sessions</p>
                                        <p className="text-sm text-text-muted">1 active session</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm">
                                    View
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card variant="default" padding="lg" className="border-danger/30">
                    <CardTitle className="mb-4 text-danger">Danger Zone</CardTitle>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-grey-100 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
                                        <span className="text-xs font-bold text-danger">SO</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary">Sign Out</p>
                                        <p className="text-sm text-text-muted">Sign out of your account</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={handleLogout}>
                                    Sign Out
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-danger/5 rounded-lg border border-danger/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-danger/20 flex items-center justify-center">
                                        <span className="text-xs font-bold text-danger">DA</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-danger">Delete Account</p>
                                        <p className="text-sm text-text-muted">Permanently delete your account and data</p>
                                    </div>
                                </div>
                                {showDeleteConfirm ? (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={handleDeleteAccount}
                                        >
                                            Confirm Delete
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowDeleteConfirm(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => setShowDeleteConfirm(true)}
                                    >
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* App Info */}
                <Card variant="default" padding="md">
                    <CardContent className="text-center">
                        <p className="text-sm text-text-muted">
                            Boby Agent Portal v1.0.0
                        </p>
                        <p className="text-xs text-text-muted mt-1">
                            Protected by BOBY Sovereign Identity
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
