// Provider
export { AuthProvider, useAuth, useUser, useIsAuthenticated, useAuthLoading } from './AuthProvider';

// Wardrobe Hooks (Hats, Belts, Shoes, Keys)
export { useWardrobe, useHats, useBelts, useShoes, useKeys } from './useWardrobe';

// Briefcase Hooks (Portable Identity)
export {
    useBriefcase,
    useTelePathCode,
    useTrustScore,
    usePortableCredentials,
    useVerificationLevel,
} from './useBriefcase';

// Filing Cabinet Hooks (Access Control)
export { useAccess, useAccessMap, useAccessDeniedReason } from './useAccess';

// Types
export type {
    User,
    AuthState,
    AuthTokens,
    LoginCredentials,
    LoginResponse,
    ApiError,
    // Wardrobe Types
    Wardrobe,
    Hat,
    Belt,
    Shoe,
    AccessKey,
    // Briefcase Types
    Briefcase,
    PortableCredential,
    // Filing Cabinet Types
    Drawer,
    DrawerAccessRequirements,
    Folder,
} from './types';
