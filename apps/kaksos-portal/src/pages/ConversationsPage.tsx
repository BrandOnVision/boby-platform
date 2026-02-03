/**
 * Kaksos Portal - Conversations Page
 * View chat history with your AI Twin
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { conversationsApi, Conversation } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';

// Circle badge colors
const CIRCLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    center: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    inner: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    mid: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    outer: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    public: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
};

// Format date for display
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return date.toLocaleDateString('en-AU', { weekday: 'short' });
    } else {
        return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
    }
}

// Truncate text with ellipsis
function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

export default function ConversationsPage() {
    const { user } = useAuth();
    const bobyPlaceId = user?.id || '';

    // State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 20;

    // Fetch conversations
    const fetchConversations = useCallback(async (pageNum: number, append = false) => {
        if (!bobyPlaceId) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await conversationsApi.list(bobyPlaceId, {
                limit,
                offset: (pageNum - 1) * limit,
            });

            if (append) {
                setConversations(prev => [...prev, ...response.data]);
            } else {
                setConversations(response.data);
            }
            setHasMore(response.pagination.hasMore);
            setTotalCount(response.pagination.total);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
            setError(err instanceof Error ? err.message : 'Failed to load conversations');
        } finally {
            setIsLoading(false);
        }
    }, [bobyPlaceId]);

    // Initial fetch
    useEffect(() => {
        fetchConversations(1);
    }, [fetchConversations]);

    // Load more handler
    function handleLoadMore() {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchConversations(nextPage, true);
    }

    // Delete handler
    async function handleDelete(conversation: Conversation) {
        if (!confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        setDeleteError(null);

        try {
            await conversationsApi.delete(conversation.id);
            // Remove from list
            setConversations(prev => prev.filter(c => c.id !== conversation.id));
            // Close detail view if this was selected
            if (selectedConversation?.id === conversation.id) {
                setSelectedConversation(null);
            }
            setTotalCount(prev => prev - 1);
        } catch (err) {
            console.error('Failed to delete conversation:', err);
            setDeleteError(err instanceof Error ? err.message : 'Failed to delete conversation');
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <DashboardLayout>
            <div className="p-8 h-full">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Conversations</h1>
                    <p className="text-gray-500 mt-1">
                        {totalCount > 0 ? `${totalCount} conversation${totalCount !== 1 ? 's' : ''} with your AI Twin` : 'Chat history with your AI Twin'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Delete Error */}
                {deleteError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {deleteError}
                    </div>
                )}

                {/* Loading State */}
                {isLoading && conversations.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading conversations...</p>
                    </div>
                ) : conversations.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2">No conversations yet</h3>
                        <p className="text-gray-500 text-sm">
                            Start chatting with your Kaksos to see your conversation history here.
                        </p>
                    </div>
                ) : (
                    /* Main Content - Split View */
                    <div className="flex gap-6 h-[calc(100vh-220px)]">
                        {/* Conversation List */}
                        <div className="w-1/2 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-800">All Conversations</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {conversations.map((conv) => {
                                    const circleStyle = CIRCLE_COLORS[conv.circle] || CIRCLE_COLORS.public;
                                    const isSelected = selectedConversation?.id === conv.id;

                                    return (
                                        <div
                                            key={conv.id}
                                            onClick={() => setSelectedConversation(conv)}
                                            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                                                isSelected
                                                    ? 'bg-primary-light border-l-4 border-l-primary'
                                                    : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">
                                                        {truncate(conv.user_message, 60)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                                        {truncate(conv.kaksos_response, 80)}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                    <span className="text-xs text-gray-400">
                                                        {formatDate(conv.created_at)}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded ${circleStyle.bg} ${circleStyle.text}`}>
                                                        {conv.circle}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                <span title="Input tokens">{conv.tokens_input} in</span>
                                                <span title="Output tokens">{conv.tokens_output} out</span>
                                                {conv.cost > 0 && (
                                                    <span title="Cost">${conv.cost.toFixed(4)}</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Load More Button */}
                                {hasMore && (
                                    <div className="p-4 text-center">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={isLoading}
                                            className="px-4 py-2 text-sm text-primary-dark hover:bg-primary-light rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {isLoading ? 'Loading...' : 'Load More'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Conversation Detail */}
                        <div className="w-1/2 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                            {selectedConversation ? (
                                <>
                                    {/* Detail Header */}
                                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                        <div>
                                            <h2 className="font-semibold text-gray-800">Conversation Detail</h2>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {new Date(selectedConversation.created_at).toLocaleString('en-AU')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded ${CIRCLE_COLORS[selectedConversation.circle]?.bg} ${CIRCLE_COLORS[selectedConversation.circle]?.text}`}>
                                                {selectedConversation.circle} circle
                                            </span>
                                            <button
                                                onClick={() => handleDelete(selectedConversation)}
                                                disabled={isDeleting}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete conversation"
                                            >
                                                {isDeleting ? (
                                                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {/* User Message */}
                                        <div className="flex justify-end">
                                            <div className="max-w-[80%] bg-blue-500 text-white rounded-2xl rounded-tr-sm px-4 py-3">
                                                <p className="text-sm whitespace-pre-wrap">{selectedConversation.user_message}</p>
                                            </div>
                                        </div>

                                        {/* Kaksos Response */}
                                        <div className="flex justify-start">
                                            <div className="max-w-[80%] bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                                                <p className="text-sm whitespace-pre-wrap">{selectedConversation.kaksos_response}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Footer */}
                                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <div className="flex items-center gap-4">
                                                <span>
                                                    <strong>{selectedConversation.tokens_input}</strong> input tokens
                                                </span>
                                                <span>
                                                    <strong>{selectedConversation.tokens_output}</strong> output tokens
                                                </span>
                                                {selectedConversation.duration_ms > 0 && (
                                                    <span>
                                                        <strong>{(selectedConversation.duration_ms / 1000).toFixed(2)}s</strong> response time
                                                    </span>
                                                )}
                                            </div>
                                            {selectedConversation.cost > 0 && (
                                                <span className="font-medium">
                                                    ${selectedConversation.cost.toFixed(4)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* No Selection */
                                <div className="flex-1 flex items-center justify-center text-center p-8">
                                    <div>
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                                            </svg>
                                        </div>
                                        <h3 className="font-semibold text-gray-800 mb-2">Select a conversation</h3>
                                        <p className="text-gray-500 text-sm">
                                            Click on a conversation from the list to view details
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
