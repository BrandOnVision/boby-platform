/**
 * Agent Portal Auth Context
 *
 * Provides authentication state and methods to the entire app
 * Wraps the @boby/auth package with portal-specific logic
 */
import { ReactNode } from 'react';
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
interface AuthProviderProps {
    children: ReactNode;
}
export declare function AuthProvider({ children }: AuthProviderProps): import("react/jsx-runtime").JSX.Element;
/**
 * Hook to access auth context
 */
export declare function useAuth(): AuthContextType;
/**
 * Hook to get current user
 */
export declare function useUser(): AgentUser | null;
/**
 * Hook to check authentication status
 */
export declare function useIsAuthenticated(): boolean;
export {};
//# sourceMappingURL=AuthContext.d.ts.map