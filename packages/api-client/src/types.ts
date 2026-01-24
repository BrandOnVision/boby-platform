/**
 * Core types for API client
 */

// ============================================================================
// Generic API Types
// ============================================================================

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    status: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

export interface PaginationParams {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Entity Types - Matching existing database schema
// ============================================================================

export interface Agent {
    id: string;
    peelerId: string;
    email: string;
    firstName: string;
    lastName?: string;
    phone?: string;
    securityLicenceNumber?: string;
    securityLicenceExpiry?: string;
    trustScore: number;
    status: 'active' | 'inactive' | 'pending';
    createdAt: string;
    updatedAt: string;
}

export interface Job {
    id: string;
    title: string;
    description: string;
    venueId: string;
    venueName: string;
    venueAddress: string;
    date: string;
    startTime: string;
    endTime: string;
    hourlyRate: number;
    requiredAgents: number;
    filledAgents: number;
    status: 'open' | 'filled' | 'in_progress' | 'completed' | 'cancelled';
    requirements: JobRequirements;
    circleLevel: 'center' | 'inner' | 'mid' | 'outer' | 'public';
    createdAt: string;
}

export interface JobRequirements {
    minTrustScore?: number;
    requiredBelts?: string[];
    requiredHats?: string[];
}

export interface JobApplication {
    id: string;
    jobId: string;
    agentId: string;
    status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
    appliedAt: string;
    respondedAt?: string;
}

export interface Shift {
    id: string;
    jobId: string;
    agentId: string;
    job: Job;
    status: 'scheduled' | 'checked_in' | 'checked_out' | 'completed' | 'no_show';
    scheduledStart: string;
    scheduledEnd: string;
    actualStart?: string;
    actualEnd?: string;
    totalHours?: number;
}

export interface Earning {
    id: string;
    agentId: string;
    shiftId: string;
    venueId: string;
    venueName: string;
    date: string;
    hours: number;
    hourlyRate: number;
    totalAmount: number;
    status: 'pending' | 'processing' | 'paid';
    paidAt?: string;
}

export interface Venue {
    id: string;
    name: string;
    address: string;
    suburb: string;
    state: string;
    postcode: string;
    firmId: string;
    firmName: string;
    contactName?: string;
    contactPhone?: string;
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName?: string;
        telePathCode?: string;
        trustScore: number;
        verificationLevel: string;
        wardrobe: {
            hats: Array<{ id: string; name: string; type: string; isActive: boolean }>;
            belts: Array<{ id: string; name: string; type: string; status: string }>;
            shoes: Array<{ id: string; region: string; maxDistanceKm: number }>;
            keys: Array<{ id: string; resourceId: string; resourceType: string }>;
        };
        briefcase: {
            telePathCode: string;
            trustScore: number;
            credentials: Array<{ type: string; name: string; status: string }>;
            verificationLevel: string;
        };
    };
    tokens: {
        accessToken: string;
        refreshToken?: string;
        expiresAt: number;
    };
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
}

export interface ApplyForJobRequest {
    jobId: string;
    message?: string;
}

export interface CheckInRequest {
    shiftId: string;
    latitude: number;
    longitude: number;
}

export interface CheckOutRequest {
    shiftId: string;
    latitude: number;
    longitude: number;
}

export interface PanicAlertRequest {
    latitude: number;
    longitude: number;
    shiftId?: string;
    message?: string;
    audioUrl?: string;
}
