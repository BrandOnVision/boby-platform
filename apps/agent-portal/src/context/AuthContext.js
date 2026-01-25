import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Agent Portal Auth Context
 *
 * Provides authentication state and methods to the entire app
 * Wraps the @boby/auth package with portal-specific logic
 */
import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, getToken, clearToken } from '../lib/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
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
                    setUser(result.user);
                }
                else {
                    // Token invalid, clear it
                    clearToken();
                    setUser(null);
                }
            }
            catch (error) {
                console.error('[Auth] Session verification failed:', error);
                // Clear auth state on any verification failure
                clearToken();
                setUser(null);
            }
            finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);
    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const result = await authApi.login(email, password);
            setUser(result.user);
        }
        finally {
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
        }
        catch (error) {
            console.error('User refresh failed:', error);
        }
    };
    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
    };
    return (_jsx(AuthContext.Provider, { value: value, children: children }));
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
//# sourceMappingURL=AuthContext.js.map