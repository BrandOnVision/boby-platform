/**
 * Firm Portal - Settings Page
 */

import { useState } from 'react';
import { Card, CardContent, Button, Toggle, useToast } from '@boby/ui';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
    const { user, firm, logout } = useAuth();
    const { addToast } = useToast();

    const [emailNotifications, setEmailNotifications] = useState(true);
    const [applicationAlerts, setApplicationAlerts] = useState(true);
    const [weeklyDigest, setWeeklyDigest] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSavePreferences = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        addToast({
            type: 'success',
            title: 'Settings Saved',
            message: 'Your preferences have been updated.',
        });
        setIsSaving(false);
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your account and preferences</p>
            </div>

            {/* Account Info */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Account Information
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Email</span>
                            <span className="text-gray-900 font-medium">{user?.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Name</span>
                            <span className="text-gray-900 font-medium">
                                {user?.firstName} {user?.lastName}
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-gray-600">Role</span>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                                Firm Manager
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Firm Info */}
            {firm && (
                <Card>
                    <CardContent className="p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Firm Details
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Firm Name</span>
                                <span className="text-gray-900 font-medium">{firm.name}</span>
                            </div>
                            {firm.tradingName && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Trading Name</span>
                                    <span className="text-gray-900">{firm.tradingName}</span>
                                </div>
                            )}
                            {firm.masterLicenceNumber && (
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Master Licence</span>
                                    <span className="text-gray-900 font-mono">{firm.masterLicenceNumber}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Contact Email</span>
                                <span className="text-gray-900">{firm.contactEmail}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Subscription</span>
                                <span className={`px-2 py-0.5 rounded-full text-sm font-medium ${firm.subscriptionStatus === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {firm.subscriptionStatus === 'active' ? '✓ Active' : firm.subscriptionStatus}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600">Partner Tier</span>
                                <span className="text-gray-900">Level {firm.tierLevel}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Notification Preferences */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Notification Preferences
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-gray-900 font-medium">Email Notifications</p>
                                <p className="text-sm text-gray-500">Receive updates via email</p>
                            </div>
                            <Toggle
                                checked={emailNotifications}
                                onChange={setEmailNotifications}
                            />
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-gray-900 font-medium">Application Alerts</p>
                                <p className="text-sm text-gray-500">
                                    Get notified when someone applies to your jobs
                                </p>
                            </div>
                            <Toggle
                                checked={applicationAlerts}
                                onChange={setApplicationAlerts}
                            />
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-gray-900 font-medium">Weekly Digest</p>
                                <p className="text-sm text-gray-500">
                                    Summary of job activity and applications
                                </p>
                            </div>
                            <Toggle
                                checked={weeklyDigest}
                                onChange={setWeeklyDigest}
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <Button
                            onClick={handleSavePreferences}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Preferences'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Billing (Placeholder) */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Billing & Subscription
                    </h2>

                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-gray-600 mb-4">
                            Manage your subscription and billing information.
                        </p>
                        <a
                            href="https://getboby.ai/billing"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline">
                                Manage Billing →
                            </Button>
                        </a>
                    </div>
                </CardContent>
            </Card>

            {/* Support & Logout */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Support & Account
                    </h2>

                    <div className="space-y-3">
                        <a
                            href="https://getboby.ai/help"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <Button variant="outline" className="w-full justify-start">
                                📚 Help Center
                            </Button>
                        </a>
                        <a
                            href="mailto:support@getboby.ai"
                            className="block"
                        >
                            <Button variant="outline" className="w-full justify-start">
                                ✉️ Contact Support
                            </Button>
                        </a>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-red-600 hover:bg-red-50 border-red-200"
                            onClick={handleLogout}
                        >
                            🚪 Sign Out
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
