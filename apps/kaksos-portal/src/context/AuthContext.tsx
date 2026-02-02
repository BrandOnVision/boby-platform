/**
 * Kaksos Portal Auth Context
 *
 * Provides authentication state and methods for Kaksos users
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    authApi,
    getToken,
    clearToken,
    KaksosUser
} from '../lib/api';

interface AuthContextType {
    user: KaksosUser | null;
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
    const [user, setUser] = useState<KaksosUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            const token = getToken();

            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            try {
                // Verify token with API
                const result = await authApi.verify();

                if (result.valid && result.user) {
                    setUser(result.user);
                } else {
                    clearToken();
                    setUser(null);
                }
            } catch (error) {
                console.error('[KaksosAuth] Session verification failed:', error);
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
            setUser(result.user);
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
                setUser(result.user);
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
