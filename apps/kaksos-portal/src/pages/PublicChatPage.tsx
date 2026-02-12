/**
 * Public Chat Page
 * Allows public visitors to chat with a Kaksos via TelePathCode
 * No authentication required
 *
 * Routes:
 *   /chat/:telepathcode - Direct chat with a Kaksos
 *   /connect/:telepathcode - Alias for chat (legacy support)
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicChatApi, PublicChatMessage, PublicKaksosInfo } from '../lib/api';

// Generate a unique session ID
function generateSessionId(): string {
    return `public_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Format time for display
function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
}

export default function PublicChatPage() {
    const { telepathcode } = useParams<{ telepathcode: string }>();
    const navigate = useNavigate();

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [kaksos, setKaksos] = useState<PublicKaksosInfo | null>(null);
    const [messages, setMessages] = useState<PublicChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [visitorName, setVisitorName] = useState('');
    const [showNamePrompt, setShowNamePrompt] = useState(true);
    const [sessionId] = useState(generateSessionId);

    // Send to Owner state
    const [showSendModal, setShowSendModal] = useState(false);
    const [sendEmail, setSendEmail] = useState('');
    const [isSendingConversation, setIsSendingConversation] = useState(false);
    const [conversationSent, setConversationSent] = useState(false);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Look up Kaksos on mount
    useEffect(() => {
        async function lookupKaksos() {
            if (!telepathcode) {
                setError('No TelePathCode provided');
                setIsLoading(false);
                return;
            }

            try {
                const result = await publicChatApi.lookup(telepathcode);

                if (!result.success || !result.kaksos) {
                    setError(result.error || 'Kaksos not found');
                    setIsLoading(false);
                    return;
                }

                setKaksos(result.kaksos);
                setIsLoading(false);
            } catch (err) {
                console.error('Lookup error:', err);
                setError(err instanceof Error ? err.message : 'Failed to connect');
                setIsLoading(false);
            }
        }

        lookupKaksos();
    }, [telepathcode]);

    // Handle name submission
    function handleNameSubmit(e: React.FormEvent) {
        e.preventDefault();
        const name = visitorName.trim();
        if (name) {
            setShowNamePrompt(false);
            // Add welcome message from Kaksos
            if (kaksos) {
                setMessages([{
                    sender: 'kaksos',
                    text: `Hello ${name}! I'm ${kaksos.kaksosName}, ${kaksos.ownerName}'s personal assistant. How can I help you today?`,
                    timestamp: new Date(),
                }]);
            }
            // Focus input after name is set
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }

    // Skip name and continue as anonymous
    function handleSkipName() {
        setVisitorName('Visitor');
        setShowNamePrompt(false);
        if (kaksos) {
            setMessages([{
                sender: 'kaksos',
                text: `Hello! I'm ${kaksos.kaksosName}, ${kaksos.ownerName}'s personal assistant. How can I help you today?`,
                timestamp: new Date(),
            }]);
        }
        setTimeout(() => inputRef.current?.focus(), 100);
    }

    // Send message
    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault();
        const text = inputMessage.trim();

        if (!text || !kaksos || isSending) return;

        // Add user message immediately
        const userMessage: PublicChatMessage = {
            sender: 'user',
            text,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsSending(true);

        try {
            const result = await publicChatApi.sendMessage({
                bobyPlaceId: kaksos.bobyPlaceId,
                sessionId,
                visitorName: visitorName || 'Visitor',
                message: text,
                conversationHistory: [...messages, userMessage],
            });

            if (result.success && result.response) {
                setMessages(prev => [...prev, {
                    sender: 'kaksos',
                    text: result.response!,
                    timestamp: new Date(),
                }]);
            } else {
                setMessages(prev => [...prev, {
                    sender: 'kaksos',
                    text: "I'm having trouble responding right now. Please try again in a moment.",
                    timestamp: new Date(),
                }]);
            }
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, {
                sender: 'kaksos',
                text: "I'm having trouble connecting. Please check your connection and try again.",
                timestamp: new Date(),
            }]);
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    }

    // Send conversation to owner
    async function handleSendConversation() {
        if (!kaksos) return;
        setIsSendingConversation(true);
        try {
            const result = await publicChatApi.sendConversation({
                bobyPlaceId: kaksos.bobyPlaceId,
                sessionId,
                visitorName: visitorName || 'Visitor',
                visitorEmail: sendEmail.trim() || undefined,
                conversationHistory: messages,
            });
            if (result.success) {
                setConversationSent(true);
                setShowSendModal(false);
            }
        } catch (err) {
            console.error('Send conversation error:', err);
        } finally {
            setIsSendingConversation(false);
        }
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Connecting to Kaksos...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !kaksos) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Kaksos Not Found</h1>
                    <p className="text-gray-600 mb-6">
                        {error || 'The TelePathCode you entered is not valid or the Kaksos is not available for public chat.'}
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                        TelePathCode: <code className="bg-gray-100 px-2 py-1 rounded">{telepathcode}</code>
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    // Name prompt
    if (showNamePrompt) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">{kaksos.kaksosName.charAt(0)}</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">{kaksos.kaksosName}</h1>
                        <p className="text-gray-600">Personal assistant of {kaksos.ownerName}</p>
                    </div>

                    {/* Name form */}
                    <form onSubmit={handleNameSubmit}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            What's your name?
                        </label>
                        <input
                            type="text"
                            value={visitorName}
                            onChange={e => setVisitorName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 mb-4"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!visitorName.trim()}
                            className="w-full py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                        >
                            Start Chat
                        </button>
                        <button
                            type="button"
                            onClick={handleSkipName}
                            className="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                        >
                            Continue anonymously
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Chat interface
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-semibold text-amber-700">{kaksos.kaksosName.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-semibold text-gray-800 truncate">{kaksos.kaksosName}</h1>
                        <p className="text-sm text-gray-500 truncate">Personal assistant of {kaksos.ownerName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Online
                    </div>
                </div>
            </header>

            {/* Messages */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                    msg.sender === 'user'
                                        ? 'bg-gray-200 text-gray-800 rounded-tr-sm'
                                        : 'bg-amber-400 text-gray-900 rounded-tl-sm'
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                <p className={`text-xs mt-1 ${
                                    msg.sender === 'user' ? 'text-gray-500' : 'text-amber-700'
                                }`}>
                                    {formatTime(msg.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isSending && (
                        <div className="flex justify-start">
                            <div className="bg-amber-100 rounded-2xl rounded-tl-sm px-4 py-3">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input */}
            <footer className="bg-white border-t border-gray-200">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    {/* Send to Owner banner */}
                    {messages.length >= 2 && (
                        <div className="mb-3 flex justify-center">
                            {conversationSent ? (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Sent to {kaksos.ownerName}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowSendModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Send to {kaksos.ownerName}
                                </button>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputMessage}
                            onChange={e => setInputMessage(e.target.value)}
                            placeholder={`Message ${kaksos.kaksosName}...`}
                            disabled={isSending}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!inputMessage.trim() || isSending}
                            className="p-3 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-400 mt-3">
                        Powered by <a href="https://getboby.ai" className="text-amber-600 hover:underline">Kaksos</a>
                    </p>
                </div>
            </footer>

            {/* Send to Owner Modal */}
            {showSendModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">
                            Send to {kaksos.ownerName}?
                        </h2>
                        <p className="text-sm text-gray-600 mb-5">
                            This conversation ({messages.length} messages) will be shared with {kaksos.ownerName} for their review.
                        </p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
                                <input
                                    type="text"
                                    value={visitorName}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Your email <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="email"
                                    value={sendEmail}
                                    onChange={e => setSendEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    autoFocus
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    So {kaksos.ownerName} can reply to you directly
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSendModal(false)}
                                disabled={isSendingConversation}
                                className="flex-1 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendConversation}
                                disabled={isSendingConversation}
                                className="flex-1 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSendingConversation ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
