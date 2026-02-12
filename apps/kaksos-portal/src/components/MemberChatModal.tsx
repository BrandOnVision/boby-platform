/**
 * MemberChatModal - Chat with a Kaksos as a circle member
 * Used from CircleManagementPage to test/simulate member conversations
 */

import { useState, useEffect, useRef } from 'react';
import { memberChatApi, MemberChatMessage, CircleLevel } from '../lib/api';

interface MemberChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    bobyPlaceId: string;
    memberPeelerId: string;
    memberName: string;
    memberCircle: CircleLevel;
}

const CIRCLE_COLORS: Record<string, { bg: string; text: string }> = {
    center: { bg: 'bg-purple-100', text: 'text-purple-700' },
    centre: { bg: 'bg-purple-100', text: 'text-purple-700' },
    inner: { bg: 'bg-green-100', text: 'text-green-700' },
    mid: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    outer: { bg: 'bg-orange-100', text: 'text-orange-700' },
    public: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

export default function MemberChatModal({
    isOpen, onClose, bobyPlaceId, memberPeelerId, memberName, memberCircle
}: MemberChatModalProps) {
    const [messages, setMessages] = useState<MemberChatMessage[]>([]);
    const [conversationId, setConversationId] = useState<string | undefined>();
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fresh conversation every time modal opens (training simulation = clean slate)
    useEffect(() => {
        if (!isOpen) return;
        setMessages([]);
        setConversationId(undefined);
        setError(null);
    }, [isOpen, memberPeelerId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        const text = inputText.trim();
        if (!text || isSending) return;

        setInputText('');
        setError(null);

        // Optimistically add user message
        const userMsg: MemberChatMessage = {
            role: 'user',
            content: text,
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMsg]);
        setIsSending(true);

        try {
            const result = await memberChatApi.send({
                bobyPlaceId,
                memberPeelerId,
                message: text,
                conversationId,
            });

            if (!result.success) {
                setError(result.error || 'Failed to send message');
                setIsSending(false);
                return;
            }

            if (result.conversationId) {
                setConversationId(result.conversationId);
            }

            // Add assistant response
            const assistantMsg: MemberChatMessage = {
                role: 'assistant',
                content: result.response || '',
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, assistantMsg]);

            if (result.limitReached) {
                setError('Daily chat limit reached for this Kaksos.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send');
        } finally {
            setIsSending(false);
        }
    }

    async function handleClose() {
        // Archive conversation on close if there are messages worth extracting
        if (conversationId && messages.length >= 2) {
            try {
                await memberChatApi.archive({ bobyPlaceId, conversationId });
            } catch (err) {
                console.error('Archive error:', err);
            }
        }
        onClose();
    }

    if (!isOpen) return null;

    const circleColor = CIRCLE_COLORS[memberCircle] || CIRCLE_COLORS.public;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl flex flex-col"
                 style={{ maxHeight: 'min(85vh, 700px)' }}>
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-amber-700">
                                {memberName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">
                                Chat as {memberName}
                            </h3>
                            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${circleColor.bg} ${circleColor.text}`}>
                                {memberCircle} circle
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded flex-shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-400 text-sm">
                                Start a conversation as {memberName}
                            </p>
                            <p className="text-gray-300 text-xs mt-1">
                                Your Kaksos will respond at the {memberCircle} circle level
                            </p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                                    msg.role === 'user'
                                        ? 'bg-amber-100 text-gray-800 rounded-br-sm'
                                        : 'bg-gray-100 text-gray-700 rounded-bl-sm'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))
                    )}
                    {isSending && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 px-3 py-2 rounded-xl rounded-bl-sm text-sm text-gray-400">
                                <span className="inline-flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Error */}
                {error && (
                    <div className="flex-shrink-0 px-4 pb-2">
                        <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
                            {error}
                        </div>
                    </div>
                )}

                {/* Input */}
                <form onSubmit={handleSend} className="flex-shrink-0 p-3 border-t border-gray-200">
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            placeholder={`Message as ${memberName}...`}
                            disabled={isSending}
                            className="flex-1 min-h-[44px] px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={isSending || !inputText.trim()}
                            className="min-h-[44px] px-4 py-2 bg-amber-400 text-gray-800 font-medium rounded-xl hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 text-center">
                        Training simulation — your Kaksos responds at {memberCircle} circle access
                    </p>
                </form>
            </div>
        </div>
    );
}
