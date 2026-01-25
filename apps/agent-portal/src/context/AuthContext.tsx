/**
 * Agent Portal Auth Context
 * 
 * Provides authentication state and methods to the entire app
 * Wraps the @boby/auth package with portal-specific logic
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, getToken, clearToken } from '../lib/api';

// User type for the agent portal
interface AgentUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    sponsorCode?: string;
    telepathcode?: string;
    bobyPlaceId?: string;
    peelerHomeId?: string;
    phone?: string;
    email_verified?: boolean;
    phone_verified?: boolean;
    // Address
    street_address?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
}

interface AuthContextType {
    user: AgentUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AgentUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {

            const token = getToken();


            if (!token) {
                // No token = not authenticated, must login

                setUser(null);
                setIsLoading(false);
                return;
            }

            try {
                // Verify token with server

                const result = await authApi.verify();

                if (result.valid && result.user) {
                    setUser(result.user as AgentUser);
                } else {
                    // Token invalid, clear it

                    clearToken();
                    setUser(null);
                }
            } catch (error) {
                console.error('[Auth] Session verification failed:', error);
                // Clear auth state on any verification failure
                clearToken();
                setUser(null);
            } finally {

                setIsLoading(false);
            }
        };

        checkSession();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const result = await authApi.login(email, password);
            setUser(result.user as AgentUser);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const result = await authApi.verify();
            if (result.valid && result.user) {
                setUser(result.user as AgentUser);
            }
        } catch (error) {
            console.error('User refresh failed:', error);
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access auth context
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

/**
 * Hook to get current user
 */
export function useUser() {
    const { user } = useAuth();
    return user;
}

/**
 * Hook to check authentication status
 */
export function useIsAuthenticated() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated;
}
