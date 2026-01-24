import type { ApiError } from './types';

/**
 * Configuration for the API client
 */
export interface ApiClientConfig {
    /** Base URL for API calls */
    baseUrl: string;
    /** Function to get the current auth token */
    getToken?: () => string | null;
    /** Function to handle token refresh */
    onTokenExpired?: () => Promise<string | null>;
    /** Custom headers to include with every request */
    defaultHeaders?: Record<string, string>;
    /** Request timeout in milliseconds */
    timeout?: number;
}

/**
 * Request options for individual API calls
 */
export interface RequestOptions {
    /** Additional headers for this request */
    headers?: Record<string, string>;
    /** Skip authentication for this request */
    skipAuth?: boolean;
    /** Custom timeout for this request */
    timeout?: number;
    /** Abort controller signal */
    signal?: AbortSignal;
}

/**
 * API Client class - core HTTP client for all API calls
 * 
 * @example
 * const client = new ApiClient({
 *   baseUrl: 'https://api.getboby.ai',
 *   getToken: () => localStorage.getItem('token'),
 * });
 * 
 * const jobs = await client.get('/api/jobs');
 */
export class ApiClient {
    private config: ApiClientConfig;

    constructor(config: ApiClientConfig) {
        this.config = {
            timeout: 30000,
            ...config,
        };
    }

    /**
     * Update configuration (e.g., after login)
     */
    setConfig(config: Partial<ApiClientConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Build full URL from path
     */
    private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
        const url = new URL(path, this.config.baseUrl);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    url.searchParams.set(key, String(value));
                }
            });
        }

        return url.toString();
    }

    /**
     * Build headers for request
     */
    private buildHeaders(options?: RequestOptions): Headers {
        const headers = new Headers({
            'Content-Type': 'application/json',
            ...this.config.defaultHeaders,
            ...options?.headers,
        });

        // Add auth token if available and not skipped
        if (!options?.skipAuth && this.config.getToken) {
            const token = this.config.getToken();
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
        }

        return headers;
    }

    /**
     * Handle API response
     */
    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            let error: ApiError;

            try {
                const errorData = await response.json();
                error = {
                    code: errorData.code || 'UNKNOWN_ERROR',
                    message: errorData.message || 'An error occurred',
                    details: errorData.details,
                    status: response.status,
                };
            } catch {
                error = {
                    code: 'UNKNOWN_ERROR',
                    message: response.statusText || 'An error occurred',
                    status: response.status,
                };
            }

            // Handle 401 - token expired
            if (response.status === 401 && this.config.onTokenExpired) {
                const newToken = await this.config.onTokenExpired();
                if (newToken) {
                    // Retry request with new token (caller should handle this)
                    throw { ...error, shouldRetry: true };
                }
            }

            throw error;
        }

        // Handle empty responses
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    /**
     * Make GET request
     */
    async get<T>(
        path: string,
        params?: Record<string, string | number | boolean | undefined | null>,
        options?: RequestOptions
    ): Promise<T> {
        const url = this.buildUrl(path, params as Record<string, string | number | boolean | undefined>);
        const headers = this.buildHeaders(options);

        const controller = new AbortController();
        const timeoutId = setTimeout(
            () => controller.abort(),
            options?.timeout || this.config.timeout
        );

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers,
                signal: options?.signal || controller.signal,
            });

            return this.handleResponse<T>(response);
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * Make POST request
     */
    async post<T>(
        path: string,
        body?: unknown,
        options?: RequestOptions
    ): Promise<T> {
        const url = this.buildUrl(path);
        const headers = this.buildHeaders(options);

        const controller = new AbortController();
        const timeoutId = setTimeout(
            () => controller.abort(),
            options?.timeout || this.config.timeout
        );

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: body ? JSON.stringify(body) : undefined,
                signal: options?.signal || controller.signal,
            });

            return this.handleResponse<T>(response);
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * Make PUT request
     */
    async put<T>(
        path: string,
        body?: unknown,
        options?: RequestOptions
    ): Promise<T> {
        const url = this.buildUrl(path);
        const headers = this.buildHeaders(options);

        const controller = new AbortController();
        const timeoutId = setTimeout(
            () => controller.abort(),
            options?.timeout || this.config.timeout
        );

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers,
                body: body ? JSON.stringify(body) : undefined,
                signal: options?.signal || controller.signal,
            });

            return this.handleResponse<T>(response);
        } finally {
            clearTimeout(timeoutId);
        }
    }

    /**
     * Make DELETE request
     */
    async delete<T>(
        path: string,
        options?: RequestOptions
    ): Promise<T> {
        const url = this.buildUrl(path);
        const headers = this.buildHeaders(options);

        const controller = new AbortController();
        const timeoutId = setTimeout(
            () => controller.abort(),
            options?.timeout || this.config.timeout
        );

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers,
                signal: options?.signal || controller.signal,
            });

            return this.handleResponse<T>(response);
        } finally {
            clearTimeout(timeoutId);
        }
    }
}

/**
 * Create a configured API client instance
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
    return new ApiClient(config);
}
