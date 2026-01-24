/**
 * Core types for the Boby authentication and identity system
 */

// ============================================================================
// User & Authentication Types
// ============================================================================

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    phone?: string;

    // Identity
    telePathCode?: string;
    trustScore: number;
    verificationLevel: 'none' | 'basic' | 'verified' | 'premium';

    // Wardrobe (carried attributes)
    wardrobe: Wardrobe;

    // Briefcase (portable identity)
    briefcase: Briefcase;

    // Timestamps
    createdAt: string;
    lastLoginAt?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt: number;
}

// ============================================================================
// Wardrobe Types (What the Peeler carries)
// ============================================================================

export interface Wardrobe {
    hats: Hat[];
    belts: Belt[];
    shoes: Shoe[];
    keys: AccessKey[];
}

/**
 * Hats = Roles (Agent, Manager, Customer, Auditor, etc.)
 */
export interface Hat {
    id: string;
    name: string;
    type: 'agent' | 'manager' | 'customer' | 'auditor' | 'owner' | 'member';
    isActive: boolean;
    grantedAt: string;
    grantedBy?: string;
}

/**
 * Belts = Certifications (RSA, First Aid, Crowd Control, Security Licence, etc.)
 */
export interface Belt {
    id: string;
    name: string;
    type: 'rsa' | 'first_aid' | 'crowd_control' | 'security_licence' | 'cpr' | 'other';
    status: 'verified' | 'pending' | 'expired';
    issuedAt?: string;
    expiresAt?: string;
    issuingAuthority?: string;
    licenceNumber?: string;
}

/**
 * Shoes = Mobility/Geographic reach
 */
export interface Shoe {
    id: string;
    region: string;
    maxDistanceKm: number;
    availability: 'full_time' | 'part_time' | 'casual' | 'on_call';
}

/**
 * Keys = Special access grants to specific Drawers/Folders
 */
export interface AccessKey {
    id: string;
    resourceId: string;
    resourceType: 'drawer' | 'folder' | 'place';
    resourceName: string;
    expiresAt?: string;
    grantedAt: string;
    grantedBy?: string;
}

// ============================================================================
// Briefcase Types (Portable identity)
// ============================================================================

export interface Briefcase {
    telePathCode: string;
    trustScore: number;
    credentials: PortableCredential[];
    verificationLevel: 'none' | 'basic' | 'verified' | 'premium';
}

export interface PortableCredential {
    type: string;
    name: string;
    status: 'verified' | 'pending' | 'expired';
    verifiedAt?: string;
}

// ============================================================================
// Filing Cabinet Types (Access control)
// ============================================================================

export interface Drawer {
    id: string;
    bobyPlaceId: string;
    name: string;
    accessRequirements: DrawerAccessRequirements;
    createdAt: string;
}

export interface DrawerAccessRequirements {
    minMurmuration?: number;
    requiredHats?: string[];
    requiredBelts?: string[];
}

export interface Folder {
    id: string;
    drawerId: string;
    name: string;
    circleMapping?: 'center' | 'inner' | 'mid' | 'outer' | 'public';
    createdAt: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    tokens: AuthTokens;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
