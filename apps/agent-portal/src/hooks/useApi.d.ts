/**
 * API Hooks for Agent Portal
 *
 * Custom React hooks for fetching data from the Boby API
 * Provides loading states, error handling, and caching
 */
/**
 * Hook to fetch jobs list
 */
export declare function useJobs(params?: {
    type?: string;
    state?: string;
    city?: string;
    limit?: number;
}): {
    refetch: () => Promise<void>;
    data: {
        jobs: Array<{
            id: string;
            slug: string;
            title: string;
            description: string;
            job_type: string;
            location_city: string;
            location_state: string;
            hourly_rate?: number;
            status: string;
            posted_at: string;
            is_urgent: boolean;
            is_featured: boolean;
        }>;
        total: number;
    } | null;
    isLoading: boolean;
    error: string | null;
};
/**
 * Hook to fetch job types
 */
export declare function useJobTypes(): {
    refetch: () => Promise<void>;
    data: {
        types: Array<{
            id: string;
            name: string;
        }>;
    } | null;
    isLoading: boolean;
    error: string | null;
};
/**
 * Hook to fetch my job requests
 */
export declare function useMyRequests(): {
    refetch: () => Promise<void>;
    data: {
        jobs: Array<{
            id: string;
            title: string;
            description: string;
            job_type: string;
            status: string;
            posted_at: string;
            enquiry_count: number;
        }>;
    } | null;
    isLoading: boolean;
    error: string | null;
};
/**
 * Hook to fetch earnings/commissions
 */
export declare function useEarnings(): {
    refetch: () => Promise<void>;
    data: {
        total_earned: number;
        this_week: number;
        pending: number;
        commissions: Array<{
            id: string;
            amount: number;
            status: string;
            created_at: string;
            description?: string;
        }>;
    } | null;
    isLoading: boolean;
    error: string | null;
};
/**
 * Format currency for display
 */
export declare function formatCurrency(amount: number): string;
/**
 * Format date for display
 */
export declare function formatDate(dateString: string): string;
/**
 * Format relative time (e.g., "2 hours ago")
 */
export declare function formatRelativeTime(dateString: string): string;
//# sourceMappingURL=useApi.d.ts.map