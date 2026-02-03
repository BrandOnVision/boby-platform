/**
 * Watch Grow Page
 * View the permanent Living Mind - Long-Term Memory (LTM)
 * Seeds approved through Nurture are immutable per "No Unsee" principle
 */

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { watchGrowApi, WatchGrowSeed, WatchGrowStatsResponse, CircleLevel } from '../lib/api';

// Circle colors for badges
const CIRCLE_COLORS: Record<string, string> = {
    center: 'bg-purple-100 text-purple-800 border-purple-300',
    inner: 'bg-blue-100 text-blue-800 border-blue-300',
    mid: 'bg-green-100 text-green-800 border-green-300',
    outer: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    public: 'bg-gray-100 text-gray-800 border-gray-300',
};

// Circle labels
const CIRCLE_LABELS: Record<string, string> = {
    center: 'Centre',
    inner: 'Inner',
    mid: 'Mid',
    outer: 'Outer',
    public: 'Public',
};

export default function WatchGrowPage() {
    const { user } = useAuth();
    const bobyPlaceId = user?.id || '';

    // State
    const [seeds, setSeeds] = useState<WatchGrowSeed[]>([]);
    const [stats, setStats] = useState<WatchGrowStatsResponse['stats'] | null>(null);
    const [selectedSeed, setSelectedSeed] = useState<WatchGrowSeed | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [circleFilter, setCircleFilter] = useState<CircleLevel | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showBoundary, setShowBoundary] = useState(false);

    // Pagination
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [total, setTotal] = useState(0);
    const limit = 20;

    // Load data
    useEffect(() => {
        if (bobyPlaceId) {
            loadStats();
            loadSeeds();
        }
    }, [bobyPlaceId]);

    // Reload seeds when filters change
    useEffect(() => {
        if (bobyPlaceId) {
            setOffset(0);
            loadSeeds();
        }
    }, [circleFilter, searchQuery, showBoundary]);

    async function loadStats() {
        try {
            const response = await watchGrowApi.getStats(bobyPlaceId);
            setStats(response.stats);
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    }

    async function loadSeeds(newOffset = 0) {
        setLoading(true);
        setError(null);

        try {
            const response = await watchGrowApi.getSeeds(bobyPlaceId, {
                circle: circleFilter,
                search: searchQuery || undefined,
                limit,
                offset: newOffset,
                includeBoundary: showBoundary,
            });

            if (newOffset === 0) {
                setSeeds(response.seeds);
            } else {
                setSeeds(prev => [...prev, ...response.seeds]);
            }

            setHasMore(response.pagination.hasMore);
            setTotal(response.pagination.total);
            setOffset(newOffset);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load seeds');
        } finally {
            setLoading(false);
        }
    }

    async function handleBoundaryToggle(seed: WatchGrowSeed) {
        const newBoundary = !seed.is_boundary;
        const reason = newBoundary
            ? prompt('Why are you suppressing this seed? (optional)')
            : undefined;

        try {
            await watchGrowApi.setBoundary(bobyPlaceId, seed.id, newBoundary, reason || undefined);

            // Update local state
            setSeeds(prev =>
                prev.map(s =>
                    s.id === seed.id ? { ...s, is_boundary: newBoundary } : s
                )
            );

            if (selectedSeed?.id === seed.id) {
                setSelectedSeed({ ...selectedSeed, is_boundary: newBoundary });
            }

            // Reload stats
            loadStats();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update seed');
        }
    }

    function formatDate(dateString: string | null) {
        if (!dateString) return 'Unknown';
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
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">Watch Grow</h1>
                    <p className="text-gray-600 text-sm md:text-base mt-1">
                        Your Living Mind - permanent seeds that shape your Kaksos
                    </p>
                </div>

                {/* Stats Header */}
                {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                        {/* Total Seeds */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-3xl font-bold text-gray-800">{stats.totalSeeds}</div>
                            <div className="text-sm text-gray-500">Total Seeds</div>
                        </div>

                        {/* This Week */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-3xl font-bold text-green-600">+{stats.growth.thisWeek}</div>
                            <div className="text-sm text-gray-500">This Week</div>
                        </div>

                        {/* This Month */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-3xl font-bold text-blue-600">+{stats.growth.thisMonth}</div>
                            <div className="text-sm text-gray-500">This Month</div>
                        </div>

                        {/* Contributors */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="text-3xl font-bold text-purple-600">{stats.uniqueContributors}</div>
                            <div className="text-sm text-gray-500">Contributors</div>
                        </div>
                    </div>
                )}

                {/* Circle Breakdown */}
                {stats && (
                    <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 mb-6 md:mb-8">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Seeds by Circle</h3>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {['center', 'inner', 'mid', 'outer', 'public'].map(circle => {
                                const circleStats = stats.byCircle[circle];
                                const count = circleStats?.active || 0;
                                return (
                                    <button
                                        key={circle}
                                        onClick={() => setCircleFilter(circle === circleFilter ? 'all' : circle as CircleLevel)}
                                        className={`min-h-[44px] px-3 md:px-4 py-2 rounded-lg border transition-all text-sm md:text-base ${
                                            circleFilter === circle
                                                ? CIRCLE_COLORS[circle] + ' ring-2 ring-offset-1'
                                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                        }`}
                                    >
                                        <span className="font-medium">{CIRCLE_LABELS[circle]}</span>
                                        <span className="ml-1 md:ml-2 text-xs md:text-sm opacity-75">({count})</span>
                                    </button>
                                );
                            })}
                            {circleFilter !== 'all' && (
                                <button
                                    onClick={() => setCircleFilter('all')}
                                    className="px-3 md:px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm md:text-base"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                    {/* Seed Browser */}
                    <div className="flex-1 order-2 lg:order-1">
                        {/* Search & Filters */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                            <div className="flex gap-4 items-center">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Search seeds..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    />
                                    <svg
                                        className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>

                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={showBoundary}
                                        onChange={e => setShowBoundary(e.target.checked)}
                                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    Show suppressed
                                </label>
                            </div>
                        </div>

                        {/* Results info */}
                        <div className="text-sm text-gray-500 mb-4">
                            Showing {seeds.length} of {total} seeds
                            {circleFilter !== 'all' && ` in ${CIRCLE_LABELS[circleFilter]} circle`}
                            {searchQuery && ` matching "${searchQuery}"`}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
                                {error}
                            </div>
                        )}

                        {/* Seeds List */}
                        <div className="space-y-3">
                            {seeds.map(seed => (
                                <div
                                    key={seed.id}
                                    onClick={() => setSelectedSeed(seed)}
                                    className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
                                        selectedSeed?.id === seed.id
                                            ? 'border-amber-500 ring-2 ring-amber-200'
                                            : 'border-gray-200'
                                    } ${seed.is_boundary ? 'opacity-50' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded border ${CIRCLE_COLORS[seed.circle_level]}`}>
                                                    {CIRCLE_LABELS[seed.circle_level]}
                                                </span>
                                                {seed.is_boundary && (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700 border border-red-200">
                                                        Suppressed
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-medium text-gray-800 mb-1 truncate">
                                                {seed.question}
                                            </h4>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {seed.answer}
                                            </p>
                                        </div>
                                        <div className="text-xs text-gray-400 whitespace-nowrap">
                                            {formatDate(seed.trained_at || seed.created_at)}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Loading state */}
                            {loading && seeds.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    Loading seeds...
                                </div>
                            )}

                            {/* Empty state */}
                            {!loading && seeds.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <svg
                                        className="w-12 h-12 mx-auto mb-4 text-gray-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                        />
                                    </svg>
                                    <p className="font-medium">No seeds found</p>
                                    <p className="text-sm mt-1">
                                        {searchQuery || circleFilter !== 'all'
                                            ? 'Try adjusting your filters'
                                            : 'Plant seeds through Nurture to grow your Living Mind'}
                                    </p>
                                </div>
                            )}

                            {/* Load More */}
                            {hasMore && (
                                <button
                                    onClick={() => loadSeeds(offset + limit)}
                                    disabled={loading}
                                    className="w-full py-3 text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Loading...' : 'Load More'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Seed Detail Panel */}
                    <div className="w-full lg:w-96 shrink-0 order-1 lg:order-2">
                        <div className="bg-white rounded-lg border border-gray-200 lg:sticky lg:top-8">
                            {selectedSeed ? (
                                <div className="p-6">
                                    {/* Circle Badge */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${CIRCLE_COLORS[selectedSeed.circle_level]}`}>
                                            {CIRCLE_LABELS[selectedSeed.circle_level]} Circle
                                        </span>
                                        {selectedSeed.is_boundary && (
                                            <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-700 border border-red-200">
                                                Suppressed
                                            </span>
                                        )}
                                    </div>

                                    {/* Question */}
                                    <div className="mb-4">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Question
                                        </label>
                                        <p className="mt-1 text-gray-800 font-medium">
                                            {selectedSeed.question}
                                        </p>
                                    </div>

                                    {/* Answer (Read-only) */}
                                    <div className="mb-6">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Answer
                                        </label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-gray-700 whitespace-pre-wrap">
                                                {selectedSeed.answer}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1 italic">
                                            Read-only - Long-Term Memory cannot be edited
                                        </p>
                                    </div>

                                    {/* Source Attribution */}
                                    <div className="border-t border-gray-100 pt-4 mb-4">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Source Attribution
                                        </label>
                                        <div className="mt-2 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Planted by</span>
                                                <span className="text-gray-800">
                                                    {selectedSeed.source_peeler_name || 'Owner'}
                                                </span>
                                            </div>
                                            {selectedSeed.source_circle_level && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Planter's circle</span>
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${CIRCLE_COLORS[selectedSeed.source_circle_level]}`}>
                                                        {CIRCLE_LABELS[selectedSeed.source_circle_level] || selectedSeed.source_circle_level}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Created</span>
                                                <span className="text-gray-800">
                                                    {formatDate(selectedSeed.created_at)}
                                                </span>
                                            </div>
                                            {selectedSeed.trained_at && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Approved</span>
                                                    <span className="text-gray-800">
                                                        {formatDate(selectedSeed.trained_at)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Boundary Toggle */}
                                    <div className="border-t border-gray-100 pt-4">
                                        <button
                                            onClick={() => handleBoundaryToggle(selectedSeed)}
                                            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                                                selectedSeed.is_boundary
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                            }`}
                                        >
                                            {selectedSeed.is_boundary ? (
                                                <>
                                                    <svg
                                                        className="w-4 h-4 inline mr-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    </svg>
                                                    Restore Seed
                                                </>
                                            ) : (
                                                <>
                                                    <svg
                                                        className="w-4 h-4 inline mr-2"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                        />
                                                    </svg>
                                                    Mark as Boundary
                                                </>
                                            )}
                                        </button>
                                        <p className="text-xs text-gray-400 mt-2 text-center">
                                            {selectedSeed.is_boundary
                                                ? 'This seed is hidden from responses but preserved per "No Unsee"'
                                                : 'Suppress this seed without deleting it'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <svg
                                        className="w-12 h-12 mx-auto mb-4 text-gray-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                    <p className="font-medium">Select a seed</p>
                                    <p className="text-sm mt-1">
                                        Click on a seed to view its details
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
