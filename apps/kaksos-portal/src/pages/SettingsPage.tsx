/**
 * Kaksos Portal - Settings Page
 * Configure AI Twin name, custom instructions, and API settings
 * Personality emerges from training, not checkboxes
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { settingsApi, KaksosSettings } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import SowingWizard from '../components/SowingWizard';

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
    const [customInstructions, setCustomInstructions] = useState('');
    const [selectedModel, setSelectedModel] = useState('claude-sonnet-4-5-20250929');

    // Chat limits state
    const [publicChatEnabled, setPublicChatEnabled] = useState(true);
    const [publicChatDailyMessages, setPublicChatDailyMessages] = useState(50);
    const [publicChatDailyTokens, setPublicChatDailyTokens] = useState(50000);
    const [publicChatLimitAction, setPublicChatLimitAction] = useState<'polite_decline' | 'redirect_to_owner'>('polite_decline');
    const [memberChatEnabled, setMemberChatEnabled] = useState(true);
    const [memberChatDailyMessages, setMemberChatDailyMessages] = useState(200);
    const [memberChatDailyTokens, setMemberChatDailyTokens] = useState(200000);

    // Available Claude models
    const CLAUDE_MODELS = [
        { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5 - $3.00/$15.00 per million tokens (Recommended)' },
        { value: 'claude-opus-4-6', label: 'Claude Opus 4.6 - $15.00/$75.00 per million tokens (Premium)' },
    ];

    // API Key management state
    const [hasApiKey, setHasApiKey] = useState(false);
    const [apiKeyPreview, setApiKeyPreview] = useState<string | null>(null);
    const [newApiKey, setNewApiKey] = useState('');
    const [isSavingApiKey, setIsSavingApiKey] = useState(false);
    const [isTestingApiKey, setIsTestingApiKey] = useState(false);
    const [isRemovingApiKey, setIsRemovingApiKey] = useState(false);
    const [apiKeyMessage, setApiKeyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Sowing Wizard modal state
    const [showSowingModal, setShowSowingModal] = useState(false);

    // Preview testing state
    const [previewQuestion, setPreviewQuestion] = useState('Who are you and what do you do?');
    const [previewResponse, setPreviewResponse] = useState<string | null>(null);
    const [isTestingPreview, setIsTestingPreview] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);

    // Get the user's bobyPlaceId
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
                setCustomInstructions(response.settings.custom_instructions || '');
                setSelectedModel(response.settings.preferred_model || 'claude-sonnet-4-20250514');

                // Populate chat limits
                setPublicChatEnabled(response.settings.public_chat_enabled ?? true);
                setPublicChatDailyMessages(response.settings.public_chat_daily_messages ?? 50);
                setPublicChatDailyTokens(response.settings.public_chat_daily_tokens ?? 50000);
                setPublicChatLimitAction(response.settings.public_chat_limit_action ?? 'polite_decline');
                setMemberChatEnabled(response.settings.member_chat_enabled ?? true);
                setMemberChatDailyMessages(response.settings.member_chat_daily_messages ?? 200);
                setMemberChatDailyTokens(response.settings.member_chat_daily_tokens ?? 200000);

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
                // Note: kaksos_name is read-only, set in MeMe Vault
                custom_instructions: customInstructions,
                // Keep defaults for removed fields
                communication_style: 'professional_friendly',
                response_length: 'detailed',
                proactiveness: 'suggestive',
                preferred_model: selectedModel,
                // Chat limits
                public_chat_enabled: publicChatEnabled,
                public_chat_daily_messages: publicChatDailyMessages,
                public_chat_daily_tokens: publicChatDailyTokens,
                public_chat_limit_action: publicChatLimitAction,
                member_chat_enabled: memberChatEnabled,
                member_chat_daily_messages: memberChatDailyMessages,
                member_chat_daily_tokens: memberChatDailyTokens,
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

    // Handle test preview
    async function handleTestPreview() {
        if (!previewQuestion.trim()) return;

        setIsTestingPreview(true);
        setPreviewError(null);
        setPreviewResponse(null);

        try {
            const result = await settingsApi.testPreview({
                boby_place_id: bobyPlaceId,
                kaksos_name: kaksosName,
                custom_instructions: customInstructions,
                test_question: previewQuestion,
            });

            setPreviewResponse(result.response);
        } catch (err) {
            console.error('Failed to test preview:', err);
            setPreviewError(err instanceof Error ? err.message : 'Failed to test Kaksos');
        } finally {
            setIsTestingPreview(false);
        }
    }

    return (
        <DashboardLayout>
            <div className="p-4 md:p-8 max-w-3xl">
                {/* Page Header */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">Settings</h1>
                    <p className="text-gray-500 text-sm md:text-base mt-1">
                        Configure your AI Twin
                    </p>
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
                        {/* 1. Kaksos Name (Read-only - set in MeMe Vault) */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div>
                                <span className="text-sm font-medium text-gray-700">Kaksos Name</span>
                                <p className="text-sm text-gray-500 mt-1 mb-3">
                                    Your AI Twin's name, set in your MeMe Personal Vault
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium">
                                        {kaksosName || <span className="text-gray-400 font-normal">Not yet named</span>}
                                    </div>
                                    <a
                                        href="https://getboby.ai/membership-portal.html"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-3 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors whitespace-nowrap"
                                    >
                                        Edit in MeMe Vault
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* 2. Custom Instructions */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Custom Instructions</span>
                                    <p className="text-sm text-gray-500 mt-1">
                                        These instructions will be added to Kaksos's system prompt
                                    </p>
                                </div>
                            </div>

                            {/* Help Me Get Started Button */}
                            <div className="mb-4">
                                <button
                                    type="button"
                                    onClick={() => setShowSowingModal(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-800 font-medium rounded-lg hover:from-amber-500 hover:to-yellow-500 transition-all shadow-sm"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Help Me Get Started
                                </button>
                                <p className="text-xs text-gray-400 mt-2">
                                    Answer questions to help your AI Twin understand who you are
                                </p>
                            </div>

                            <textarea
                                value={customInstructions}
                                onChange={(e) => setCustomInstructions(e.target.value)}
                                placeholder={`Guidelines for your AI Twin...

Example:
You are Bonnard, the AI twin of Brandon.

About me:
- I value honesty, patience, and care
- I believe in sovereignty and personal freedom
- My communication style is warm but direct

When responding:
- Speak as if you know me deeply
- Be thoughtful and considered
- Honor my values and perspectives`}
                                rows={12}
                                maxLength={CUSTOM_INSTRUCTIONS_MAX}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors resize-none font-mono text-sm"
                            />
                            <div className="flex justify-end mt-2">
                                <span className={`text-xs ${customInstructions.length > CUSTOM_INSTRUCTIONS_MAX * 0.9 ? 'text-amber-600' : 'text-gray-400'}`}>
                                    {customInstructions.length.toLocaleString()} / {CUSTOM_INSTRUCTIONS_MAX.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* 3. Anthropic API Key */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-700">Anthropic API Key</span>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Your key is encrypted and stored securely.{' '}
                                        <a
                                            href="https://console.anthropic.com/settings/keys"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-amber-600 hover:underline"
                                        >
                                            Get your key
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
                                <div className={`mb-4 p-3 rounded-lg text-sm ${apiKeyMessage.type === 'success'
                                    ? 'bg-green-50 border border-green-200 text-green-700'
                                    : 'bg-red-50 border border-red-200 text-red-700'
                                    }`}>
                                    {apiKeyMessage.text}
                                </div>
                            )}

                            {hasApiKey ? (
                                <div className="space-y-4">
                                    {/* Key preview */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                        <code className="text-sm font-mono text-gray-600">{apiKeyPreview || 'sk-ant-...****'}</code>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={handleTestApiKey}
                                            disabled={isTestingApiKey}
                                            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
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
                                            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
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

                                    {/* Replace key option */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-500 mb-2">Replace with a new key:</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="password"
                                                value={newApiKey}
                                                onChange={(e) => setNewApiKey(e.target.value)}
                                                placeholder="sk-ant-..."
                                                className="flex-1 min-h-[44px] px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleSaveApiKey}
                                                disabled={isSavingApiKey || !newApiKey.trim()}
                                                className="min-h-[44px] px-4 py-2 bg-primary text-gray-800 font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                                            >
                                                {isSavingApiKey ? 'Saving...' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex gap-3">
                                            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-medium text-amber-800">API Key Required</p>
                                                <p className="text-sm text-amber-700 mt-1">
                                                    To use Kaksos, you need to provide your own Anthropic API key.
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
                                            className="flex-1 min-h-[44px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSaveApiKey}
                                            disabled={isSavingApiKey || !newApiKey.trim()}
                                            className="min-h-[44px] px-6 py-3 bg-primary text-gray-800 font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
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

                        {/* 4. Model Selection - only show if API key configured */}
                        {hasApiKey && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="mb-4">
                                    <span className="text-sm font-medium text-gray-700">Claude Model</span>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Per-token input/output costs per million tokens. Choose based on your API key tier.
                                    </p>
                                </div>

                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white"
                                >
                                    {CLAUDE_MODELS.map((model) => (
                                        <option key={model.value} value={model.value}>
                                            {model.label}
                                        </option>
                                    ))}
                                </select>

                                <p className="text-xs text-gray-400 mt-2">
                                    <a
                                        href="https://docs.anthropic.com/en/docs/about-claude/models"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-amber-600 hover:underline"
                                    >
                                        View Claude model comparison →
                                    </a>
                                </p>
                            </div>
                        )}

                        {/* 5. Chat Limits */}
                        {hasApiKey && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="mb-6">
                                    <span className="text-sm font-medium text-gray-700">Chat Limits</span>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Control how much energy your Kaksos spends on conversations each day
                                    </p>
                                </div>

                                {/* Public Chat Limits */}
                                <div className="mb-6 pb-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-800">Public Chat</h4>
                                            <p className="text-xs text-gray-500">Visitors who find your Kaksos via TelePathCode</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPublicChatEnabled(!publicChatEnabled)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                publicChatEnabled ? 'bg-amber-400' : 'bg-gray-300'
                                            }`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                publicChatEnabled ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>

                                    {publicChatEnabled && (
                                        <div className="space-y-3 pl-0">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Daily messages</label>
                                                    <input
                                                        type="number"
                                                        value={publicChatDailyMessages}
                                                        onChange={e => setPublicChatDailyMessages(parseInt(e.target.value) || 0)}
                                                        min={0}
                                                        max={10000}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Daily token budget</label>
                                                    <input
                                                        type="number"
                                                        value={publicChatDailyTokens}
                                                        onChange={e => setPublicChatDailyTokens(parseInt(e.target.value) || 0)}
                                                        min={0}
                                                        max={10000000}
                                                        step={1000}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">When limit reached</label>
                                                <select
                                                    value={publicChatLimitAction}
                                                    onChange={e => setPublicChatLimitAction(e.target.value as 'polite_decline' | 'redirect_to_owner')}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm bg-white"
                                                >
                                                    <option value="polite_decline">Polite decline — "Try again tomorrow"</option>
                                                    <option value="redirect_to_owner">Redirect — "Contact my owner directly"</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Member Chat Limits */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-800">Member Chat</h4>
                                            <p className="text-xs text-gray-500">Circle members chatting with your Kaksos</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setMemberChatEnabled(!memberChatEnabled)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                memberChatEnabled ? 'bg-amber-400' : 'bg-gray-300'
                                            }`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                memberChatEnabled ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                        </button>
                                    </div>

                                    {memberChatEnabled && (
                                        <div className="space-y-3 pl-0">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Daily messages</label>
                                                    <input
                                                        type="number"
                                                        value={memberChatDailyMessages}
                                                        onChange={e => setMemberChatDailyMessages(parseInt(e.target.value) || 0)}
                                                        min={0}
                                                        max={10000}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Daily token budget</label>
                                                    <input
                                                        type="number"
                                                        value={memberChatDailyTokens}
                                                        onChange={e => setMemberChatDailyTokens(parseInt(e.target.value) || 0)}
                                                        min={0}
                                                        max={10000000}
                                                        step={1000}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 6. Preview Section */}
                        {hasApiKey && kaksosName && (
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <div className="mb-4">
                                    <span className="text-sm font-medium text-gray-700">Test Your Kaksos</span>
                                    <p className="text-sm text-gray-500 mt-1">
                                        See how {kaksosName} responds with your current settings
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider">
                                        Select a Question
                                    </label>
                                    <select
                                        value={previewQuestion}
                                        onChange={(e) => {
                                            setPreviewQuestion(e.target.value);
                                            setPreviewResponse(null);
                                            setPreviewError(null);
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white text-sm"
                                    >
                                        <option value="Who are you and what do you do?">Who are you and what do you do?</option>
                                        <option value="What are your values?">What are your values?</option>
                                        <option value="How should I introduce you to others?">How should I introduce you to others?</option>
                                        <option value="What makes you different?">What makes you different?</option>
                                        <option value="Tell me about yourself.">Tell me about yourself.</option>
                                    </select>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleTestPreview}
                                    disabled={isTestingPreview}
                                    className="w-full min-h-[48px] px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-800 font-semibold rounded-lg hover:from-amber-500 hover:to-yellow-500 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isTestingPreview ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                                            Testing...
                                        </>
                                    ) : (
                                        'Test Your Kaksos'
                                    )}
                                </button>

                                {/* Preview Error */}
                                {previewError && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {previewError}
                                    </div>
                                )}

                                {/* Preview Response */}
                                {previewResponse && (
                                    <div className="mt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-semibold text-gray-800">
                                                    {kaksosName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{kaksosName}</span>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{previewResponse}</p>
                                        </div>
                                    </div>
                                )}

                                {!previewResponse && !previewError && !isTestingPreview && (
                                    <p className="text-center text-xs text-gray-400 mt-3">
                                        Click the button to see how your Kaksos responds
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="min-h-[48px] px-8 py-3 bg-primary hover:bg-primary-dark text-gray-800 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            </div>

            {/* Sowing Wizard Modal */}
            <SowingWizard
                isOpen={showSowingModal}
                onClose={() => setShowSowingModal(false)}
                bobyPlaceId={bobyPlaceId}
                onComplete={(result) => {
                    if (result.instructions) {
                        setCustomInstructions(result.instructions);
                        setSuccessMessage('Custom instructions generated from your answers!');
                        setTimeout(() => setSuccessMessage(null), 5000);
                    }
                }}
            />
        </DashboardLayout>
    );
}
