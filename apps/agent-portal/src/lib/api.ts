/**
 * Agent Portal API Configuration
 * 
 * Connects to the existing Boby API server at boby-kaksos-demo-1
 * Uses the Peeler First Protocol - all auth goes through /api/membership
 */

/// <reference types="vite/client" />

// API Configuration
// In development, the API runs on localhost:3000
// In production, it will be at api.getboby.ai
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3000';

// Token storage keys
const TOKEN_KEY = 'boby_agent_token';
const USER_KEY = 'boby_agent_user';

/**
 * Get the stored auth token
 */
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store auth token
 */
export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Clear auth token
 */
export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Get stored user data
 */
export function getStoredUser(): unknown {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
}

/**
 * Store user data
 */
export function setStoredUser(user: unknown): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Handle token expiry - clear storage and redirect to login
 */
function handleTokenExpired(): void {
    clearToken();
    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}

/**
 * Auth API - Custom endpoints for this portal
 * Maps to /api/membership/* on the server
 */
export const authApi = {
    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<{
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
    }> {
        const response = await fetch(`${API_BASE_URL}/api/membership/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.code !== 200) {
            throw new Error(data.message || 'Login failed');
        }

        // Store token and user
        if (data.data.token) {
            setToken(data.data.token);
            setStoredUser(data.data.user);
        }

        return data.data;
    },

    /**
     * Verify current token
     */
    async verify(): Promise<{
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
    }> {
        const token = getToken();
        if (!token) {
            throw new Error('No token');
        }

        const response = await fetch(`${API_BASE_URL}/api/membership/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();

        if (data.code !== 200) {
            handleTokenExpired();
            throw new Error(data.message || 'Token invalid');
        }

        // Update stored user
        if (data.data.user) {
            setStoredUser(data.data.user);
        }

        return data.data;
    },

    /**
     * Logout - clear tokens
     */
    logout(): void {
        clearToken();
    },
};

/**
 * Jobs API - Endpoints for job listings
 * Maps to /api/jobs/* on the server
 */
export const jobsApi = {
    /**
     * Get list of available jobs
     */
    async list(params?: {
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
    }> {
        const queryParams = new URLSearchParams();
        if (params?.type) queryParams.set('type', params.type);
        if (params?.state) queryParams.set('state', params.state);
        if (params?.city) queryParams.set('city', params.city);
        if (params?.limit) queryParams.set('limit', String(params.limit));
        if (params?.offset) queryParams.set('offset', String(params.offset));

        const response = await fetch(
            `${API_BASE_URL}/api/jobs?${queryParams.toString()}`,
            { headers: { 'Content-Type': 'application/json' } }
        );

        const data = await response.json();
        return data.data || { jobs: [], total: 0 };
    },

    /**
     * Get my posted job requests
     */
    async myRequests(): Promise<{
        jobs: Array<{
            id: string;
            title: string;
            description: string;
            job_type: string;
            status: string;
            posted_at: string;
            enquiry_count: number;
        }>;
    }> {
        const token = getToken();

        const response = await fetch(`${API_BASE_URL}/api/jobs/my-requests`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();
        return data.data || { jobs: [] };
    },

    /**
     * Get job types
     */
    async getTypes(): Promise<{
        types: Array<{
            id: string;
            name: string;
        }>;
    }> {
        const response = await fetch(`${API_BASE_URL}/api/jobs/types/list`, {
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        return data.data || { types: [] };
    },

    /**
     * Get job by slug
     */
    async getBySlug(slug: string): Promise<{
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
    }> {
        const response = await fetch(`${API_BASE_URL}/api/jobs/${slug}`, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error('Job not found');
        }

        const data = await response.json();
        return data.data || { job: null };
    },

    /**
     * Apply/enquire for a job
     */
    async enquire(jobId: string, params: {
        enquirer_type: string;
        enquirer_id?: string;
        enquirer_email?: string;
        enquirer_name?: string;
        message?: string;
    }): Promise<{ success: boolean }> {
        const token = getToken();

        const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/enquire`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to submit application');
        }

        return { success: true };
    },

    /**
     * Get my submitted applications
     */
    async myApplications(): Promise<{
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
    }> {
        const token = getToken();

        const response = await fetch(`${API_BASE_URL}/api/jobs/my-applications`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();
        return data.data || { applications: [], total: 0 };
    },
};

/**
 * Earnings API - Commission and payment endpoints
 * Maps to /api/commissions/* on the server
 */
export const earningsApi = {
    /**
     * Get agent earnings summary
     */
    async getSummary(agentId: string): Promise<{
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
    }> {
        const token = getToken();

        const response = await fetch(`${API_BASE_URL}/api/commissions/agent/${agentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();

        if (data.code !== 200) {
            // Return empty data on error
            return {
                total_earned: 0,
                this_week: 0,
                pending: 0,
                commissions: [],
            };
        }

        return data.data;
    },
};

/**
 * Profile API - User profile endpoints
 * Maps to /api/membership/* on the server
 */
export const profileApi = {
    /**
     * Update profile
     */
    async update(data: {
        first_name?: string;
        last_name?: string;
        phone?: string;
        street_address?: string;
        suburb?: string;
        state?: string;
        postcode?: string;
    }): Promise<{ success: boolean }> {
        const token = getToken();

        const response = await fetch(`${API_BASE_URL}/api/membership/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        return { success: result.code === 200 };
    },
};
