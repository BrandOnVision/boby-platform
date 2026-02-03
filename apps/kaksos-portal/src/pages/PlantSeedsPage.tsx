/**
 * Kaksos Portal - Plant Seeds Page
 * KMKY (Know Me Know You) conversational interface
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { kmkyApi, KmkyConversation, KmkyMessage, KmkyStatistics } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';

// Format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export default function PlantSeedsPage() {
    const { user } = useAuth();
    const bobyPlaceId = user?.id || '';

    // Conversations list state
    const [conversations, setConversations] = useState<KmkyConversation[]>([]);
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [listError, setListError] = useState<string | null>(null);

    // Selected conversation state
    const [selectedConversation, setSelectedConversation] = useState<KmkyConversation | null>(null);
    const [messages, setMessages] = useState<KmkyMessage[]>([]);
    const [isLoadingConversation, setIsLoadingConversation] = useState(false);

    // Message input state
    const [messageInput, setMessageInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    // Stats state
    const [stats, setStats] = useState<KmkyStatistics | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    // Creating/archiving state
    const [isCreating, setIsCreating] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of messages
    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch conversations list
    useEffect(() => {
        async function fetchConversations() {
            if (!bobyPlaceId) return;

            setIsLoadingList(true);
            setListError(null);

            try {
                const response = await kmkyApi.listConversations(bobyPlaceId, { status: 'active' });
                setConversations(response.conversations || []);
            } catch (err) {
                console.error('Failed to fetch conversations:', err);
                setListError(err instanceof Error ? err.message : 'Failed to load conversations');
            } finally {
                setIsLoadingList(false);
            }
        }

        fetchConversations();
    }, [bobyPlaceId]);

    // Fetch stats
    useEffect(() => {
        async function fetchStats() {
            if (!bobyPlaceId) return;

            setIsLoadingStats(true);

            try {
                const response = await kmkyApi.getStatistics(bobyPlaceId);
                setStats(response.statistics);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setIsLoadingStats(false);
            }
        }

        fetchStats();
    }, [bobyPlaceId]);

    // Load selected conversation
    async function loadConversation(conv: KmkyConversation) {
        setSelectedConversation(conv);
        setIsLoadingConversation(true);
        setMessages([]);
        setSendError(null);

        try {
            const response = await kmkyApi.getConversation(conv.id, bobyPlaceId);
            setMessages(response.conversation.messages || []);
        } catch (err) {
            console.error('Failed to load conversation:', err);
        } finally {
            setIsLoadingConversation(false);
        }
    }

    // Create new conversation
    async function handleNewConversation() {
        if (!bobyPlaceId) return;

        setIsCreating(true);

        try {
            const response = await kmkyApi.createConversation(bobyPlaceId);
            const newConv: KmkyConversation = {
                id: response.conversationId,
                title: 'New Conversation',
                status: 'active',
                message_count: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            setConversations(prev => [newConv, ...prev]);
            setSelectedConversation(newConv);
            setMessages([]);
        } catch (err) {
            console.error('Failed to create conversation:', err);
            setListError(err instanceof Error ? err.message : 'Failed to create conversation');
        } finally {
            setIsCreating(false);
        }
    }

    // Send message
    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault();

        if (!selectedConversation || !messageInput.trim() || isSending) return;

        const content = messageInput.trim();
        setMessageInput('');
        setIsSending(true);
        setSendError(null);

        // Optimistically add user message
        const tempUserMessage: KmkyMessage = {
            id: `temp_${Date.now()}`,
            role: 'user',
            content,
            created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempUserMessage]);

        try {
            const response = await kmkyApi.sendMessage(selectedConversation.id, content, bobyPlaceId);

            // Replace temp message and add assistant response
            setMessages(prev => [
                ...prev.filter(m => m.id !== tempUserMessage.id),
                response.userMessage,
                response.assistantMessage,
            ]);

            // Update conversation title if provided
            if (response.newTitle) {
                setSelectedConversation(prev => prev ? { ...prev, title: response.newTitle! } : null);
                setConversations(prev =>
                    prev.map(c => c.id === selectedConversation.id ? { ...c, title: response.newTitle! } : c)
                );
            }

            // Update message count
            setConversations(prev =>
                prev.map(c => c.id === selectedConversation.id ? { ...c, message_count: response.messageCount } : c)
            );
        } catch (err) {
            console.error('Failed to send message:', err);
            setSendError(err instanceof Error ? err.message : 'Failed to send message');
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
            setMessageInput(content); // Restore input
        } finally {
            setIsSending(false);
        }
    }

    // Archive conversation (plant seeds)
    async function handleArchive() {
        if (!selectedConversation) return;

        if (!confirm('Plant this conversation as seeds? This will extract Q&A pairs for training.')) {
            return;
        }

        setIsArchiving(true);

        try {
            const response = await kmkyApi.archiveConversation(selectedConversation.id, bobyPlaceId);

            // Remove from list
            setConversations(prev => prev.filter(c => c.id !== selectedConversation.id));
            setSelectedConversation(null);
            setMessages([]);

            // Update stats
            if (stats) {
                setStats({
                    ...stats,
                    qaPairs: {
                        ...stats.qaPairs,
                        total: stats.qaPairs.total + response.qaCount,
                        pending: stats.qaPairs.pending + response.qaCount,
                    },
                });
            }

            alert(`Planted ${response.qaCount} seeds from this conversation!`);
        } catch (err) {
            console.error('Failed to archive conversation:', err);
            alert(err instanceof Error ? err.message : 'Failed to plant seeds');
        } finally {
            setIsArchiving(false);
        }
    }

    // Delete conversation
    async function handleDelete(conv: KmkyConversation, e: React.MouseEvent) {
        e.stopPropagation(); // Prevent selecting the conversation

        if (!confirm(`Delete "${conv.title}"? This cannot be undone.`)) {
            return;
        }

        try {
            await kmkyApi.deleteConversation(conv.id, bobyPlaceId);

            // Remove from list
            setConversations(prev => prev.filter(c => c.id !== conv.id));

            // Clear selection if this was selected
            if (selectedConversation?.id === conv.id) {
                setSelectedConversation(null);
                setMessages([]);
            }
        } catch (err) {
            console.error('Failed to delete conversation:', err);
            alert(err instanceof Error ? err.message : 'Failed to delete conversation');
        }
    }

    // Mobile: go back to list
    function handleBackToList() {
        setSelectedConversation(null);
        setMessages([]);
    }

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-3.5rem)] md:h-full flex flex-col md:flex-row max-w-full overflow-hidden">
                {/* Left Panel - Conversations List */}
                {/* Hidden on mobile when conversation is selected */}
                <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0 border-r border-gray-200 flex-col bg-white`}>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-gray-800">Conversations</h2>
                            <button
                                onClick={handleNewConversation}
                                disabled={isCreating}
                                className="min-h-[44px] min-w-[44px] p-2 text-primary-dark hover:bg-primary-light rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                                title="New conversation"
                            >
                                {isCreating ? (
                                    <div className="w-5 h-5 border-2 border-primary-dark border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            Chat naturally. Your conversations become seeds.
                        </p>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto">
                        {listError && (
                            <div className="p-4 text-sm text-red-600">{listError}</div>
                        )}

                        {isLoadingList ? (
                            <div className="p-8 text-center">
                                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-sm">No conversations yet</p>
                                <button
                                    onClick={handleNewConversation}
                                    disabled={isCreating}
                                    className="mt-3 text-sm text-primary-dark hover:underline"
                                >
                                    Start your first conversation
                                </button>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <div
                                    key={conv.id}
                                    className={`group relative border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                        selectedConversation?.id === conv.id ? 'bg-primary-light border-l-4 border-l-primary' : ''
                                    }`}
                                >
                                    <button
                                        onClick={() => loadConversation(conv)}
                                        className="w-full text-left p-4 pr-12"
                                    >
                                        <p className="font-medium text-gray-800 truncate">{conv.title}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-gray-400">{conv.message_count} messages</span>
                                            <span className="text-xs text-gray-400">{formatRelativeTime(conv.updated_at)}</span>
                                        </div>
                                    </button>
                                    {/* Delete button - always visible on mobile, hover on desktop */}
                                    <button
                                        onClick={(e) => handleDelete(conv, e)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 md:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded md:opacity-0 group-hover:opacity-100 transition-all"
                                        title="Delete conversation"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Stats Panel */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Seed Stats</h3>
                        {isLoadingStats ? (
                            <div className="text-center py-2">
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto" />
                            </div>
                        ) : stats ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Seeds Planted</span>
                                    <span className="text-sm font-semibold text-green-600">{stats.qaPairs.total}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Needing Care</span>
                                    <span className="text-sm font-semibold text-amber-600">{stats.qaPairs.pending}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Taking Root</span>
                                    <span className="text-sm font-semibold text-blue-600">{stats.qaPairs.trained}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">Unable to load stats</p>
                        )}
                    </div>
                </div>

                {/* Right Panel - Chat Area */}
                {/* Full screen on mobile when conversation is selected */}
                <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-gray-50`}>
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-4 md:px-6 py-3 md:py-4 bg-white border-b border-gray-200 flex items-center justify-between gap-3">
                                {/* Back button - mobile only */}
                                <button
                                    onClick={handleBackToList}
                                    className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="flex-1 min-w-0">
                                    <h2 className="font-semibold text-gray-800 truncate">{selectedConversation.title}</h2>
                                    <p className="text-xs text-gray-500">{selectedConversation.message_count} messages</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={handleArchive}
                                        disabled={isArchiving || messages.length < 2}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                                        title={messages.length < 2 ? "Need at least one exchange (2 messages) to plant seeds" : "Plant seeds from this conversation"}
                                    >
                                        {isArchiving ? (
                                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        )}
                                        Plant Seeds
                                    </button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {isLoadingConversation ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-center">
                                        <div>
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500">Start the conversation</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Share something about yourself
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                                                    msg.role === 'user'
                                                        ? 'bg-blue-500 text-white rounded-tr-sm'
                                                        : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
                                                }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}

                                {/* Typing indicator */}
                                {isSending && (
                                    <div className="flex justify-start">
                                        <div className="bg-white text-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-200">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Send Error */}
                            {sendError && (
                                <div className="px-6 py-2 bg-red-50 text-red-600 text-sm">
                                    {sendError}
                                </div>
                            )}

                            {/* Message Input */}
                            <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-white border-t border-gray-200 safe-area-bottom">
                                <div className="flex items-end gap-2 md:gap-3">
                                    <textarea
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        placeholder="Share something about yourself..."
                                        rows={1}
                                        className="flex-1 px-3 md:px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none text-base"
                                        style={{ minHeight: '48px', maxHeight: '120px' }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!messageInput.trim() || isSending}
                                        className="p-3.5 md:p-3 bg-primary text-gray-800 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex-shrink-0"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        /* No Conversation Selected */
                        <div className="flex-1 flex items-center justify-center text-center p-8">
                            <div>
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">Plant Seeds</h2>
                                <p className="text-gray-500 max-w-md mx-auto mb-6">
                                    Have natural conversations about yourself. When you're done,
                                    plant the conversation as seeds to help your Kaksos learn about you.
                                </p>
                                <button
                                    onClick={handleNewConversation}
                                    disabled={isCreating}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-gray-800 font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                                >
                                    {isCreating ? (
                                        <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    )}
                                    Start New Conversation
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
