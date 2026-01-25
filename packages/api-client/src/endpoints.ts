import type { ApiClient } from './client';
import type {
    Agent,
    Job,
    JobApplication,
    Shift,
    Earning,
    PaginatedResponse,
    PaginationParams,
    LoginRequest,
    LoginResponse,
    UpdateProfileRequest,
    ApplyForJobRequest,
    CheckInRequest,
    CheckOutRequest,
    PanicAlertRequest,
    // Firm types
    Firm,
    FirmStats,
    JobEnquiry,
    CreateJobRequest,
    UpdateJobRequest,
    AssignAgentRequest,
    UpdateEnquiryStatusRequest,
} from './types';

// Helper type for query params
type QueryParams = Record<string, string | number | boolean | undefined | null>;

/**
 * Authentication API endpoints
 */
export function authApi(client: ApiClient) {
    return {
        login: (credentials: LoginRequest) =>
            client.post<LoginResponse>('/api/membership/login', credentials, { skipAuth: true }),

        logout: () =>
            client.post<void>('/api/membership/logout'),

        refresh: (refreshToken: string) =>
            client.post<LoginResponse>('/api/membership/refresh', { refreshToken }, { skipAuth: true }),

        me: () =>
            client.get<LoginResponse['user']>('/api/membership/me'),

        forgotPassword: (email: string) =>
            client.post<{ message: string }>('/api/membership/forgot-password', { email }, { skipAuth: true }),
    };
}

/**
 * Agent API endpoints
 */
export function agentApi(client: ApiClient) {
    return {
        getProfile: () =>
            client.get<Agent>('/api/agent/profile'),

        updateProfile: (data: UpdateProfileRequest) =>
            client.put<Agent>('/api/agent/profile', data),

        getStats: () =>
            client.get<{
                activeJobs: number;
                hoursThisWeek: number;
                earningsThisMonth: number;
                trustScore: number;
            }>('/api/agent/stats'),

        uploadCredential: (formData: FormData) =>
            client.post<{ id: string; status: string }>('/api/agent/credentials', formData),
    };
}

/**
 * Jobs API endpoints
 */
export function jobsApi(client: ApiClient) {
    return {
        list: (params?: PaginationParams & { status?: string; category?: string; circleLevel?: string }) =>
            client.get<PaginatedResponse<Job>>('/api/jobs', params as QueryParams),

        get: (id: string) =>
            client.get<Job>(`/api/jobs/${id}`),

        apply: (data: ApplyForJobRequest) =>
            client.post<JobApplication>('/api/jobs/apply', data),

        getApplications: (params?: PaginationParams) =>
            client.get<PaginatedResponse<JobApplication>>('/api/agent/applications', params as QueryParams),

        withdrawApplication: (applicationId: string) =>
            client.delete<void>(`/api/agent/applications/${applicationId}`),
    };
}

/**
 * Shifts API endpoints
 */
export function shiftsApi(client: ApiClient) {
    return {
        list: (params?: PaginationParams & { status?: string }) =>
            client.get<PaginatedResponse<Shift>>('/api/agent/shifts', params as QueryParams),

        upcoming: (limit?: number) =>
            client.get<Shift[]>('/api/agent/shifts/upcoming', { limit } as QueryParams),

        checkIn: (data: CheckInRequest) =>
            client.post<Shift>('/api/agent/shifts/check-in', data),

        checkOut: (data: CheckOutRequest) =>
            client.post<Shift>('/api/agent/shifts/check-out', data),

        reportIssue: (shiftId: string, message: string) =>
            client.post<{ id: string }>('/api/agent/shifts/report-issue', { shiftId, message }),
    };
}

/**
 * Earnings API endpoints
 */
export function earningsApi(client: ApiClient) {
    return {
        summary: () =>
            client.get<{
                thisWeek: number;
                thisMonth: number;
                pending: number;
                lifetime: number;
            }>('/api/agent/earnings/summary'),

        history: (params?: PaginationParams & { status?: string }) =>
            client.get<PaginatedResponse<Earning>>('/api/agent/earnings', params as QueryParams),

        get: (id: string) =>
            client.get<Earning>(`/api/agent/earnings/${id}`),
    };
}

/**
 * Emergency API endpoints
 */
export function emergencyApi(client: ApiClient) {
    return {
        panic: (data: PanicAlertRequest) =>
            client.post<{ id: string; status: string }>('/api/agent/panic', data),

        cancelPanic: (alertId: string) =>
            client.post<void>(`/api/agent/panic/${alertId}/cancel`),

        getActive: () =>
            client.get<{ id: string; status: string; createdAt: string }[]>('/api/agent/panic/active'),
    };
}

/**
 * Firm API endpoints (Added Jan 25, 2026)
 * For Firm Portal functionality
 */
export function firmApi(client: ApiClient) {
    return {
        // Firm profile
        getProfile: () =>
            client.get<Firm>('/api/firm/profile'),

        updateProfile: (data: Partial<Firm>) =>
            client.put<Firm>('/api/firm/profile', data),

        getStats: () =>
            client.get<FirmStats>('/api/firm/stats'),

        // Job management
        getJobs: (params?: PaginationParams & { status?: string }) =>
            client.get<PaginatedResponse<Job>>('/api/firm/jobs', params as QueryParams),

        createJob: (data: CreateJobRequest) =>
            client.post<Job>('/api/jobs', data),

        updateJob: (jobId: string, data: UpdateJobRequest) =>
            client.put<Job>(`/api/jobs/${jobId}`, data),

        deleteJob: (jobId: string) =>
            client.delete<void>(`/api/jobs/${jobId}`),

        // Job applications/enquiries
        getJobEnquiries: (jobId: string) =>
            client.get<JobEnquiry[]>(`/api/jobs/${jobId}/enquiries`),

        getAllEnquiries: (params?: PaginationParams & { status?: string }) =>
            client.get<PaginatedResponse<JobEnquiry>>('/api/firm/enquiries', params as QueryParams),

        updateEnquiryStatus: (enquiryId: string, data: UpdateEnquiryStatusRequest) =>
            client.put<JobEnquiry>(`/api/enquiries/${enquiryId}/status`, data),

        assignAgent: (data: AssignAgentRequest) =>
            client.post<{ success: boolean; message: string }>('/api/jobs/assign', data),

        // Linked agents
        getLinkedAgents: (params?: PaginationParams) =>
            client.get<PaginatedResponse<Agent>>('/api/firm/agents', params as QueryParams),

        getAgentProfile: (agentId: string) =>
            client.get<Agent>(`/api/agents/${agentId}`),
    };
}

