/**
 * Kaksos Portal - Settings Page
 * Configure AI Twin personality, behavior, model, and API settings
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { settingsApi, KaksosSettings } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import SowingWizard from '../components/SowingWizard';

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

// Model options (must match API validation)
const MODEL_OPTIONS = [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', description: 'Best balance of speed and intelligence' },
    { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', description: 'Fastest responses, great for simple tasks' },
];

// Character limit for custom instructions
const CUSTOM_INSTRUCTIONS_MAX = 8000;

export default function SettingsPage() {
    const { user } = useAuth();
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
    const [preferredModel, setPreferredModel] = useState('claude-sonnet-4-20250514');

    // API Key testing state
    const [testQuestion, setTestQuestion] = useState('Hello! Can you introduce yourself?');
    const [testResponse, setTestResponse] = useState<string | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [testError, setTestError] = useState<string | null>(null);

    // Sowing wizard state
    const [showSowingWizard, setShowSowingWizard] = useState(false);

    // API Key management state
    const [hasApiKey, setHasApiKey] = useState(false);
    const [apiKeyPreview, setApiKeyPreview] = useState<string | null>(null);
    const [newApiKey, setNewApiKey] = useState('');
    const [isSavingApiKey, setIsSavingApiKey] = useState(false);
    const [isTestingApiKey, setIsTestingApiKey] = useState(false);
    const [isRemovingApiKey, setIsRemovingApiKey] = useState(false);
    const [apiKeyMessage, setApiKeyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
                setPreferredModel(response.settings.preferred_model || 'claude-sonnet-4-20250514');

                // Populate API key status
                setHasApiKey(response.has_api_key || false);
                setApiKeyPreview(response.api_key_preview || null);
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
                preferred_model: preferredModel,
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

    // Handle test connection
    async function handleTestConnection() {
        if (!testQuestion.trim()) {
            setTestError('Please enter a test question');
            return;
        }

        setIsTesting(true);
        setTestError(null);
        setTestResponse(null);

        try {
            const result = await settingsApi.testPreview({
                boby_place_id: bobyPlaceId,
                kaksos_name: kaksosName,
                communication_style: communicationStyle,
                response_length: responseLength,
                proactiveness: proactiveness,
                custom_instructions: customInstructions,
                test_question: testQuestion,
            });

            setTestResponse(result.response);
        } catch (err) {
            console.error('Test failed:', err);
            setTestError(err instanceof Error ? err.message : 'Test failed');
        } finally {
            setIsTesting(false);
        }
    }

    // Handle save API key
    async function handleSaveApiKey() {
        if (!newApiKey.trim()) {
            setApiKeyMessage({ type: 'error', text: 'Please enter an API key' });
            return;
        }

        if (!newApiKey.trim().startsWith('sk-ant-')) {
            setApiKeyMessage({ type: 'error', text: 'Invalid API key format. Anthropic keys start with "sk-ant-"' });
            return;
        }

        setIsSavingApiKey(true);
        setApiKeyMessage(null);

        try {
            const result = await settingsApi.saveApiKey(bobyPlaceId, newApiKey.trim());
            setHasApiKey(result.has_api_key);
            setApiKeyPreview(result.api_key_preview);
            setNewApiKey('');
            setApiKeyMessage({ type: 'success', text: 'API key saved and encrypted successfully' });
            setTimeout(() => setApiKeyMessage(null), 5000);
        } catch (err) {
            console.error('Failed to save API key:', err);
            setApiKeyMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save API key' });
        } finally {
            setIsSavingApiKey(false);
        }
    }

    // Handle test API key
    async function handleTestApiKey() {
        setIsTestingApiKey(true);
        setApiKeyMessage(null);

        try {
            const result = await settingsApi.testApiKey(bobyPlaceId);
            if (result.valid) {
                setApiKeyMessage({ type: 'success', text: result.message });
            } else {
                setApiKeyMessage({ type: 'error', text: result.message });
            }
            setTimeout(() => setApiKeyMessage(null), 5000);
        } catch (err) {
            console.error('Failed to test API key:', err);
            setApiKeyMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to test API key' });
        } finally {
            setIsTestingApiKey(false);
        }
    }

    // Handle remove API key
    async function handleRemoveApiKey() {
        if (!confirm('Are you sure you want to remove your API key? You will need to enter it again to use Kaksos.')) {
            return;
        }

        setIsRemovingApiKey(true);
        setApiKeyMessage(null);

        try {
            const result = await settingsApi.removeApiKey(bobyPlaceId);
            setHasApiKey(result.has_api_key);
            setApiKeyPreview(result.api_key_preview);
            setApiKeyMessage({ type: 'success', text: 'API key removed successfully' });
            setTimeout(() => setApiKeyMessage(null), 5000);
        } catch (err) {
            console.error('Failed to remove API key:', err);
            setApiKeyMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to remove API key' });
        } finally {
            setIsRemovingApiKey(false);
        }
    }

    return (
        <DashboardLayout>
            <div className="p-8 max-w-4xl">
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
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Help Me Get Started Banner */}
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 mb-1">New to Kaksos?</h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Answer the 99 Questions to help your AI Twin understand who you are.
                                        This will generate personalized custom instructions automatically.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setShowSowingWizard(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-gray-800 font-medium rounded-lg hover:bg-primary-dark transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        Help Me Get Started
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* API Key Section */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Anthropic API Key</span>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Your API key is encrypted and stored securely. Get your key from{' '}
                                        <a
                                            href="https://console.anthropic.com/settings/keys"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            console.anthropic.com
                                        </a>
                                    </p>
                                </div>
                                {hasApiKey && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-xs font-medium text-green-700">Configured</span>
                                    </div>
                                )}
                            </div>

                            {/* API Key Message */}
                            {apiKeyMessage && (
                                <div className={`mb-4 p-3 rounded-lg text-sm ${
                                    apiKeyMessage.type === 'success'
                                        ? 'bg-green-50 border border-green-200 text-green-700'
                                        : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                    {apiKeyMessage.text}
                                </div>
                            )}

                            {hasApiKey ? (
                                /* Show current key preview and actions */
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                        <code className="text-sm font-mono text-gray-600">{apiKeyPreview || 'sk-ant-...****'}</code>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={handleTestApiKey}
                                            disabled={isTestingApiKey}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                                        >
                                            {isTestingApiKey ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                                                    Testing...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Test Key
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleRemoveApiKey}
                                            disabled={isRemovingApiKey}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                        >
                                            {isRemovingApiKey ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                                                    Removing...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Remove Key
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Option to replace key */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-500 mb-2">Replace with a new key:</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="password"
                                                value={newApiKey}
                                                onChange={(e) => setNewApiKey(e.target.value)}
                                                placeholder="sk-ant-..."
                                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleSaveApiKey}
                                                disabled={isSavingApiKey || !newApiKey.trim()}
                                                className="px-4 py-2 bg-primary text-gray-800 font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                                            >
                                                {isSavingApiKey ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* No key configured - show input */
                                <div className="space-y-4">
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex gap-3">
                                            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-medium text-amber-800">API Key Required</p>
                                                <p className="text-sm text-amber-700 mt-1">
                                                    To use Kaksos, you need to provide your own Anthropic API key. Your key is encrypted and never stored in plaintext.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="password"
                                            value={newApiKey}
                                            onChange={(e) => setNewApiKey(e.target.value)}
                                            placeholder="sk-ant-api03-..."
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSaveApiKey}
                                            disabled={isSavingApiKey || !newApiKey.trim()}
                                            className="px-6 py-3 bg-primary text-gray-800 font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                                        >
                                            {isSavingApiKey ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                                                    Saving...
                                                </div>
                                            ) : (
                                                'Save Key'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

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

                        {/* Custom Instructions - Prominent Section */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Custom Instructions</span>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Define your AI Twin's personality, knowledge, and behavior. Be specific about who you are,
                                        what you do, and how your Kaksos should represent you.
                                    </p>
                                </div>
                            </div>
                            <textarea
                                value={customInstructions}
                                onChange={(e) => setCustomInstructions(e.target.value)}
                                placeholder={`Example:
You are [Kaksos Name], the AI twin of [Your Name].

About me:
- I'm a [profession] based in [location]
- I specialize in [areas of expertise]
- My communication style is [describe]

Key facts:
- [Important fact 1]
- [Important fact 2]

When responding:
- Always use [language preferences]
- Be [personality traits]
- Never [things to avoid]`}
                                rows={12}
                                maxLength={CUSTOM_INSTRUCTIONS_MAX}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors resize-none font-mono text-sm"
                            />
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-gray-400">
                                    Tip: The more detailed your instructions, the better your Kaksos will represent you.
                                </p>
                                <span className={`text-xs ${customInstructions.length > CUSTOM_INSTRUCTIONS_MAX * 0.9 ? 'text-amber-600' : 'text-gray-400'}`}>
                                    {customInstructions.length.toLocaleString()} / {CUSTOM_INSTRUCTIONS_MAX.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Model Selection */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <span className="text-sm font-medium text-gray-700">AI Model</span>
                            <p className="text-sm text-gray-500 mt-1 mb-4">
                                Choose which Claude model powers your Kaksos
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {MODEL_OPTIONS.map((model) => (
                                    <label
                                        key={model.value}
                                        className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors ${
                                            preferredModel === model.value
                                                ? 'border-primary bg-primary-light'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="preferredModel"
                                            value={model.value}
                                            checked={preferredModel === model.value}
                                            onChange={(e) => setPreferredModel(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div>
                                            <span className="block text-sm font-medium text-gray-800">
                                                {model.label}
                                            </span>
                                            <span className="block text-xs text-gray-500 mt-1">
                                                {model.description}
                                            </span>
                                        </div>
                                        {preferredModel === model.value && (
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

                        {/* Communication Style */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <span className="text-sm font-medium text-gray-700">Communication Style</span>
                            <p className="text-sm text-gray-500 mt-1 mb-4">
                                How should your Kaksos communicate?
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                        {/* Test Your Settings */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <span className="text-sm font-medium text-gray-700">Test Your Settings</span>
                            <p className="text-sm text-gray-500 mt-1 mb-4">
                                Send a test message to see how your Kaksos responds with the current settings
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">Test Question</label>
                                    <input
                                        type="text"
                                        value={testQuestion}
                                        onChange={(e) => setTestQuestion(e.target.value)}
                                        placeholder="Enter a test question..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleTestConnection}
                                    disabled={isTesting}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-info text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isTesting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Testing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Test Connection
                                        </>
                                    )}
                                </button>

                                {/* Test Error */}
                                {testError && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {testError}
                                    </div>
                                )}

                                {/* Test Response */}
                                {testResponse && (
                                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                <span className="text-xs font-semibold text-gray-800">
                                                    {kaksosName?.charAt(0)?.toUpperCase() || 'K'}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">
                                                {kaksosName || 'Kaksos'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{testResponse}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end gap-4 pt-4">
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
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Save Settings
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* Sowing Wizard Modal */}
                <SowingWizard
                    isOpen={showSowingWizard}
                    onClose={() => setShowSowingWizard(false)}
                    bobyPlaceId={bobyPlaceId}
                    onComplete={(result) => {
                        // Update custom instructions if provided
                        if (result.instructions) {
                            setCustomInstructions(result.instructions);
                            setSuccessMessage(`Sowing complete! ${result.seedCount || 0} seeds planted. Custom instructions updated.`);
                            setTimeout(() => setSuccessMessage(null), 5000);
                        }
                    }}
                />
            </div>
        </DashboardLayout>
    );
}
