/**
 * API Hooks for Agent Portal
 *
 * Custom React hooks for fetching data from the Boby API
 * Provides loading states, error handling, and caching
 */
import { useState, useEffect, useCallback } from 'react';
import { jobsApi, earningsApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
/**
 * Hook to fetch jobs list
 */
export function useJobs(params) {
    const [state, setState] = useState({
        data: null,
        isLoading: true,
        error: null,
        refetch: async () => { },
    });
    const fetchJobs = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const data = await jobsApi.list(params);
            setState(prev => ({ ...prev, data, isLoading: false }));
        }
        catch (err) {
            setState(prev => ({
                ...prev,
                error: err instanceof Error ? err.message : 'Failed to fetch jobs',
                isLoading: false,
            }));
        }
    }, [params?.type, params?.state, params?.city, params?.limit]);
    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);
    return {
        ...state,
        refetch: fetchJobs,
    };
}
/**
 * Hook to fetch job types
 */
export function useJobTypes() {
    const [state, setState] = useState({
        data: null,
        isLoading: true,
        error: null,
        refetch: async () => { },
    });
    const fetchTypes = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const data = await jobsApi.getTypes();
            setState(prev => ({ ...prev, data, isLoading: false }));
        }
        catch (err) {
            setState(prev => ({
                ...prev,
                error: err instanceof Error ? err.message : 'Failed to fetch job types',
                isLoading: false,
            }));
        }
    }, []);
    useEffect(() => {
        fetchTypes();
    }, [fetchTypes]);
    return {
        ...state,
        refetch: fetchTypes,
    };
}
/**
 * Hook to fetch my job requests
 */
export function useMyRequests() {
    const [state, setState] = useState({
        data: null,
        isLoading: true,
        error: null,
        refetch: async () => { },
    });
    const fetchJobs = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const data = await jobsApi.myRequests();
            setState(prev => ({ ...prev, data, isLoading: false }));
        }
        catch (err) {
            setState(prev => ({
                ...prev,
                error: err instanceof Error ? err.message : 'Failed to fetch your requests',
                isLoading: false,
            }));
        }
    }, []);
    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);
    return {
        ...state,
        refetch: fetchJobs,
    };
}
/**
 * Hook to fetch earnings/commissions
 */
export function useEarnings() {
    const { user } = useAuth();
    const [state, setState] = useState({
        data: {
            total_earned: 0,
            this_week: 0,
            pending: 0,
            commissions: [],
        },
        isLoading: true,
        error: null,
        refetch: async () => { },
    });
    const fetchEarnings = useCallback(async () => {
        if (!user?.id)
            return;
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const data = await earningsApi.getSummary(user.id);
            setState(prev => ({ ...prev, data, isLoading: false }));
        }
        catch (err) {
            setState(prev => ({
                ...prev,
                error: err instanceof Error ? err.message : 'Failed to fetch earnings',
                isLoading: false,
            }));
        }
    }, [user?.id]);
    useEffect(() => {
        if (user?.id) {
            fetchEarnings();
        }
    }, [fetchEarnings, user?.id]);
    return {
        ...state,
        refetch: fetchEarnings,
    };
}
/**
 * Format currency for display
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
/**
 * Format date for display
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}
/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1)
        return 'Just now';
    if (diffMins < 60)
        return `${diffMins}m ago`;
    if (diffHours < 24)
        return `${diffHours}h ago`;
    if (diffDays < 7)
        return `${diffDays}d ago`;
    return formatDate(dateString);
}
//# sourceMappingURL=useApi.js.map