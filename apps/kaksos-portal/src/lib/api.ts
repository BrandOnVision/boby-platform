/**
 * Kaksos Portal API Configuration
 *
 * Connects to the existing Boby API server
 * Uses the Peeler First Protocol - all auth goes through /api/membership
 */

/// <reference types="vite/client" />

// API Configuration
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'https://api.getboby.ai';

// Token storage keys
const TOKEN_KEY = 'boby_kaksos_token';
const USER_KEY = 'boby_kaksos_user';

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
export function getStoredUser(): KaksosUser | null {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
}

/**
 * Store user data
 */
export function setStoredUser(user: KaksosUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
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

export interface KaksosUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    sponsorCode?: string;
}

// ============================================
// AUTH API
// ============================================

export const authApi = {
    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<{
        token: string;
        user: KaksosUser;
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
                sponsorCode: user.sponsor_code || user.sponsorCode,
            });
        }

        return {
            token: data.data.token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name || user.firstName || 'User',
                lastName: user.last_name || user.lastName || '',
                roles: user.roles || [],
                sponsorCode: user.sponsor_code || user.sponsorCode,
            },
        };
    },

    /**
     * Verify current token
     */
    async verify(): Promise<{
        valid: boolean;
        user: KaksosUser;
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

        const kaksosUser: KaksosUser = {
            id: user.id,
            email: user.email,
            firstName: user.first_name || user.firstName || 'User',
            lastName: user.last_name || user.lastName || '',
            roles: user.roles || [],
            sponsorCode: user.sponsor_code || user.sponsorCode,
        };

        setStoredUser(kaksosUser);

        return { valid: true, user: kaksosUser };
    },

    /**
     * Logout - clear tokens
     */
    logout(): void {
        clearToken();
    },
};

// ============================================
// SETTINGS TYPES
// ============================================

export interface KaksosSettings {
    boby_place_id: string;
    kaksos_name: string;
    communication_style: string;
    response_length: string;
    proactiveness: string;
    custom_instructions: string;
    value_framework: string | null;
    preferred_model: string;
}

export interface SettingsResponse {
    success: boolean;
    has_settings: boolean;
    settings: KaksosSettings;
}

// ============================================
// SETTINGS API
// ============================================

// Settings API uses kaksos.getboby.ai (routes to kaksos-api via Cloudflare Worker)
const KAKSOS_API_URL = 'https://kaksos.getboby.ai';

export const settingsApi = {
    /**
     * Fetch settings for a Boby Place
     */
    async getSettings(bobyPlaceId: string): Promise<SettingsResponse> {
        const token = getToken();

        const response = await fetch(`${KAKSOS_API_URL}/api/settings/${bobyPlaceId}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch settings: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Save settings for a Boby Place
     */
    async saveSettings(bobyPlaceId: string, settings: Partial<KaksosSettings>): Promise<{ success: boolean }> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/settings/${bobyPlaceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to save settings: ${response.status}`);
        }

        return response.json();
    },
};
