/**
 * Kaksos Portal - Settings Page
 * Configure AI Twin personality and behavior settings
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { settingsApi, KaksosSettings } from '../lib/api';

// Communication style options (must match API validation)
const COMMUNICATION_STYLES = [
    { value: 'professional_friendly', label: 'Professional & Friendly', description: 'Balanced tone for business and personal' },
    { value: 'casual_relaxed', label: 'Casual & Relaxed', description: 'Friendly and conversational' },
    { value: 'strictly_formal', label: 'Strictly Formal', description: 'Professional and precise' },
];

// Response length options (must match API validation)
const RESPONSE_LENGTHS = [
    { value: 'concise', label: 'Concise', description: 'Brief, to-the-point responses' },
    { value: 'detailed', label: 'Detailed', description: 'Comprehensive explanations' },
];

// Proactiveness options (must match API validation)
const PROACTIVENESS_LEVELS = [
    { value: 'responsive_only', label: 'Responsive Only', description: 'Only responds when asked' },
    { value: 'suggestive', label: 'Suggestive', description: 'Offers helpful suggestions' },
];

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const [, setSettings] = useState<KaksosSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [kaksosName, setKaksosName] = useState('');
    const [communicationStyle, setCommunicationStyle] = useState('professional_friendly');
    const [responseLength, setResponseLength] = useState('concise');
    const [proactiveness, setProactiveness] = useState('suggestive');
    const [customInstructions, setCustomInstructions] = useState('');

    // Get the user's bobyPlaceId (using their id as the place for now)
    const bobyPlaceId = user?.id || '';

    // Fetch settings on mount
    useEffect(() => {
        async function fetchSettings() {
            if (!bobyPlaceId) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await settingsApi.getSettings(bobyPlaceId);
                setSettings(response.settings);

                // Populate form
                setKaksosName(response.settings.kaksos_name || '');
                setCommunicationStyle(response.settings.communication_style || 'professional_friendly');
                setResponseLength(response.settings.response_length || 'concise');
                setProactiveness(response.settings.proactiveness || 'suggestive');
                setCustomInstructions(response.settings.custom_instructions || '');
            } catch (err) {
                console.error('Failed to fetch settings:', err);
                setError(err instanceof Error ? err.message : 'Failed to load settings');
            } finally {
                setIsLoading(false);
            }
        }

        fetchSettings();
    }, [bobyPlaceId]);

    // Handle save
    async function handleSave(e: React.FormEvent) {
        e.preventDefault();

        if (!bobyPlaceId) {
            setError('No Boby Place ID available');
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await settingsApi.saveSettings(bobyPlaceId, {
                kaksos_name: kaksosName,
                communication_style: communicationStyle,
                response_length: responseLength,
                proactiveness: proactiveness,
                custom_instructions: customInstructions,
            });

            setSuccessMessage('Settings saved successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            console.error('Failed to save settings:', err);
            setError(err instanceof Error ? err.message : 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <Link to="/" className="flex items-center gap-3 hover:opacity-80">
                                <img
                                    src="/Bobylogo.png"
                                    alt="BOBY"
                                    className="h-8"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                                <span className="font-semibold text-gray-800">Kaksos Portal</span>
                            </Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-600">Settings</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                {user?.firstName} {user?.lastName}
                            </span>
                            <button
                                onClick={logout}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back link */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </Link>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">Kaksos Settings</h1>
                    <p className="text-gray-500 mt-1">Configure your AI Twin's personality and behavior</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                        {successMessage}
                    </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading settings...</p>
                    </div>
                ) : (
                    /* Settings Form */
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Kaksos Name */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <label className="block">
                                <span className="text-sm font-medium text-gray-700">Kaksos Name</span>
                                <p className="text-sm text-gray-500 mt-1 mb-3">
                                    What should your AI Twin be called?
                                </p>
                                <input
                                    type="text"
                                    value={kaksosName}
                                    onChange={(e) => setKaksosName(e.target.value)}
                                    placeholder="e.g., Bonnard, Alex, My Assistant"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                                />
                            </label>
                        </div>

                        {/* Communication Style */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <span className="text-sm font-medium text-gray-700">Communication Style</span>
                            <p className="text-sm text-gray-500 mt-1 mb-4">
                                How should your Kaksos communicate?
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {COMMUNICATION_STYLES.map((style) => (
                                    <label
                                        key={style.value}
                                        className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors ${
                                            communicationStyle === style.value
                                                ? 'border-primary bg-primary-light'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="communicationStyle"
                                            value={style.value}
                                            checked={communicationStyle === style.value}
                                            onChange={(e) => setCommunicationStyle(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div>
                                            <span className="block text-sm font-medium text-gray-800">
                                                {style.label}
                                            </span>
                                            <span className="block text-xs text-gray-500 mt-1">
                                                {style.description}
                                            </span>
                                        </div>
                                        {communicationStyle === style.value && (
                                            <svg
                                                className="absolute top-4 right-4 w-5 h-5 text-primary-dark"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Response Length */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <span className="text-sm font-medium text-gray-700">Response Length</span>
                            <p className="text-sm text-gray-500 mt-1 mb-4">
                                How detailed should responses be?
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {RESPONSE_LENGTHS.map((length) => (
                                    <label
                                        key={length.value}
                                        className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors ${
                                            responseLength === length.value
                                                ? 'border-primary bg-primary-light'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="responseLength"
                                            value={length.value}
                                            checked={responseLength === length.value}
                                            onChange={(e) => setResponseLength(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div>
                                            <span className="block text-sm font-medium text-gray-800">
                                                {length.label}
                                            </span>
                                            <span className="block text-xs text-gray-500 mt-1">
                                                {length.description}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Proactiveness */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <span className="text-sm font-medium text-gray-700">Proactiveness</span>
                            <p className="text-sm text-gray-500 mt-1 mb-4">
                                How proactive should your Kaksos be?
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {PROACTIVENESS_LEVELS.map((level) => (
                                    <label
                                        key={level.value}
                                        className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors ${
                                            proactiveness === level.value
                                                ? 'border-primary bg-primary-light'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="proactiveness"
                                            value={level.value}
                                            checked={proactiveness === level.value}
                                            onChange={(e) => setProactiveness(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div>
                                            <span className="block text-sm font-medium text-gray-800">
                                                {level.label}
                                            </span>
                                            <span className="block text-xs text-gray-500 mt-1">
                                                {level.description}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Custom Instructions */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <label className="block">
                                <span className="text-sm font-medium text-gray-700">Custom Instructions</span>
                                <p className="text-sm text-gray-500 mt-1 mb-3">
                                    Add specific instructions, personality traits, or context for your Kaksos.
                                </p>
                                <textarea
                                    value={customInstructions}
                                    onChange={(e) => setCustomInstructions(e.target.value)}
                                    placeholder="e.g., Always use Australian English. Mention that I'm based in Brisbane. Be enthusiastic about technology topics..."
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors resize-none"
                                />
                            </label>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end gap-4">
                            <Link
                                to="/"
                                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-3 bg-primary hover:bg-primary-dark text-gray-800 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Settings'
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
}
