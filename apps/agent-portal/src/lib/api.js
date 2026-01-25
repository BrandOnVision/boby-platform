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
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000';
// Token storage keys
const TOKEN_KEY = 'boby_agent_token';
const USER_KEY = 'boby_agent_user';
/**
 * Get the stored auth token
 */
export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}
/**
 * Store auth token
 */
export function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}
/**
 * Clear auth token
 */
export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}
/**
 * Get stored user data
 */
export function getStoredUser() {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
}
/**
 * Store user data
 */
export function setStoredUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}
/**
 * Handle token expiry - clear storage and redirect to login
 */
function handleTokenExpired() {
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
    async login(email, password) {
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
    async verify() {
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
    logout() {
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
    async list(params) {
        const queryParams = new URLSearchParams();
        if (params?.type)
            queryParams.set('type', params.type);
        if (params?.state)
            queryParams.set('state', params.state);
        if (params?.city)
            queryParams.set('city', params.city);
        if (params?.limit)
            queryParams.set('limit', String(params.limit));
        if (params?.offset)
            queryParams.set('offset', String(params.offset));
        const response = await fetch(`${API_BASE_URL}/api/jobs?${queryParams.toString()}`, { headers: { 'Content-Type': 'application/json' } });
        const data = await response.json();
        return data.data || { jobs: [], total: 0 };
    },
    /**
     * Get my posted job requests
     */
    async myRequests() {
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
    async getTypes() {
        const response = await fetch(`${API_BASE_URL}/api/jobs/types/list`, {
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        return data.data || { types: [] };
    },
    /**
     * Get job by slug
     */
    async getBySlug(slug) {
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
    async enquire(jobId, params) {
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
    async myApplications() {
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
    async getSummary(agentId) {
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
    async update(data) {
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
//# sourceMappingURL=api.js.map