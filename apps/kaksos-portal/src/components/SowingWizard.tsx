/**
 * Kaksos Portal - Sowing Wizard Modal
 * 99 Questions onboarding wizard
 */

import { useState, useEffect, useCallback } from 'react';
import { sowingApi, SowingAnswer } from '../lib/api';

// ============================================
// 99 QUESTIONS CATALOG
// ============================================

interface Question {
    id: number;
    category: string;
    text: string;
    hint?: string;
}

const QUESTIONS: Question[] = [
    // Identity & Core (1-15)
    { id: 1, category: 'Identity', text: 'What name would you like your Kaksos to call you?', hint: 'Your preferred name or nickname' },
    { id: 2, category: 'Identity', text: 'How would you describe yourself in three words?', hint: 'Think about your core traits' },
    { id: 3, category: 'Identity', text: 'What are you most proud of achieving in your life?', hint: 'Personal or professional' },
    { id: 4, category: 'Identity', text: 'What matters most to you in life?', hint: 'Your core values' },
    { id: 5, category: 'Identity', text: 'What is your greatest strength?', hint: 'What do others admire about you?' },
    { id: 6, category: 'Identity', text: 'What is something you are working to improve?', hint: 'Areas of growth' },
    { id: 7, category: 'Identity', text: 'How do you prefer to spend your free time?', hint: 'Hobbies, activities, relaxation' },
    { id: 8, category: 'Identity', text: 'What brings you the most joy?', hint: 'Simple pleasures or big moments' },
    { id: 9, category: 'Identity', text: 'What would your ideal day look like?', hint: 'From morning to night' },
    { id: 10, category: 'Identity', text: 'What is a belief you hold strongly?', hint: 'Something that guides your decisions' },
    { id: 11, category: 'Identity', text: 'What role do you play in your family?', hint: 'The peacemaker, the organizer, etc.' },
    { id: 12, category: 'Identity', text: 'How do you handle stress or difficult situations?', hint: 'Your coping mechanisms' },
    { id: 13, category: 'Identity', text: 'What is something most people don\'t know about you?', hint: 'A hidden talent or interest' },
    { id: 14, category: 'Identity', text: 'What do you wish you had more time for?', hint: 'Things you miss doing' },
    { id: 15, category: 'Identity', text: 'How would your closest friend describe you?', hint: 'Their perspective on you' },

    // Communication (16-30)
    { id: 16, category: 'Communication', text: 'Do you prefer formal or casual communication?', hint: 'Professional vs relaxed' },
    { id: 17, category: 'Communication', text: 'What tone do you use when talking to friends?', hint: 'Humorous, supportive, direct?' },
    { id: 18, category: 'Communication', text: 'Are there phrases or expressions you use often?', hint: 'Catchphrases, favorite words' },
    { id: 19, category: 'Communication', text: 'How do you prefer to receive information?', hint: 'Bullet points, stories, detailed?' },
    { id: 20, category: 'Communication', text: 'What topics do you love talking about?', hint: 'Subjects you could discuss for hours' },
    { id: 21, category: 'Communication', text: 'What topics do you prefer to avoid?', hint: 'Things that make you uncomfortable' },
    { id: 22, category: 'Communication', text: 'How do you express affection to loved ones?', hint: 'Words, actions, gifts?' },
    { id: 23, category: 'Communication', text: 'What kind of humor do you enjoy?', hint: 'Witty, sarcastic, wholesome?' },
    { id: 24, category: 'Communication', text: 'How do you give feedback or advice?', hint: 'Direct, gentle, with examples?' },
    { id: 25, category: 'Communication', text: 'How do you prefer to receive criticism?', hint: 'How should others approach this?' },
    { id: 26, category: 'Communication', text: 'Do you prefer long conversations or quick exchanges?', hint: 'Your communication style' },
    { id: 27, category: 'Communication', text: 'What makes you feel heard and understood?', hint: 'In conversations with others' },
    { id: 28, category: 'Communication', text: 'How do you handle disagreements?', hint: 'Your conflict resolution style' },
    { id: 29, category: 'Communication', text: 'What is the best compliment you\'ve ever received?', hint: 'Something that meant a lot' },
    { id: 30, category: 'Communication', text: 'How do you celebrate others\' successes?', hint: 'Your supportive side' },

    // Work & Career (31-45)
    { id: 31, category: 'Work', text: 'What do you do for work?', hint: 'Your profession or role' },
    { id: 32, category: 'Work', text: 'What do you enjoy most about your work?', hint: 'The rewarding parts' },
    { id: 33, category: 'Work', text: 'What aspects of your work do you find challenging?', hint: 'Difficult but worthwhile' },
    { id: 34, category: 'Work', text: 'What are your professional goals?', hint: 'Short or long-term' },
    { id: 35, category: 'Work', text: 'How do you approach problem-solving at work?', hint: 'Your methodology' },
    { id: 36, category: 'Work', text: 'What skills are you most proud of developing?', hint: 'Professional expertise' },
    { id: 37, category: 'Work', text: 'How do you balance work and personal life?', hint: 'Boundaries and strategies' },
    { id: 38, category: 'Work', text: 'What motivates you to work hard?', hint: 'Your driving force' },
    { id: 39, category: 'Work', text: 'How do you handle work-related stress?', hint: 'Coping mechanisms' },
    { id: 40, category: 'Work', text: 'What would your dream job look like?', hint: 'If anything was possible' },
    { id: 41, category: 'Work', text: 'How do you prefer to collaborate with others?', hint: 'Teamwork style' },
    { id: 42, category: 'Work', text: 'What professional achievement means most to you?', hint: 'A milestone or recognition' },
    { id: 43, category: 'Work', text: 'How do you approach learning new skills?', hint: 'Your learning style' },
    { id: 44, category: 'Work', text: 'What advice would you give to someone starting in your field?', hint: 'Wisdom to share' },
    { id: 45, category: 'Work', text: 'How do you want to be remembered professionally?', hint: 'Your legacy' },

    // Relationships (46-60)
    { id: 46, category: 'Relationships', text: 'Who are the most important people in your life?', hint: 'Family, friends, mentors' },
    { id: 47, category: 'Relationships', text: 'What qualities do you value most in a friend?', hint: 'What makes a good friend' },
    { id: 48, category: 'Relationships', text: 'How do you maintain close relationships?', hint: 'Your approach to connection' },
    { id: 49, category: 'Relationships', text: 'What is your love language?', hint: 'How you give and receive love' },
    { id: 50, category: 'Relationships', text: 'How do you support friends going through hard times?', hint: 'Your caring side' },
    { id: 51, category: 'Relationships', text: 'What traditions do you share with loved ones?', hint: 'Family or friend rituals' },
    { id: 52, category: 'Relationships', text: 'How do you make new friends?', hint: 'Your social approach' },
    { id: 53, category: 'Relationships', text: 'What is the longest friendship you\'ve maintained?', hint: 'A lasting connection' },
    { id: 54, category: 'Relationships', text: 'How has your family shaped who you are?', hint: 'Influences and values' },
    { id: 55, category: 'Relationships', text: 'What do you appreciate most about your partner/closest person?', hint: 'Their qualities' },
    { id: 56, category: 'Relationships', text: 'How do you handle distance in relationships?', hint: 'Long-distance connections' },
    { id: 57, category: 'Relationships', text: 'What is the best advice you\'ve received from someone you love?', hint: 'Wisdom passed down' },
    { id: 58, category: 'Relationships', text: 'How do you forgive others?', hint: 'Your process for letting go' },
    { id: 59, category: 'Relationships', text: 'What is a favorite memory with someone special?', hint: 'A cherished moment' },
    { id: 60, category: 'Relationships', text: 'How do you show gratitude to those who help you?', hint: 'Expressing thanks' },

    // Preferences & Lifestyle (61-75)
    { id: 61, category: 'Lifestyle', text: 'Are you a morning person or night owl?', hint: 'Your natural rhythm' },
    { id: 62, category: 'Lifestyle', text: 'What is your favorite type of food or cuisine?', hint: 'Culinary preferences' },
    { id: 63, category: 'Lifestyle', text: 'What music do you listen to most?', hint: 'Genres, artists, moods' },
    { id: 64, category: 'Lifestyle', text: 'What are your favorite books, movies, or shows?', hint: 'Entertainment preferences' },
    { id: 65, category: 'Lifestyle', text: 'Do you prefer city life, suburbs, or countryside?', hint: 'Your ideal environment' },
    { id: 66, category: 'Lifestyle', text: 'What is your ideal vacation destination?', hint: 'Dream travel' },
    { id: 67, category: 'Lifestyle', text: 'How do you approach health and wellness?', hint: 'Diet, exercise, mental health' },
    { id: 68, category: 'Lifestyle', text: 'What is your guilty pleasure?', hint: 'Something you enjoy but maybe shouldn\'t' },
    { id: 69, category: 'Lifestyle', text: 'How do you recharge when you\'re drained?', hint: 'Self-care practices' },
    { id: 70, category: 'Lifestyle', text: 'What is your favorite season and why?', hint: 'Weather, activities, feelings' },
    { id: 71, category: 'Lifestyle', text: 'Do you have any pets or want any?', hint: 'Animal companions' },
    { id: 72, category: 'Lifestyle', text: 'What is your daily routine like?', hint: 'How you structure your day' },
    { id: 73, category: 'Lifestyle', text: 'What do you collect or save?', hint: 'Physical or digital collections' },
    { id: 74, category: 'Lifestyle', text: 'How do you approach money and finances?', hint: 'Your financial philosophy' },
    { id: 75, category: 'Lifestyle', text: 'What is your relationship with technology?', hint: 'How you use and feel about tech' },

    // Dreams & Philosophy (76-90)
    { id: 76, category: 'Dreams', text: 'What is on your bucket list?', hint: 'Things you want to experience' },
    { id: 77, category: 'Dreams', text: 'What legacy do you want to leave?', hint: 'How you want to be remembered' },
    { id: 78, category: 'Dreams', text: 'What cause or issue do you care deeply about?', hint: 'What you would fight for' },
    { id: 79, category: 'Dreams', text: 'If you could have any superpower, what would it be?', hint: 'Reveals values and desires' },
    { id: 80, category: 'Dreams', text: 'What does success mean to you?', hint: 'Your personal definition' },
    { id: 81, category: 'Dreams', text: 'What is your biggest fear?', hint: 'What keeps you up at night' },
    { id: 82, category: 'Dreams', text: 'What gives your life meaning?', hint: 'Your purpose' },
    { id: 83, category: 'Dreams', text: 'What do you believe happens after death?', hint: 'Your spiritual views' },
    { id: 84, category: 'Dreams', text: 'What historical period would you visit if you could?', hint: 'Times that fascinate you' },
    { id: 85, category: 'Dreams', text: 'If money was no object, how would you spend your time?', hint: 'True passions' },
    { id: 86, category: 'Dreams', text: 'What would you tell your younger self?', hint: 'Advice from experience' },
    { id: 87, category: 'Dreams', text: 'What do you hope the future holds?', hint: 'Optimism and aspirations' },
    { id: 88, category: 'Dreams', text: 'What lesson has life taught you the hard way?', hint: 'Wisdom from struggles' },
    { id: 89, category: 'Dreams', text: 'What is something you\'ve changed your mind about?', hint: 'Growth and evolution' },
    { id: 90, category: 'Dreams', text: 'What question do you wish people asked you more?', hint: 'What you want to share' },

    // Kaksos-Specific (91-99)
    { id: 91, category: 'Kaksos', text: 'What should your Kaksos never say or do?', hint: 'Hard boundaries' },
    { id: 92, category: 'Kaksos', text: 'What topics should your Kaksos be extra careful discussing?', hint: 'Sensitive areas' },
    { id: 93, category: 'Kaksos', text: 'How should your Kaksos handle questions about private matters?', hint: 'Privacy boundaries' },
    { id: 94, category: 'Kaksos', text: 'What personality traits should your Kaksos emphasize?', hint: 'The version of you to present' },
    { id: 95, category: 'Kaksos', text: 'How should your Kaksos respond when it doesn\'t know something?', hint: 'Handling uncertainty' },
    { id: 96, category: 'Kaksos', text: 'What inside jokes or references should your Kaksos know?', hint: 'Shared humor with friends' },
    { id: 97, category: 'Kaksos', text: 'How formal or casual should your Kaksos be with strangers?', hint: 'Public persona' },
    { id: 98, category: 'Kaksos', text: 'What achievements or facts would you want your Kaksos to mention?', hint: 'Things to be proud of' },
    { id: 99, category: 'Kaksos', text: 'Is there anything else your Kaksos should know about you?', hint: 'Final thoughts' },
];

// Tier definitions
const TIERS = {
    starter: { name: 'Quick Start', count: 33, description: 'Essential questions to get started' },
    deep: { name: 'Deep Roots', count: 66, description: 'Comprehensive personality mapping' },
    complete: { name: 'Full Bloom', count: 99, description: 'Complete identity blueprint' },
} as const;

type TierKey = keyof typeof TIERS;

// Circle level options
const CIRCLE_LEVELS = [
    { value: 'center', label: 'Center', description: 'Only you', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { value: 'inner', label: 'Inner', description: 'Family', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { value: 'mid', label: 'Mid', description: 'Friends', color: 'bg-green-100 text-green-800 border-green-300' },
    { value: 'outer', label: 'Outer', description: 'Work', color: 'bg-orange-100 text-orange-800 border-orange-300' },
] as const;

type CircleLevel = typeof CIRCLE_LEVELS[number]['value'];

interface SowingWizardProps {
    isOpen: boolean;
    onClose: () => void;
    bobyPlaceId: string;
    onComplete?: (result: { seedCount?: number; instructions?: string }) => void;
}

export default function SowingWizard({ isOpen, onClose, bobyPlaceId, onComplete }: SowingWizardProps) {
    // Wizard state
    const [stage, setStage] = useState<'tier' | 'wizard' | 'complete'>('tier');
    const [selectedTier, setSelectedTier] = useState<TierKey | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Answers state
    const [answers, setAnswers] = useState<Record<number, { text: string; circle: CircleLevel }>>({});
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [currentCircle, setCurrentCircle] = useState<CircleLevel>('center');

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [completeResult, setCompleteResult] = useState<{ seedCount?: number; message?: string; instructions?: string } | null>(null);

    // Get questions for selected tier
    const tierQuestions = selectedTier ? QUESTIONS.slice(0, TIERS[selectedTier].count) : [];
    const currentQuestion = tierQuestions[currentIndex];
    const answeredCount = Object.keys(answers).filter(k => tierQuestions.some(q => q.id === Number(k))).length;

    // Load existing answers on mount
    useEffect(() => {
        if (!isOpen) return;

        async function loadAnswers() {
            try {
                setIsLoading(true);
                const response = await sowingApi.getAnswers();
                if (response.success && response.answers) {
                    const loaded: Record<number, { text: string; circle: CircleLevel }> = {};
                    response.answers.forEach((a: SowingAnswer) => {
                        loaded[a.question_id] = {
                            text: a.answer_text,
                            circle: a.circle_level || 'center',
                        };
                    });
                    setAnswers(loaded);
                }
            } catch (err) {
                console.error('Failed to load existing answers:', err);
            } finally {
                setIsLoading(false);
            }
        }
        loadAnswers();
    }, [isOpen]);

    // Update current answer when navigating to a question
    useEffect(() => {
        if (currentQuestion) {
            const existing = answers[currentQuestion.id];
            setCurrentAnswer(existing?.text || '');
            setCurrentCircle(existing?.circle || 'center');
        }
    }, [currentIndex, currentQuestion, answers]);

    // Reset wizard when closed
    useEffect(() => {
        if (!isOpen) {
            setStage('tier');
            setSelectedTier(null);
            setCurrentIndex(0);
            setCompleteResult(null);
            setError(null);
        }
    }, [isOpen]);

    // Save current answer
    const saveCurrentAnswer = useCallback(async () => {
        if (!currentQuestion || !currentAnswer.trim()) return;

        setIsSaving(true);
        setError(null);

        try {
            await sowingApi.saveAnswer({
                question_id: currentQuestion.id,
                answer_text: currentAnswer.trim(),
                circle_level: currentCircle,
            });

            setAnswers(prev => ({
                ...prev,
                [currentQuestion.id]: { text: currentAnswer.trim(), circle: currentCircle },
            }));
        } catch (err) {
            console.error('Failed to save answer:', err);
            setError(err instanceof Error ? err.message : 'Failed to save answer');
        } finally {
            setIsSaving(false);
        }
    }, [currentQuestion, currentAnswer, currentCircle]);

    // Navigate to next question
    async function handleNext() {
        if (currentAnswer.trim()) {
            await saveCurrentAnswer();
        }
        if (currentIndex < tierQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            handleComplete();
        }
    }

    // Navigate to previous question
    function handlePrevious() {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    }

    // Skip current question
    function handleSkip() {
        if (currentIndex < tierQuestions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    }

    // Complete the sowing session
    async function handleComplete() {
        if (!selectedTier) return;

        setIsCompleting(true);
        setError(null);

        try {
            const answersObj: Record<string, string> = {};
            Object.entries(answers).forEach(([qId, ans]) => {
                answersObj[qId] = ans.text;
            });

            const response = await sowingApi.complete({
                bobyPlaceId,
                answers: answersObj,
                tier: selectedTier,
            });

            setCompleteResult({
                seedCount: response.seedCount,
                message: response.message,
                instructions: response.instructions,
            });
            setStage('complete');
        } catch (err) {
            console.error('Failed to complete sowing:', err);
            setError(err instanceof Error ? err.message : 'Failed to complete sowing session');
        } finally {
            setIsCompleting(false);
        }
    }

    // Start wizard with selected tier
    function startWizard(tier: TierKey) {
        setSelectedTier(tier);
        setCurrentIndex(0);
        setStage('wizard');
    }

    // Handle close with callback
    function handleFinish() {
        if (onComplete && completeResult) {
            onComplete({
                seedCount: completeResult.seedCount,
                instructions: completeResult.instructions,
            });
        }
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">99 Questions</h2>
                        <p className="text-sm text-gray-500">Help your Kaksos understand who you are</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-500">Loading your progress...</p>
                        </div>
                    ) : stage === 'tier' ? (
                        /* Tier Selection */
                        <div className="space-y-4">
                            <p className="text-gray-600 mb-4">Choose how deep you want to go:</p>
                            {(Object.entries(TIERS) as [TierKey, typeof TIERS[TierKey]][]).map(([key, tier]) => (
                                <button
                                    key={key}
                                    onClick={() => startWizard(key)}
                                    className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-primary hover:bg-primary-light transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{tier.name}</h3>
                                            <p className="text-gray-500 text-sm">{tier.description}</p>
                                        </div>
                                        <span className="text-xl font-bold text-primary-dark">{tier.count}</span>
                                    </div>
                                </button>
                            ))}
                            {Object.keys(answers).length > 0 && (
                                <p className="text-sm text-green-600 mt-4">
                                    You have {Object.keys(answers).length} answers saved.
                                </p>
                            )}
                        </div>
                    ) : stage === 'wizard' && currentQuestion ? (
                        /* Question Wizard */
                        <div>
                            {/* Progress */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                                    <span>Question {currentIndex + 1} of {tierQuestions.length}</span>
                                    <span>{answeredCount} answered</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${((currentIndex + 1) / tierQuestions.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Category */}
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full mb-3">
                                {currentQuestion.category}
                            </span>

                            {/* Question */}
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {currentQuestion.text}
                            </h3>
                            {currentQuestion.hint && (
                                <p className="text-gray-400 text-sm mb-4">{currentQuestion.hint}</p>
                            )}

                            {/* Answer */}
                            <textarea
                                value={currentAnswer}
                                onChange={(e) => setCurrentAnswer(e.target.value)}
                                placeholder="Type your answer..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />

                            {/* Circle Level */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Who should know this?
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {CIRCLE_LEVELS.map((level) => (
                                        <button
                                            key={level.value}
                                            type="button"
                                            onClick={() => setCurrentCircle(level.value)}
                                            className={`p-2 rounded-lg border-2 text-center transition-all ${
                                                currentCircle === level.value
                                                    ? `${level.color} border-current`
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <span className="font-medium text-xs">{level.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : stage === 'complete' ? (
                        /* Completion */
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Seeds Planted!</h3>
                            <p className="text-gray-500 mb-2">{completeResult?.message}</p>
                            {completeResult?.seedCount && (
                                <p className="text-lg font-semibold text-primary-dark">
                                    {completeResult.seedCount} seeds stored
                                </p>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    {stage === 'wizard' ? (
                        <>
                            <button
                                onClick={handlePrevious}
                                disabled={currentIndex === 0}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSkip}
                                    disabled={currentIndex === tierQuestions.length - 1}
                                    className="px-4 py-2 text-gray-500 hover:text-gray-700"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={isSaving || isCompleting}
                                    className="px-5 py-2 bg-primary text-gray-800 font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : isCompleting ? 'Completing...' : currentIndex === tierQuestions.length - 1 ? 'Complete' : 'Next'}
                                </button>
                            </div>
                        </>
                    ) : stage === 'complete' ? (
                        <button
                            onClick={handleFinish}
                            className="w-full px-5 py-2 bg-primary text-gray-800 font-medium rounded-lg hover:bg-primary-dark"
                        >
                            Done
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full px-5 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
