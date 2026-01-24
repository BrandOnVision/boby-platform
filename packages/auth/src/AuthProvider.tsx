import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, AuthState, AuthTokens, LoginCredentials, LoginResponse } from './types';

// ============================================================================
// Auth Context
// ============================================================================

interface AuthContextValue extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================================
// Token Storage
// ============================================================================

const TOKEN_KEY = 'boby_auth_tokens';
const USER_KEY = 'boby_auth_user';

function getStoredTokens(): AuthTokens | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
}

function setStoredTokens(tokens: AuthTokens | null): void {
    if (typeof window === 'undefined') return;
    if (tokens) {
        localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
}

function getStoredUser(): User | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
}

function setStoredUser(user: User | null): void {
    if (typeof window === 'undefined') return;
    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(USER_KEY);
    }
}

// ============================================================================
// Auth Provider
// ============================================================================

interface AuthProviderProps {
    children: React.ReactNode;
    /** Base URL for auth API calls */
    apiBaseUrl?: string;
}

/**
 * Auth Provider - Wrap your app with this to enable authentication
 * 
 * @example
 * <AuthProvider apiBaseUrl="https://api.getboby.ai">
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children, apiBaseUrl = '' }: AuthProviderProps) {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });

    // Initialize from stored session
    useEffect(() => {
        const tokens = getStoredTokens();
        const user = getStoredUser();

        if (tokens && user && tokens.expiresAt > Date.now()) {
            setState({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } else {
            // Clear expired tokens
            setStoredTokens(null);
            setStoredUser(null);
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        setState((prev: AuthState) => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await fetch(`${apiBaseUrl}/api/membership/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Login failed');
            }

            const data: LoginResponse = await response.json();

            // Store tokens and user
            setStoredTokens(data.tokens);
            setStoredUser(data.user);

            setState({
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Login failed',
            });
            throw error;
        }
    }, [apiBaseUrl]);

    const logout = useCallback(async () => {
        try {
            const tokens = getStoredTokens();
            if (tokens) {
                // Optionally notify server of logout
                await fetch(`${apiBaseUrl}/api/membership/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${tokens.accessToken}`,
                    },
                }).catch(() => { });
            }
        } finally {
            // Always clear local state
            setStoredTokens(null);
            setStoredUser(null);
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    }, [apiBaseUrl]);

    const refreshAuth = useCallback(async () => {
        const tokens = getStoredTokens();
        if (!tokens?.refreshToken) {
            await logout();
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/membership/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: tokens.refreshToken }),
            });

            if (!response.ok) {
                await logout();
                return;
            }

            const data: LoginResponse = await response.json();
            setStoredTokens(data.tokens);
            setStoredUser(data.user);

            setState({
                user: data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch {
            await logout();
        }
    }, [apiBaseUrl, logout]);

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                logout,
                refreshAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to access auth state and actions
 * 
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/**
 * Hook to get the current user (throws if not authenticated)
 * 
 * @example
 * const user = useUser();
 * console.log(user.firstName);
 */
export function useUser(): User {
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated || !user) {
        throw new Error('useUser must be used when authenticated');
    }
    return user;
}

/**
 * Hook to check if user is authenticated (non-throwing)
 */
export function useIsAuthenticated(): boolean {
    const { isAuthenticated } = useAuth();
    return isAuthenticated;
}

/**
 * Hook to get auth loading state
 */
export function useAuthLoading(): boolean {
    const { isLoading } = useAuth();
    return isLoading;
}
