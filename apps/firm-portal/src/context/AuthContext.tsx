/**
 * Firm Portal Auth Context
 * 
 * Provides authentication state and methods for firm users
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    authApi,
    firmApi,
    getToken,
    clearToken,
    getStoredFirm,
    setStoredFirm,
    FirmUser,
    FirmProfile
} from '../lib/api';

interface AuthContextType {
    user: FirmUser | null;
    firm: FirmProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    firmId: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    refreshFirm: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<FirmUser | null>(null);
    const [firm, setFirm] = useState<FirmProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            const token = getToken();

            if (!token) {
                setUser(null);
                setFirm(null);
                setIsLoading(false);
                return;
            }

            try {
                // Verify token with API
                const result = await authApi.verify();

                if (result.valid && result.user) {
                    setUser(result.user);

                    // Load firm from storage or API
                    let firmData = getStoredFirm();
                    if (!firmData) {
                        firmData = await firmApi.getMyFirm();
                        if (firmData) {
                            setStoredFirm(firmData);
                        }
                    }
                    setFirm(firmData);
                } else {
                    clearToken();
                    setUser(null);
                    setFirm(null);
                }
            } catch (error) {
                console.error('[FirmAuth] Session verification failed:', error);
                clearToken();
                setUser(null);
                setFirm(null);
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
            setFirm(result.firm || null);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
        setFirm(null);
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

    const refreshFirm = async () => {
        try {
            const firmData = await firmApi.getMyFirm();
            if (firmData) {
                setStoredFirm(firmData);
                setFirm(firmData);
            }
        } catch (error) {
            console.error('Firm refresh failed:', error);
        }
    };

    // Get firm ID from firm data or user data
    const firmId = firm?.id || user?.firmId || null;

    const value: AuthContextType = {
        user,
        firm,
        isLoading,
        isAuthenticated: !!user,
        firmId,
        login,
        logout,
        refreshUser,
        refreshFirm,
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
 * Hook to get current firm
 */
export function useFirm() {
    const { firm } = useAuth();
    return firm;
}

/**
 * Hook to check authentication status
 */
export function useIsAuthenticated() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated;
}

/**
 * Hook to get firm ID
 */
export function useFirmId() {
    const { firmId } = useAuth();
    return firmId;
}
