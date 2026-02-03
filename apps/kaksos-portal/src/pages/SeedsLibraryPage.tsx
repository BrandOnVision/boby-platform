/**
 * Seeds Library Page
 * View and manage all 99 seed questions that define Kaksos identity
 * Per SPEC_Seeds_Library.md
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { seedsLibraryApi, SeedQuestion, SeedsLibraryStatsResponse } from '../lib/api';

// Category configuration
const CATEGORIES = [
    { value: 'all', label: 'All (99)', icon: null },
    { value: 'essential', label: 'Essential (33)', icon: '🌱', color: 'bg-green-100 text-green-800' },
    { value: 'deep_roots', label: 'Deep Roots (33)', icon: '🌿', color: 'bg-blue-100 text-blue-800' },
    { value: 'complete', label: 'Complete (33)', icon: '🌳', color: 'bg-purple-100 text-purple-800' },
];

const CATEGORY_ICONS: Record<string, string> = {
    essential: '🌱',
    deep_roots: '🌿',
    complete: '🌳',
};

const CATEGORY_COLORS: Record<string, string> = {
    essential: 'bg-green-100 text-green-800 border-green-300',
    deep_roots: 'bg-blue-100 text-blue-800 border-blue-300',
    complete: 'bg-purple-100 text-purple-800 border-purple-300',
};

export default function SeedsLibraryPage() {
    const { user } = useAuth();
    const bobyPlaceId = user?.id || '';

    // State
    const [questions, setQuestions] = useState<SeedQuestion[]>([]);
    const [stats, setStats] = useState<SeedsLibraryStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [showAnswered, setShowAnswered] = useState<'all' | 'answered' | 'unanswered'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Answer modal
    const [selectedQuestion, setSelectedQuestion] = useState<SeedQuestion | null>(null);
    const [answerText, setAnswerText] = useState('');
    const [saving, setSaving] = useState(false);

    // Load data
    useEffect(() => {
        if (bobyPlaceId) {
            loadData();
        }
    }, [bobyPlaceId]);

    async function loadData() {
        setLoading(true);
        setError(null);

        try {
            const [questionsRes, statsRes] = await Promise.all([
                seedsLibraryApi.getQuestions(bobyPlaceId),
                seedsLibraryApi.getStats(bobyPlaceId),
            ]);

            setQuestions(questionsRes.questions);
            setStats(statsRes);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }

    // Filter questions
    const filteredQuestions = questions.filter(q => {
        // Category filter
        if (activeCategory !== 'all' && q.category !== activeCategory) {
            return false;
        }

        // Answered filter
        if (showAnswered === 'answered' && !q.answer) {
            return false;
        }
        if (showAnswered === 'unanswered' && q.answer) {
            return false;
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                q.questionText.toLowerCase().includes(query) ||
                (q.answer && q.answer.toLowerCase().includes(query))
            );
        }

        return true;
    });

    function handleQuestionClick(question: SeedQuestion) {
        setSelectedQuestion(question);
        setAnswerText(question.answer || '');
    }

    async function handleSaveAnswer() {
        if (!selectedQuestion || !answerText.trim()) return;

        setSaving(true);
        try {
            await seedsLibraryApi.saveAnswer(bobyPlaceId, selectedQuestion.id, answerText.trim());

            // Update local state
            setQuestions(prev =>
                prev.map(q =>
                    q.id === selectedQuestion.id
                        ? { ...q, answer: answerText.trim(), source: 'library', updatedAt: new Date().toISOString() }
                        : q
                )
            );

            // Reload stats
            const statsRes = await seedsLibraryApi.getStats(bobyPlaceId);
            setStats(statsRes);

            setSelectedQuestion(null);
            setAnswerText('');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save answer');
        } finally {
            setSaving(false);
        }
    }

    function formatDate(dateString: string | null) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    }

    return (
        <DashboardLayout>
            <div className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)] md:min-h-full max-w-full overflow-x-hidden">
                {/* Header */}
                <div className="mb-6 md:mb-8">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">Seeds Library</h1>
                    <p className="text-gray-600 text-sm md:text-base mt-1">
                        99 seed questions that define your Kaksos Twin
                    </p>
                </div>

                {/* Stats Header */}
                {stats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
                            <div className="text-sm text-gray-500">Total Questions</div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-3xl font-bold text-green-600">{stats.answered}</div>
                            <div className="text-sm text-gray-500">Answered</div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-3xl font-bold text-amber-600">{stats.unanswered}</div>
                            <div className="text-sm text-gray-500">Unanswered</div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-3xl font-bold text-blue-600">
                                {Math.round((stats.answered / stats.total) * 100)}%
                            </div>
                            <div className="text-sm text-gray-500">Complete</div>
                        </div>
                    </div>
                )}

                {/* Category Tabs */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setActiveCategory(cat.value)}
                                className={`min-h-[44px] px-4 py-2 rounded-lg font-medium transition-colors ${
                                    activeCategory === cat.value
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2 md:gap-4 items-center">
                        {/* Answered filter */}
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setShowAnswered('all')}
                                className={`min-h-[44px] px-3 py-1.5 text-sm rounded-lg ${
                                    showAnswered === 'all'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setShowAnswered('answered')}
                                className={`min-h-[44px] px-3 py-1.5 text-sm rounded-lg ${
                                    showAnswered === 'answered'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Answered ({stats?.answered || 0})
                            </button>
                            <button
                                onClick={() => setShowAnswered('unanswered')}
                                className={`min-h-[44px] px-3 py-1.5 text-sm rounded-lg ${
                                    showAnswered === 'unanswered'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Unanswered ({stats?.unanswered || 0})
                            </button>
                        </div>

                        {/* Search */}
                        <div className="flex-1 w-full sm:max-w-sm mt-2 sm:mt-0">
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="text-center py-12 text-gray-500">
                        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        Loading questions...
                    </div>
                )}

                {/* Questions List */}
                {!loading && (
                    <div className="space-y-4">
                        {filteredQuestions.map(question => (
                            <div
                                key={question.id}
                                className={`bg-white rounded-lg border p-5 cursor-pointer transition-all hover:shadow-md ${
                                    question.answer
                                        ? 'border-green-200'
                                        : 'border-gray-200'
                                }`}
                                onClick={() => handleQuestionClick(question)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg font-semibold text-gray-400">
                                                #{question.questionNumber}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded border ${CATEGORY_COLORS[question.category]}`}>
                                                {CATEGORY_ICONS[question.category]} {question.category.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-medium text-gray-800 mb-1">
                                            {question.questionText}
                                        </h3>

                                        {question.helperText && (
                                            <p className="text-sm text-gray-500 mb-3">
                                                {question.helperText}
                                            </p>
                                        )}

                                        {question.answer ? (
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                                <p className="text-gray-700 whitespace-pre-wrap">
                                                    "{question.answer}"
                                                </p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {question.source === 'settings' ? 'From Settings' : 'Edited in Library'}
                                                    {question.updatedAt && ` - ${formatDate(question.updatedAt)}`}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 italic">(No answer yet)</p>
                                        )}
                                    </div>

                                    <button className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors">
                                        {question.answer ? 'Edit' : 'Answer'}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filteredQuestions.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <p className="font-medium">No questions found</p>
                                <p className="text-sm mt-1">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Answer Modal */}
                {selectedQuestion && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg font-semibold text-gray-400">
                                        #{selectedQuestion.questionNumber}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${CATEGORY_COLORS[selectedQuestion.category]}`}>
                                        {CATEGORY_ICONS[selectedQuestion.category]} {selectedQuestion.category.replace('_', ' ')}
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {selectedQuestion.questionText}
                                </h2>
                                {selectedQuestion.helperText && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedQuestion.helperText}
                                    </p>
                                )}
                            </div>

                            <div className="p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Write your answer in first person:
                                </label>
                                <textarea
                                    value={answerText}
                                    onChange={e => setAnswerText(e.target.value)}
                                    placeholder="I prefer..., I feel..., My favorite..."
                                    rows={6}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-sm text-gray-400">
                                        {answerText.length} characters (aim for 50-500 for best results)
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Write as yourself. Your Kaksos will understand.
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedQuestion(null);
                                        setAnswerText('');
                                    }}
                                    className="px-4 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveAnswer}
                                    disabled={!answerText.trim() || saving}
                                    className="px-6 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Saving...' : 'Save Answer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
