/**
 * Kaksos Portal - Nurture Page v2
 * Circle perspective testing, feedback, and growth progress
 * Per SPEC_Nurture_v2.md
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { nurtureApi, circlesApi, CircleLevel, NurtureChatResponse, NurtureStatsResponse, NurturePendingSeedsResponse } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';

// Circle configuration
const CIRCLES: { value: CircleLevel; label: string; color: string; bgColor: string; description: string }[] = [
    { value: 'center', label: 'Centre', color: 'text-purple-700', bgColor: 'bg-purple-100', description: 'Your closest circle - family, partners' },
    { value: 'inner', label: 'Inner', color: 'text-blue-700', bgColor: 'bg-blue-100', description: 'Close friends and trusted colleagues' },
    { value: 'mid', label: 'Mid', color: 'text-green-700', bgColor: 'bg-green-100', description: 'Friends and regular contacts' },
    { value: 'outer', label: 'Outer', color: 'text-yellow-700', bgColor: 'bg-yellow-100', description: 'Acquaintances and casual contacts' },
    { value: 'public', label: 'Public', color: 'text-gray-700', bgColor: 'bg-gray-100', description: 'Anyone - public information only' },
];

function getCircleConfig(level: string) {
    return CIRCLES.find(c => c.value === level) || CIRCLES[4];
}

interface CircleMember {
    id: string;
    member_user_id: string;
    member_name: string;
    member_email: string;
    circle_level: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    responseId?: string;
    sources?: NurtureChatResponse['sources'];
    memoryContext?: NurtureChatResponse['memoryContext'];
}

export default function NurturePage() {
    const { user } = useAuth();
    const bobyPlaceId = user?.id || '';

    // Circle perspective state
    const [selectedCircle, setSelectedCircle] = useState<CircleLevel>('center');
    const [circleMembers, setCircleMembers] = useState<CircleMember[]>([]);
    const [selectedMember, setSelectedMember] = useState<CircleMember | null>(null);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showCircleModal, setShowCircleModal] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const [showChatModal, setShowChatModal] = useState(false);

    // Chat state
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [lastResponseId, setLastResponseId] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Feedback state
    const [correctionText, setCorrectionText] = useState('');
    const [feedbackLoading, setFeedbackLoading] = useState(false);
    const [lastQAPair, setLastQAPair] = useState<{ question: string; answer: string } | null>(null);

    // Multi-circle approval modal state
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalType, setApprovalType] = useState<'good' | 'correct' | 'never'>('good');
    const [selectedCircles, setSelectedCircles] = useState<Set<CircleLevel>>(new Set());

    // Stats and pending
    const [stats, setStats] = useState<NurtureStatsResponse | null>(null);
    const [pendingSeeds, setPendingSeeds] = useState<NurturePendingSeedsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Seed review state
    const [selectedSeed, setSelectedSeed] = useState<{
        id: string;
        question: string;
        answer: string;
        circle_level: string;
        review_reason?: string;
    } | null>(null);
    const [showSeedReviewModal, setShowSeedReviewModal] = useState(false);
    const [seedActionLoading, setSeedActionLoading] = useState(false);

    // Fetch initial data
    useEffect(() => {
        if (!bobyPlaceId) return;
        fetchAllData();
    }, [bobyPlaceId]);

    // Fetch circle members when circle changes
    useEffect(() => {
        if (!bobyPlaceId) return;
        fetchCircleMembers();
    }, [bobyPlaceId, selectedCircle]);

    // Scroll to bottom on new messages
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function fetchAllData() {
        setIsLoading(true);
        try {
            const [statsRes, pendingRes] = await Promise.all([
                nurtureApi.getStats(bobyPlaceId),
                nurtureApi.getPendingSeeds(bobyPlaceId),
            ]);
            setStats(statsRes);
            setPendingSeeds(pendingRes);
        } catch (err) {
            console.error('Failed to fetch nurture data:', err);
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchCircleMembers() {
        try {
            const response = await circlesApi.listMembers(bobyPlaceId, selectedCircle);
            setCircleMembers(response.members.map(m => ({
                id: m.id,
                member_user_id: m.peeler_id,
                member_name: m.peeler_name || 'Unknown',
                member_email: m.peeler_email || '',
                circle_level: m.circle_level,
            })));
        } catch (err) {
            console.error('Failed to fetch circle members:', err);
            setCircleMembers([]);
        }
    }

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!inputMessage.trim() || isSending) return;

        const userMessage: ChatMessage = {
            id: `user_${Date.now()}`,
            role: 'user',
            content: inputMessage.trim(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsSending(true);

        try {
            const response = await nurtureApi.chat({
                bobyPlaceId,
                message: userMessage.content,
                circleLevel: selectedCircle,
                memberId: selectedMember?.member_user_id,
                memberName: selectedMember?.member_name,
            });

            const assistantMessage: ChatMessage = {
                id: response.responseId,
                role: 'assistant',
                content: response.message,
                responseId: response.responseId,
                sources: response.sources,
                memoryContext: response.memoryContext,
            };

            setMessages(prev => [...prev, assistantMessage]);
            setLastResponseId(response.responseId);
            // Store Q&A pair for "Good" feedback to create trained seed
            setLastQAPair({
                question: userMessage.content,
                answer: response.message,
            });
        } catch (err) {
            const errorMessage: ChatMessage = {
                id: `error_${Date.now()}`,
                role: 'assistant',
                content: `Error: ${err instanceof Error ? err.message : 'Failed to send message'}`,
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsSending(false);
        }
    }

    async function handleFeedback(type: 'good' | 'correct' | 'never') {
        if (!lastResponseId) return;

        // Show multi-circle approval modal for all feedback types
        setApprovalType(type);
        setSelectedCircles(new Set()); // Clear previous selections
        setShowApprovalModal(true);
    }

    async function handleApprovalSubmit() {
        if (!lastResponseId || selectedCircles.size === 0) return;

        // For correction, also need correction text
        if (approvalType === 'correct' && !correctionText.trim()) {
            return;
        }

        setFeedbackLoading(true);
        try {
            // Submit feedback with multiple circles
            const circlesArray = Array.from(selectedCircles);

            await nurtureApi.feedback({
                bobyPlaceId,
                responseId: lastResponseId,
                feedbackType: approvalType,
                // Include Q&A for creating trained seeds
                question: lastQAPair?.question,
                answer: approvalType === 'correct' ? correctionText.trim() : lastQAPair?.answer,
                // Send array of circles
                circleLevels: circlesArray,
                testerName: selectedMember?.member_name || user?.firstName || 'Owner',
                correction: approvalType === 'correct' ? correctionText.trim() : undefined,
            });

            // Show confirmation with circles selected
            const circleNames = circlesArray.map(c => CIRCLES.find(cc => cc.value === c)?.label || c).join(', ');
            const feedbackMsg: ChatMessage = {
                id: `feedback_${Date.now()}`,
                role: 'assistant',
                content: approvalType === 'good'
                    ? `✅ Memory saved to ${circlesArray.length} circle${circlesArray.length > 1 ? 's' : ''}: ${circleNames}`
                    : approvalType === 'correct'
                        ? `✅ Correction saved to ${circlesArray.length} circle${circlesArray.length > 1 ? 's' : ''}: ${circleNames}`
                        : `⛔ "Never say this" boundary set for ${circlesArray.length} circle${circlesArray.length > 1 ? 's' : ''}: ${circleNames}`,
            };
            setMessages(prev => [...prev, feedbackMsg]);
            setLastResponseId(null);
            setLastQAPair(null);
            setShowApprovalModal(false);
            setCorrectionText('');
            setSelectedCircles(new Set());

            // Refresh pending seeds and stats
            const [pendingRes, statsRes] = await Promise.all([
                nurtureApi.getPendingSeeds(bobyPlaceId),
                nurtureApi.getStats(bobyPlaceId),
            ]);
            setPendingSeeds(pendingRes);
            setStats(statsRes);
        } catch (err) {
            console.error('Failed to submit feedback:', err);
        } finally {
            setFeedbackLoading(false);
        }
    }

    function toggleCircleSelection(circle: CircleLevel) {
        setSelectedCircles(prev => {
            const next = new Set(prev);
            if (next.has(circle)) {
                next.delete(circle);
            } else {
                next.add(circle);
            }
            return next;
        });
    }

    function clearChat() {
        setMessages([]);
        setLastResponseId(null);
        setLastQAPair(null);
    }

    // Seed review handlers
    function handleSeedClick(seed: { id: string; question: string; answer: string; circle_level: string; review_reason?: string }) {
        setSelectedSeed(seed);
        setShowSeedReviewModal(true);
    }

    async function handleApproveSeed() {
        if (!selectedSeed) return;
        setSeedActionLoading(true);
        try {
            const token = localStorage.getItem('boby_kaksos_token');
            const response = await fetch(`https://kaksos.getboby.ai/api/nurture/seed/${selectedSeed.id}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                    'X-Boby-Place-Id': bobyPlaceId,
                    'X-User-Id': user?.id || '',
                },
                body: JSON.stringify({ circleLevel: selectedSeed.circle_level }),
            });
            if (response.ok) {
                setShowSeedReviewModal(false);
                setSelectedSeed(null);
                // Refresh pending seeds
                const pendingRes = await nurtureApi.getPendingSeeds(bobyPlaceId);
                setPendingSeeds(pendingRes);
            }
        } catch (err) {
            console.error('Failed to approve seed:', err);
        } finally {
            setSeedActionLoading(false);
        }
    }

    async function handleRejectSeed(reason?: string) {
        if (!selectedSeed) return;
        setSeedActionLoading(true);
        try {
            const token = localStorage.getItem('boby_kaksos_token');
            const response = await fetch(`https://kaksos.getboby.ai/api/nurture/seed/${selectedSeed.id}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                    'X-Boby-Place-Id': bobyPlaceId,
                    'X-User-Id': user?.id || '',
                },
                body: JSON.stringify({ reason }),
            });
            if (response.ok) {
                setShowSeedReviewModal(false);
                setSelectedSeed(null);
                // Refresh pending seeds
                const pendingRes = await nurtureApi.getPendingSeeds(bobyPlaceId);
                setPendingSeeds(pendingRes);
            }
        } catch (err) {
            console.error('Failed to reject seed:', err);
        } finally {
            setSeedActionLoading(false);
        }
    }

    function handleTestSeed() {
        if (!selectedSeed) return;
        // Pre-fill the chat input with the seed's question for testing
        setInputMessage(selectedSeed.question);
        setShowSeedReviewModal(false);
        // On mobile, open the chat modal
        setShowChatModal(true);
    }

    const circleConfig = getCircleConfig(selectedCircle);

    // Filter members by search term
    const filteredMembers = useMemo(() => {
        if (!memberSearch.trim()) return circleMembers;
        const search = memberSearch.toLowerCase();
        return circleMembers.filter(m =>
            m.member_name.toLowerCase().includes(search) ||
            m.member_email.toLowerCase().includes(search)
        );
    }, [circleMembers, memberSearch]);

    return (
        <DashboardLayout>
            <div className="h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-0px)] flex flex-col p-4 md:p-6 gap-4 overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Nurture Your Kaksos</h1>
                        <p className="text-gray-500 text-xs md:text-sm mt-1">Test responses from different circle perspectives</p>
                    </div>
                    <button
                        onClick={clearChat}
                        className="px-3 py-2 md:py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors self-start sm:self-auto"
                    >
                        Clear Chat
                    </button>
                </div>

                {/* Main Content - Responsive Grid */}
                <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 gap-4 min-h-0 overflow-hidden">
                    {/* Circle Selector - First on mobile */}
                    <div className="flex-shrink-0 lg:col-span-2 order-1 w-full min-w-0">
                        <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
                            <h3 className="font-medium text-gray-800 text-sm md:text-base mb-3">Testing as Circle</h3>

                            {/* Mobile: Dropdown triggers */}
                            <div className="md:hidden space-y-3">
                                {/* Circle selector trigger */}
                                <button
                                    onClick={() => setShowCircleModal(true)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${circleConfig.bgColor} border border-current ${circleConfig.color}`} />
                                        <span className="font-medium text-gray-800">{circleConfig.label} Circle</span>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Member selector trigger */}
                                <button
                                    onClick={() => {
                                        setMemberSearch('');
                                        setShowMemberModal(true);
                                    }}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-gray-800">{selectedMember?.member_name || `Anonymous ${circleConfig.label}`}</span>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Mobile: Start conversation button */}
                                <button
                                    onClick={() => setShowChatModal(true)}
                                    className="mt-4 w-full py-4 bg-primary text-gray-800 font-medium rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Start Test Conversation
                                    {messages.length > 0 && (
                                        <span className="ml-1 px-2 py-0.5 bg-white/30 rounded-full text-xs">
                                            {messages.length}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Desktop: Inline buttons */}
                            <div className="hidden md:block">
                                <div className="flex gap-2">
                                    {CIRCLES.map(circle => (
                                        <button
                                            key={circle.value}
                                            onClick={() => {
                                                setSelectedCircle(circle.value);
                                                setSelectedMember(null);
                                            }}
                                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedCircle === circle.value
                                                ? `${circle.bgColor} ${circle.color} ring-2 ring-offset-1 ring-current`
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {circle.label}
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-2 text-xs text-gray-500">{circleConfig.description}</p>

                                {/* Member selector button - desktop */}
                                <button
                                    onClick={() => {
                                        setMemberSearch('');
                                        setShowMemberModal(true);
                                    }}
                                    className="mt-3 w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="truncate">{selectedMember ? `Testing as ${selectedMember.member_name}` : `Test as ${circleConfig.label} member`}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Needs Pruning - Mobile only (order-2), expands to fill space */}
                    <div className="flex-1 min-h-0 order-2 lg:hidden">
                        <div className="h-full bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
                            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-medium text-gray-800 text-sm">Needs Pruning</h3>
                                {pendingSeeds && pendingSeeds.summary.totalNeedsAttention > 0 && (
                                    <span className="text-xs text-amber-600 font-medium">
                                        {pendingSeeds.summary.totalNeedsAttention} seeds
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 overflow-y-auto p-3">
                                {isLoading ? (
                                    <div className="animate-pulse space-y-2">
                                        {[1, 2].map(i => (
                                            <div key={i} className="h-10 bg-gray-100 rounded" />
                                        ))}
                                    </div>
                                ) : pendingSeeds && pendingSeeds.summary.totalNeedsAttention > 0 ? (
                                    <div className="space-y-2">
                                        {pendingSeeds.needsReview.map(seed => (
                                            <button
                                                key={seed.id}
                                                onClick={() => handleSeedClick(seed)}
                                                className="w-full text-left p-2 bg-amber-50 border border-amber-100 rounded-lg hover:bg-amber-100 transition-colors"
                                            >
                                                <p className="text-xs text-amber-800 font-medium line-clamp-1">{seed.question}</p>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-4">
                                        <div className="flex items-center gap-2 text-green-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-sm">All caught up!</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat Interface - Third on mobile (order-3) */}
                    <div className="hidden md:block flex-1 min-h-0 order-3 lg:order-1 lg:col-span-2">
                        <div className="h-full min-h-[200px] bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                                {messages.length === 0 ? (
                                    <>
                                        {/* Mobile: Compact prompt */}
                                        <div className="md:hidden py-6 text-center">
                                            <div className={`w-10 h-10 ${circleConfig.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                                                <svg className={`w-5 h-5 ${circleConfig.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 text-sm px-4">
                                                Send a message to test as{' '}
                                                <span className={`font-medium ${circleConfig.color}`}>{circleConfig.label}</span>
                                                {selectedMember && (
                                                    <span className="text-gray-400"> ({selectedMember.member_name})</span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Desktop: Full illustration */}
                                        <div className="hidden md:flex h-full items-center justify-center text-center">
                                            <div>
                                                <div className={`w-16 h-16 ${circleConfig.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                                    <svg className={`w-8 h-8 ${circleConfig.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                </div>
                                                <p className="text-gray-500 font-medium">Test as {circleConfig.label} circle</p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    Send a message to see how your Kaksos responds at this access level
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    messages.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                                    ? 'bg-primary text-gray-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                                                {/* Memory context indicator */}
                                                {msg.memoryContext && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                                                        <span className="font-medium">Context:</span> {msg.memoryContext.totalMemories} memories
                                                        ({msg.memoryContext.byType.seeds} seeds, {msg.memoryContext.byType.personalSubsets} personal)
                                                    </div>
                                                )}

                                                {/* Sources */}
                                                {msg.sources && msg.sources.length > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                        <p className="text-xs text-gray-500 mb-1">Sources:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {msg.sources.slice(0, 3).map((src, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-2 py-0.5 bg-white rounded text-xs text-gray-600"
                                                                >
                                                                    {src.type === 'planted_by' && src.peelerName
                                                                        ? `From ${src.peelerName}`
                                                                        : src.type === 'personal_memory'
                                                                            ? 'Personal memory'
                                                                            : src.type}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Feedback Buttons */}
                            {lastResponseId && (
                                <div className="px-3 md:px-4 py-2 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <span className="text-xs text-gray-500 hidden sm:block mr-2">How was this response?</span>
                                    <div className="flex gap-2 flex-1 sm:flex-none">
                                        <button
                                            onClick={() => handleFeedback('good')}
                                            disabled={feedbackLoading}
                                            className="flex-1 sm:flex-none min-h-[44px] sm:min-h-0 px-3 py-2.5 sm:py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                                        >
                                            Good
                                        </button>
                                        <button
                                            onClick={() => handleFeedback('correct')}
                                            disabled={feedbackLoading}
                                            className="flex-1 sm:flex-none min-h-[44px] sm:min-h-0 px-3 py-2.5 sm:py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                                        >
                                            Correct
                                        </button>
                                        <button
                                            onClick={() => handleFeedback('never')}
                                            disabled={feedbackLoading}
                                            className="flex-1 sm:flex-none min-h-[44px] sm:min-h-0 px-3 py-2.5 sm:py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                        >
                                            Never
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Input */}
                            <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t border-gray-200 safe-area-bottom">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder={`Test as ${selectedMember?.member_name || circleConfig.label}...`}
                                        className="flex-1 min-h-[44px] px-3 md:px-4 py-3 md:py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                                        disabled={isSending}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputMessage.trim() || isSending}
                                        className="min-h-[44px] min-w-[44px] px-4 py-3 md:py-2.5 bg-primary text-gray-800 font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {isSending ? (
                                            <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column - Stats & Pending Seeds (Desktop only) */}
                    <div className="hidden lg:flex flex-col gap-4 min-h-0 order-4 overflow-hidden">
                        {/* Quick Stats - Hidden on mobile until properly implemented */}
                        <div className="hidden lg:block bg-white rounded-xl border border-gray-200 p-3 md:p-4">
                            <h3 className="font-medium text-gray-800 mb-3 text-sm md:text-base">Growth Progress</h3>
                            {isLoading ? (
                                <div className="animate-pulse space-y-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-8 bg-gray-100 rounded" />
                                    ))}
                                </div>
                            ) : stats ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Total Seeds</span>
                                        <span className="text-lg font-bold text-gray-800">{stats.seeds.total}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">This Week</span>
                                        <span className="text-lg font-bold text-green-600">+{stats.activity.seedsThisWeek}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Contributors</span>
                                        <span className="text-lg font-bold text-blue-600">{stats.personalSubsets.uniqueContributors}</span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                            <span>Feedback Health</span>
                                            <span>{stats.feedback.good} good / {stats.feedback.corrections} corrections</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            {stats.feedback.total > 0 && (
                                                <div
                                                    className="h-full bg-green-500 rounded-full"
                                                    style={{ width: `${(stats.feedback.good / stats.feedback.total) * 100}%` }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No stats available</p>
                            )}
                        </div>

                        {/* Seeds by Circle - Hidden on mobile until properly implemented */}
                        <div className="hidden lg:block bg-white rounded-xl border border-gray-200 p-4">
                            <h3 className="font-medium text-gray-800 mb-3">Seeds by Circle</h3>
                            {isLoading ? (
                                <div className="animate-pulse space-y-2">
                                    {CIRCLES.map(c => (
                                        <div key={c.value} className="h-6 bg-gray-100 rounded" />
                                    ))}
                                </div>
                            ) : stats ? (
                                <div className="space-y-2">
                                    {CIRCLES.map(circle => {
                                        const circleStats = stats.seeds.byCircle[circle.value];
                                        const count = circleStats?.active || 0;
                                        const maxCount = Math.max(...Object.values(stats.seeds.byCircle).map(c => c?.active || 0), 1);
                                        return (
                                            <div key={circle.value} className="flex items-center gap-2">
                                                <span className={`text-xs font-medium w-14 ${circle.color}`}>{circle.label}</span>
                                                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${circle.bgColor} rounded-full transition-all`}
                                                        style={{ width: `${(count / maxCount) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-600 w-8 text-right">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>

                        {/* Needs Pruning */}
                        <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col min-h-0">
                            <div className="p-4 border-b border-gray-100">
                                <h3 className="font-medium text-gray-800">Needs Pruning</h3>
                                {pendingSeeds && pendingSeeds.summary.totalNeedsAttention > 0 && (
                                    <span className="text-xs text-amber-600 font-medium">
                                        {pendingSeeds.summary.totalNeedsAttention} seeds
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {isLoading ? (
                                    <div className="animate-pulse space-y-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-12 bg-gray-100 rounded" />
                                        ))}
                                    </div>
                                ) : pendingSeeds && pendingSeeds.summary.totalNeedsAttention > 0 ? (
                                    <div className="space-y-2">
                                        {pendingSeeds.needsReview.map(seed => (
                                            <button
                                                key={seed.id}
                                                onClick={() => handleSeedClick(seed)}
                                                className="w-full text-left p-3 bg-amber-50 border border-amber-100 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                                            >
                                                <p className="text-xs text-amber-800 font-medium line-clamp-1">{seed.question}</p>
                                                <p className="text-xs text-amber-600 mt-1">{seed.review_reason}</p>
                                            </button>
                                        ))}
                                        {pendingSeeds.pendingCorrections.map(corr => (
                                            <div
                                                key={corr.id}
                                                className="p-3 bg-blue-50 border border-blue-100 rounded-lg"
                                            >
                                                <p className="text-xs text-blue-800 font-medium">Correction pending</p>
                                                <p className="text-xs text-blue-600 mt-1 line-clamp-2">{corr.suggested_answer}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-center">
                                        <div>
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 text-sm">All caught up!</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Circle Selection Modal (Mobile) */}
            {showCircleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">Select Circle</h3>
                            <button
                                onClick={() => setShowCircleModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {CIRCLES.map(circle => (
                                <button
                                    key={circle.value}
                                    onClick={() => {
                                        setSelectedCircle(circle.value);
                                        setSelectedMember(null);
                                        setShowCircleModal(false);
                                    }}
                                    className={`w-full p-4 rounded-lg border text-left transition-colors ${selectedCircle === circle.value
                                        ? `${circle.bgColor} border-current ${circle.color}`
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-4 h-4 rounded-full ${circle.bgColor} border-2 border-current ${circle.color}`} />
                                            <span className={`font-medium ${selectedCircle === circle.value ? circle.color : 'text-gray-800'}`}>
                                                {circle.label}
                                            </span>
                                        </div>
                                        {selectedCircle === circle.value && (
                                            <svg className={`w-5 h-5 ${circle.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 ml-7">{circle.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Member Selection Modal */}
            {showMemberModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Select {circleConfig.label} Member
                            </h3>
                            <button
                                onClick={() => setShowMemberModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Search input */}
                        <div className="p-4 border-b border-gray-100">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    placeholder="Search members..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 safe-area-bottom">
                            {/* Anonymous option - always visible */}
                            <button
                                onClick={() => {
                                    setSelectedMember(null);
                                    setShowMemberModal(false);
                                }}
                                className={`w-full p-4 md:p-3 rounded-lg border text-left mb-3 transition-colors ${!selectedMember
                                    ? 'border-primary bg-primary-light'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <p className="font-medium text-gray-800">Anonymous {circleConfig.label}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Test without a specific member context</p>
                            </button>

                            {/* Members list header */}
                            {circleMembers.length > 0 && (
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                    Members ({filteredMembers.length})
                                </p>
                            )}

                            {/* Filtered members list */}
                            {filteredMembers.length > 0 ? (
                                <div className="space-y-2">
                                    {filteredMembers.map(member => (
                                        <button
                                            key={member.id}
                                            onClick={() => {
                                                setSelectedMember(member);
                                                setShowMemberModal(false);
                                            }}
                                            className={`w-full p-4 md:p-3 rounded-lg border text-left transition-colors ${selectedMember?.id === member.id
                                                ? 'border-primary bg-primary-light'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <p className="font-medium text-gray-800">{member.member_name}</p>
                                            {member.member_email && (
                                                <p className="text-xs text-gray-500 mt-0.5">{member.member_email}</p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : circleMembers.length > 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-sm">No members match "{memberSearch}"</p>
                                    <button
                                        onClick={() => setMemberSearch('')}
                                        className="text-primary text-sm mt-1 hover:underline"
                                    >
                                        Clear search
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 text-sm">No members in {circleConfig.label} circle</p>
                                    <p className="text-gray-400 text-xs mt-1">Add members in Circle Management</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Seed Review Modal */}
            {showSeedReviewModal && selectedSeed && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Review Seed</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getCircleConfig(selectedSeed.circle_level).bgColor} ${getCircleConfig(selectedSeed.circle_level).color}`}>
                                    {getCircleConfig(selectedSeed.circle_level).label} Circle
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    setShowSeedReviewModal(false);
                                    setSelectedSeed(null);
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-800">
                                    {selectedSeed.question}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-800 whitespace-pre-wrap">
                                    {selectedSeed.answer}
                                </div>
                            </div>
                            {selectedSeed.review_reason && (
                                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                                    <p className="text-xs text-amber-800 font-medium">Review Reason</p>
                                    <p className="text-sm text-amber-700 mt-1">{selectedSeed.review_reason}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-3 safe-area-bottom">
                            <button
                                onClick={handleTestSeed}
                                className="px-4 py-3 sm:py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2 order-2 sm:order-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Test in Chat
                            </button>
                            <div className="flex gap-2 order-1 sm:order-2">
                                <button
                                    onClick={() => handleRejectSeed()}
                                    disabled={seedActionLoading}
                                    className="flex-1 sm:flex-none px-4 py-3 sm:py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={handleApproveSeed}
                                    disabled={seedActionLoading}
                                    className="flex-1 sm:flex-none px-4 py-3 sm:py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {seedActionLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Multi-Circle Approval Modal */}
            {showApprovalModal && lastQAPair && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {approvalType === 'good' ? 'Approve Memory' : approvalType === 'correct' ? 'Save Correction' : 'Set Boundary'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {approvalType === 'good'
                                    ? 'This Q&A will become permanent knowledge'
                                    : approvalType === 'correct'
                                        ? 'Your correction will be saved as permanent knowledge'
                                        : 'This will prevent Kaksos from saying this'}
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Permanence Warning */}
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm font-medium text-amber-800">This memory will become permanent</p>
                                        <p className="text-xs text-amber-700 mt-1">
                                            Once approved, this Q&A cannot be edited or deleted, only suppressed with a boundary.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Q&A Preview */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Question</label>
                                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-800">
                                        {lastQAPair.question}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        {approvalType === 'correct' ? 'Corrected Answer' : 'Answer'}
                                    </label>
                                    {approvalType === 'correct' ? (
                                        <textarea
                                            value={correctionText}
                                            onChange={(e) => setCorrectionText(e.target.value)}
                                            placeholder="Enter the correct answer..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none text-sm"
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-800 whitespace-pre-wrap">
                                            {lastQAPair.answer}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Circle Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select which circles should have access to this knowledge:
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    Select any combination, each circle stores separately
                                </p>
                                <div className="space-y-2">
                                    {CIRCLES.map(circle => (
                                        <label
                                            key={circle.value}
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedCircles.has(circle.value)
                                                ? `${circle.bgColor} border-current ${circle.color}`
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedCircles.has(circle.value)}
                                                onChange={() => toggleCircleSelection(circle.value)}
                                                className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                                            />
                                            <div className="flex-1">
                                                <span className={`font-medium ${selectedCircles.has(circle.value) ? circle.color : 'text-gray-800'}`}>
                                                    {circle.label}
                                                </span>
                                                <p className="text-xs text-gray-500 mt-0.5">{circle.description}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end gap-2 safe-area-bottom">
                            <button
                                onClick={() => {
                                    setShowApprovalModal(false);
                                    setCorrectionText('');
                                    setSelectedCircles(new Set());
                                }}
                                className="px-4 py-3 sm:py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApprovalSubmit}
                                disabled={selectedCircles.size === 0 || feedbackLoading || (approvalType === 'correct' && !correctionText.trim())}
                                className={`px-4 py-3 sm:py-2 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${approvalType === 'never'
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                {feedbackLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                <span className="hidden sm:inline">
                                    {approvalType === 'never'
                                        ? `Set Boundary for ${selectedCircles.size} Circle${selectedCircles.size !== 1 ? 's' : ''}`
                                        : `Approve to ${selectedCircles.size} Circle${selectedCircles.size !== 1 ? 's' : ''}`}
                                </span>
                                <span className="sm:hidden">
                                    {approvalType === 'never' ? 'Set Boundary' : 'Approve'} ({selectedCircles.size})
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Chat Modal */}
            {showChatModal && (
                <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col" style={{ height: '100dvh' }}>
                    {/* Header */}
                    <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white safe-area-top">
                        <div>
                            <h2 className="font-semibold text-gray-800">
                                Test as {circleConfig.label}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {selectedMember?.member_name || 'Anonymous'}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowChatModal(false)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-center">
                                <div>
                                    <div className={`w-16 h-16 ${circleConfig.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                        <svg className={`w-8 h-8 ${circleConfig.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 font-medium">Test as {circleConfig.label}</p>
                                    <p className="text-gray-400 text-sm mt-1 px-8">
                                        Send a message to see how your Kaksos responds at this access level
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
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                            ? 'bg-primary text-gray-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                                        {/* Memory context indicator */}
                                        {msg.memoryContext && (
                                            <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                                                <span className="font-medium">Context:</span> {msg.memoryContext.totalMemories} memories
                                            </div>
                                        )}

                                        {/* Sources */}
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                <p className="text-xs text-gray-500 mb-1">Sources:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {msg.sources.slice(0, 3).map((src, i) => (
                                                        <span
                                                            key={i}
                                                            className="px-2 py-0.5 bg-white rounded text-xs text-gray-600"
                                                        >
                                                            {src.type === 'planted_by' && src.peelerName
                                                                ? `From ${src.peelerName}`
                                                                : src.type === 'personal_memory'
                                                                    ? 'Personal memory'
                                                                    : src.type}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Feedback Buttons */}
                    {lastResponseId && (
                        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-2 text-center">How was this response?</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleFeedback('good')}
                                    disabled={feedbackLoading}
                                    className="flex-1 min-h-[44px] px-3 py-2.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                                >
                                    Good
                                </button>
                                <button
                                    onClick={() => handleFeedback('correct')}
                                    disabled={feedbackLoading}
                                    className="flex-1 min-h-[44px] px-3 py-2.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                                >
                                    Correct
                                </button>
                                <button
                                    onClick={() => handleFeedback('never')}
                                    disabled={feedbackLoading}
                                    className="flex-1 min-h-[44px] px-3 py-2.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                    Never
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="flex-shrink-0 p-4 border-t border-gray-200 bg-white" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder={`Message as ${selectedMember?.member_name || circleConfig.label}...`}
                                className="flex-1 min-h-[44px] px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                                disabled={isSending}
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isSending}
                                className="min-h-[44px] min-w-[44px] px-4 py-3 bg-primary text-gray-800 font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center"
                            >
                                {isSending ? (
                                    <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
}
