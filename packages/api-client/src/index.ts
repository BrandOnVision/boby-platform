// Client
export { ApiClient, createApiClient, type ApiClientConfig, type RequestOptions } from './client';

// Endpoints
export {
    authApi,
    agentApi,
    jobsApi,
    shiftsApi,
    earningsApi,
    emergencyApi,
} from './endpoints';

// Types
export type {
    // Generic API types
    ApiResponse,
    ApiError,
    PaginatedResponse,
    PaginationParams,
    // Entity types
    Agent,
    Job,
    JobRequirements,
    JobApplication,
    Shift,
    Earning,
    Venue,
    // Request/Response types
    LoginRequest,
    LoginResponse,
    UpdateProfileRequest,
    ApplyForJobRequest,
    CheckInRequest,
    CheckOutRequest,
    PanicAlertRequest,
} from './types';

// ============================================================================
// Convenience: Create a fully configured API instance
// ============================================================================

import { ApiClient, type ApiClientConfig } from './client';
import {
    authApi,
    agentApi,
    jobsApi,
    shiftsApi,
    earningsApi,
    emergencyApi,
} from './endpoints';

export interface BobyApi {
    client: ApiClient;
    auth: ReturnType<typeof authApi>;
    agent: ReturnType<typeof agentApi>;
    jobs: ReturnType<typeof jobsApi>;
    shifts: ReturnType<typeof shiftsApi>;
    earnings: ReturnType<typeof earningsApi>;
    emergency: ReturnType<typeof emergencyApi>;
}

/**
 * Create a fully configured Boby API instance
 * 
 * @example
 * const api = createBobyApi({
 *   baseUrl: 'https://api.getboby.ai',
 *   getToken: () => localStorage.getItem('boby_token'),
 * });
 * 
 * // Login
 * const { user, tokens } = await api.auth.login({ email, password });
 * 
 * // Get jobs
 * const jobs = await api.jobs.list({ page: 1, pageSize: 10 });
 * 
 * // Apply for a job
 * await api.jobs.apply({ jobId: '123' });
 * 
 * // Send panic alert
 * await api.emergency.panic({ latitude: -27.4705, longitude: 153.0260 });
 */
export function createBobyApi(config: ApiClientConfig): BobyApi {
    const client = new ApiClient(config);

    return {
        client,
        auth: authApi(client),
        agent: agentApi(client),
        jobs: jobsApi(client),
        shifts: shiftsApi(client),
        earnings: earningsApi(client),
        emergency: emergencyApi(client),
    };
}
