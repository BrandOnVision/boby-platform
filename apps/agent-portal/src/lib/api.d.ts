/**
 * Agent Portal API Configuration
 *
 * Connects to the existing Boby API server at boby-kaksos-demo-1
 * Uses the Peeler First Protocol - all auth goes through /api/membership
 */
/**
 * Get the stored auth token
 */
export declare function getToken(): string | null;
/**
 * Store auth token
 */
export declare function setToken(token: string): void;
/**
 * Clear auth token
 */
export declare function clearToken(): void;
/**
 * Get stored user data
 */
export declare function getStoredUser(): unknown;
/**
 * Store user data
 */
export declare function setStoredUser(user: unknown): void;
/**
 * Auth API - Custom endpoints for this portal
 * Maps to /api/membership/* on the server
 */
export declare const authApi: {
    /**
     * Login with email and password
     */
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            roles: string[];
            sponsorCode?: string;
            bobyPlaceId?: string;
            peelerHomeId?: string;
        };
    }>;
    /**
     * Verify current token
     */
    verify(): Promise<{
        valid: boolean;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            roles: string[];
            telepathcode?: string;
            bobyPlaceId?: string;
            peelerHomeId?: string;
        };
    }>;
    /**
     * Logout - clear tokens
     */
    logout(): void;
};
/**
 * Jobs API - Endpoints for job listings
 * Maps to /api/jobs/* on the server
 */
export declare const jobsApi: {
    /**
     * Get list of available jobs
     */
    list(params?: {
        type?: string;
        state?: string;
        city?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
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
    }>;
    /**
     * Get my posted job requests
     */
    myRequests(): Promise<{
        jobs: Array<{
            id: string;
            title: string;
            description: string;
            job_type: string;
            status: string;
            posted_at: string;
            enquiry_count: number;
        }>;
    }>;
    /**
     * Get job types
     */
    getTypes(): Promise<{
        types: Array<{
            id: string;
            name: string;
        }>;
    }>;
    /**
     * Get job by slug
     */
    getBySlug(slug: string): Promise<{
        job: {
            id: string;
            slug: string;
            title: string;
            description: string;
            job_type: string;
            location_city: string;
            location_state: string;
            location_country: string;
            pay_type?: string;
            pay_min?: number;
            pay_max?: number;
            status: string;
            posted_at: string;
            is_urgent: boolean;
            is_featured: boolean;
            requires_licence?: boolean;
            requires_insurance?: boolean;
            min_rank_level?: number;
            experience_years?: number;
            view_count: number;
            enquiry_count: number;
        };
    }>;
    /**
     * Apply/enquire for a job
     */
    enquire(jobId: string, params: {
        enquirer_type: string;
        enquirer_id?: string;
        enquirer_email?: string;
        enquirer_name?: string;
        message?: string;
    }): Promise<{
        success: boolean;
    }>;
    /**
     * Get my submitted applications
     */
    myApplications(): Promise<{
        applications: Array<{
            enquiry_id: string;
            job_id: string;
            message: string;
            application_status: string;
            applied_at: string;
            job_title: string;
            job_slug: string;
            job_type: string;
            location_city: string;
            location_state: string;
            pay_min?: number;
            pay_max?: number;
            pay_type?: string;
            job_status: string;
            poster_name?: string;
            is_urgent: boolean;
            is_featured: boolean;
        }>;
        total: number;
    }>;
};
/**
 * Earnings API - Commission and payment endpoints
 * Maps to /api/commissions/* on the server
 */
export declare const earningsApi: {
    /**
     * Get agent earnings summary
     */
    getSummary(agentId: string): Promise<{
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
    }>;
};
/**
 * Profile API - User profile endpoints
 * Maps to /api/membership/* on the server
 */
export declare const profileApi: {
    /**
     * Update profile
     */
    update(data: {
        first_name?: string;
        last_name?: string;
        phone?: string;
        street_address?: string;
        suburb?: string;
        state?: string;
        postcode?: string;
    }): Promise<{
        success: boolean;
    }>;
};
//# sourceMappingURL=api.d.ts.map