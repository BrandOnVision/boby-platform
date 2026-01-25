/**
 * Firm Portal API Configuration
 * 
 * Connects to the existing Boby API server
 * Uses the Peeler First Protocol - all auth goes through /api/membership
 */

/// <reference types="vite/client" />

// API Configuration
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'https://api.getboby.ai';

// Token storage keys
const TOKEN_KEY = 'boby_firm_token';
const USER_KEY = 'boby_firm_user';
const FIRM_KEY = 'boby_firm_data';

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
    localStorage.removeItem(FIRM_KEY);
}

/**
 * Get stored user data
 */
export function getStoredUser(): FirmUser | null {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
}

/**
 * Store user data
 */
export function setStoredUser(user: FirmUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Get stored firm data
 */
export function getStoredFirm(): FirmProfile | null {
    const data = localStorage.getItem(FIRM_KEY);
    return data ? JSON.parse(data) : null;
}

/**
 * Store firm data
 */
export function setStoredFirm(firm: FirmProfile): void {
    localStorage.setItem(FIRM_KEY, JSON.stringify(firm));
}

/**
 * Handle token expiry - clear storage and redirect to login
 */
function handleTokenExpired(): void {
    clearToken();
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}

// ============================================
// TYPES
// ============================================

export interface FirmUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    firmId?: string;
    firmName?: string;
}

export interface FirmProfile {
    id: string;
    name: string;
    tradingName?: string;
    masterLicenceNumber?: string;
    contactEmail: string;
    contactPhone?: string;
    address?: string;
    state?: string;
    isActive: boolean;
    subscriptionStatus: string;
    tierLevel: number;
}

export interface Job {
    id: string;
    slug: string;
    title: string;
    description: string;
    job_type: string;
    location_city: string;
    location_state: string;
    status: string;
    posted_at: string;
    expires_at?: string;
    enquiry_count: number;
    view_count: number;
    is_urgent: boolean;
    is_featured: boolean;
    pay_type?: string;
    pay_min?: number;
    pay_max?: number;
}

export interface JobEnquiry {
    id: string;
    enquirer_name?: string;
    enquirer_email?: string;
    enquirer_phone?: string;
    message?: string;
    status: string;
    created_at: string;
    agent_profile?: {
        trust_score: number;
        experience_years: number;
        has_licence: boolean;
    };
}

// ============================================
// AUTH API
// ============================================

export const authApi = {
    /**
     * Login with email and password
     * For firms, we check if user has a linked partner_firm
     */
    async login(email: string, password: string): Promise<{
        token: string;
        user: FirmUser;
        firm?: FirmProfile;
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

        const user = data.data.user;

        // Store token and user
        if (data.data.token) {
            setToken(data.data.token);
            setStoredUser({
                id: user.id,
                email: user.email,
                firstName: user.first_name || user.firstName || 'User',
                lastName: user.last_name || user.lastName || '',
                roles: user.roles || [],
            });
        }

        // Try to load linked firm
        let firm: FirmProfile | undefined = undefined;
        try {
            const firmData = await firmApi.getMyFirm();
            if (firmData) {
                firm = firmData;
                setStoredFirm(firmData);
            }
        } catch (e) {
            // No firm linked - that's ok, we'll show a message
            console.log('[FirmAuth] No linked firm found');
        }

        return {
            token: data.data.token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name || user.firstName || 'User',
                lastName: user.last_name || user.lastName || '',
                roles: user.roles || [],
                firmId: firm?.id,
                firmName: firm?.name,
            },
            firm,
        };
    },

    /**
     * Verify current token
     */
    async verify(): Promise<{
        valid: boolean;
        user: FirmUser;
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

        const user = data.data.user;
        const storedFirm = getStoredFirm();

        const firmUser: FirmUser = {
            id: user.id,
            email: user.email,
            firstName: user.first_name || user.firstName || 'User',
            lastName: user.last_name || user.lastName || '',
            roles: user.roles || [],
            firmId: storedFirm?.id,
            firmName: storedFirm?.name,
        };

        setStoredUser(firmUser);

        return { valid: true, user: firmUser };
    },

    /**
     * Logout - clear tokens
     */
    logout(): void {
        clearToken();
    },
};

// ============================================
// FIRM API
// ============================================

export const firmApi = {
    /**
     * Get the firm linked to the current user
     * Uses the /api/partners/user-firm endpoint with email
     * Falls back to user profile if they have firm_owner role
     */
    async getMyFirm(): Promise<FirmProfile | null> {
        const token = getToken();
        const user = getStoredUser();
        if (!token || !user?.email) return null;

        try {
            // Use the correct endpoint: /api/partners/user-firm?email=xxx
            const response = await fetch(
                `${API_BASE_URL}/api/partners/user-firm?email=${encodeURIComponent(user.email)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                }
            );

            const data = await response.json();

            if (data.code === 200 && data.data?.firm_id) {
                // The endpoint returns firm_id and firm_name
                return {
                    id: data.data.firm_id,
                    name: data.data.firm_name,
                    tradingName: undefined,
                    masterLicenceNumber: undefined,
                    contactEmail: user.email,
                    contactPhone: undefined,
                    address: undefined,
                    state: undefined,
                    isActive: true,
                    subscriptionStatus: 'active',
                    tierLevel: 1,
                };
            }

            // Fallback: If user has firm_owner role, create a profile from user data
            // This handles the "Security Officer" (BOBY owner) case
            if (user.roles?.includes('firm_owner')) {
                console.log('[FirmAPI] Using firm_owner role fallback');
                return {
                    id: 'boby-master-firm',
                    name: 'BOBY Security Officer',
                    tradingName: 'Security Officer - BOBY Master Licence',
                    masterLicenceNumber: 'Master Tier 1',
                    contactEmail: user.email,
                    contactPhone: undefined,
                    address: undefined,
                    state: 'QLD',
                    isActive: true,
                    subscriptionStatus: 'active',
                    tierLevel: 1,
                };
            }

            return null;
        } catch (error) {
            console.error('[FirmAPI] getMyFirm error:', error);

            // On error, still check for firm_owner role
            if (user.roles?.includes('firm_owner')) {
                return {
                    id: 'boby-master-firm',
                    name: 'BOBY Security Officer',
                    tradingName: 'Security Officer - BOBY Master Licence',
                    masterLicenceNumber: 'Master Tier 1',
                    contactEmail: user.email,
                    contactPhone: undefined,
                    address: undefined,
                    state: 'QLD',
                    isActive: true,
                    subscriptionStatus: 'active',
                    tierLevel: 1,
                };
            }

            return null;
        }
    },

    /**
     * Get firm profile by ID
     */
    async getProfile(firmId: string): Promise<FirmProfile | null> {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/partner-stripe/firm/${firmId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();
        if (data.code !== 200) return null;

        const firm = data.data;
        return {
            id: firm.id,
            name: firm.name,
            tradingName: firm.trading_name,
            masterLicenceNumber: firm.master_licence_number,
            contactEmail: firm.contact_email,
            contactPhone: firm.contact_phone,
            address: firm.address,
            state: firm.state,
            isActive: firm.is_active,
            subscriptionStatus: firm.subscription_status || 'pending',
            tierLevel: firm.tier_level || 2,
        };
    },

    /**
     * Get firm dashboard stats
     * Returns counts of jobs, applications, agents
     */
    async getStats(firmId: string): Promise<{
        totalJobs: number;
        activeJobs: number;
        pendingApplications: number;
        totalAgents: number;
    }> {
        const token = getToken();

        // Try to get stats from API
        try {
            const response = await fetch(`${API_BASE_URL}/api/partner-stripe/firm/${firmId}/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            const data = await response.json();
            if (data.code === 200 && data.data) {
                return data.data;
            }
        } catch (error) {
            console.log('[FirmAPI] Stats endpoint not available, calculating from jobs');
        }

        // Fallback: calculate from jobs
        try {
            const jobsData = await jobsApi.list(firmId);
            const jobs = jobsData.jobs;

            const activeJobs = jobs.filter(j => j.status === 'active').length;
            const totalEnquiries = jobs.reduce((sum, j) => sum + (j.enquiry_count || 0), 0);

            return {
                totalJobs: jobs.length,
                activeJobs,
                pendingApplications: totalEnquiries, // Approximate
                totalAgents: 0, // Would need separate query
            };
        } catch (error) {
            return {
                totalJobs: 0,
                activeJobs: 0,
                pendingApplications: 0,
                totalAgents: 0,
            };
        }
    },
};

// ============================================
// JOBS API
// ============================================

export const jobsApi = {
    /**
     * Get jobs posted by this firm
     */
    async list(firmId: string, params?: {
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        jobs: Job[];
        total: number;
    }> {
        const token = getToken();

        // Use the admin/all endpoint and filter by poster_id
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.set('status', params.status);
        if (params?.limit) queryParams.set('limit', String(params.limit));
        if (params?.offset) queryParams.set('offset', String(params.offset));

        const response = await fetch(
            `${API_BASE_URL}/api/jobs/admin/all?${queryParams.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            }
        );

        const data = await response.json();

        if (data.code !== 200) {
            return { jobs: [], total: 0 };
        }

        // Filter to only jobs posted by this firm or user
        const allJobs = data.data?.jobs || [];
        const user = getStoredUser();
        const firmJobs = allJobs.filter((job: { poster_id: string; poster_type: string }) => {
            // Match by firm ID
            if (job.poster_id === firmId) return true;
            // Match by user ID (when using user ID as poster)
            if (user?.id && job.poster_id === user.id && job.poster_type === 'firm') return true;
            return false;
        });

        return {
            jobs: firmJobs,
            total: firmJobs.length,
        };
    },

    /**
     * Create a new job posting
     */
    async create(jobData: {
        title: string;
        description: string;
        job_type: string;
        location_city: string;
        location_state: string;
        pay_type?: string;
        pay_min?: number;
        pay_max?: number;
        requires_licence?: boolean;
        is_urgent?: boolean;
        firm_id: string;
    }): Promise<{ id: string; slug: string }> {
        const token = getToken();
        const user = getStoredUser();

        // Determine poster ID
        // If firm_id is the placeholder, use user ID as the poster
        let posterId = jobData.firm_id;

        if (jobData.firm_id === 'boby-master-firm' && user?.id) {
            posterId = user.id;
        }

        // API only accepts: 'firm', 'employer', 'citizen', 'peeler'
        const posterType = 'firm';

        // Format for the existing jobs API
        const payload = {
            poster_type: posterType,
            poster_id: posterId,
            job_type: jobData.job_type,
            title: jobData.title,
            description: jobData.description,
            location_state: jobData.location_state,
            location_city: jobData.location_city,
            location_country: 'AU',
            pay_type: jobData.pay_type || 'negotiable',
            pay_min: jobData.pay_min,
            pay_max: jobData.pay_max,
            requires_licence: jobData.requires_licence ?? true,
            requires_insurance: true,
            is_urgent: jobData.is_urgent || false,
            status: 'active',
        };

        const response = await fetch(`${API_BASE_URL}/api/jobs`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.code !== 200 && data.code !== 201) {
            throw new Error(data.error || data.message || 'Failed to create job');
        }

        return data.data || { id: data.id, slug: data.slug };
    },

    /**
     * Get job by ID
     */
    async getById(jobId: string): Promise<Job | null> {
        const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();
        if (data.code !== 200) return null;

        return data.data?.job || data.data;
    },

    /**
     * Get enquiries for a job
     */
    async getEnquiries(jobId: string): Promise<{
        enquiries: JobEnquiry[];
    }> {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/enquiries`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();

        if (data.code !== 200) {
            return { enquiries: [] };
        }

        return { enquiries: data.data?.enquiries || [] };
    },

    /**
     * Update enquiry status
     */
    async updateEnquiryStatus(
        enquiryId: string,
        status: 'viewed' | 'responded' | 'hired' | 'declined'
    ): Promise<{ success: boolean }> {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/jobs/enquiries/${enquiryId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status }),
        });

        const data = await response.json();
        return { success: data.code === 200 };
    },

    /**
     * Update job status (pause, close, etc)
     */
    async updateStatus(jobId: string, status: string): Promise<{ success: boolean }> {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status }),
        });

        const data = await response.json();
        return { success: data.code === 200 };
    },
};
