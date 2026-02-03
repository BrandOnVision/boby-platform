/**
 * Kaksos Portal API Configuration
 *
 * Connects to the existing Boby API server
 * Uses the Peeler First Protocol - all auth goes through /api/membership
 */

/// <reference types="vite/client" />

// API Configuration
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'https://api.getboby.ai';

// Token storage keys
const TOKEN_KEY = 'boby_kaksos_token';
const USER_KEY = 'boby_kaksos_user';

/**
 * Get the stored auth token
 */
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store auth token
 */
export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Clear auth token
 */
export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

/**
 * Get stored user data
 */
export function getStoredUser(): KaksosUser | null {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
}

/**
 * Store user data
 */
export function setStoredUser(user: KaksosUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Handle token expiry - clear storage and redirect to login
 */
function handleTokenExpired(): void {
    clearToken();
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}

// ============================================
// TYPES
// ============================================

export interface KaksosUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    sponsorCode?: string;
}

// ============================================
// AUTH API
// ============================================

export const authApi = {
    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<{
        token: string;
        user: KaksosUser;
    }> {
        const response = await fetch(`${API_BASE_URL}/api/membership/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.code !== 200) {
            throw new Error(data.message || 'Login failed');
        }

        const user = data.data.user;

        // Store token and user
        if (data.data.token) {
            setToken(data.data.token);
            setStoredUser({
                id: user.id,
                email: user.email,
                firstName: user.first_name || user.firstName || 'User',
                lastName: user.last_name || user.lastName || '',
                roles: user.roles || [],
                sponsorCode: user.sponsor_code || user.sponsorCode,
            });
        }

        return {
            token: data.data.token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name || user.firstName || 'User',
                lastName: user.last_name || user.lastName || '',
                roles: user.roles || [],
                sponsorCode: user.sponsor_code || user.sponsorCode,
            },
        };
    },

    /**
     * Verify current token
     */
    async verify(): Promise<{
        valid: boolean;
        user: KaksosUser;
    }> {
        const token = getToken();
        if (!token) {
            throw new Error('No token');
        }

        const response = await fetch(`${API_BASE_URL}/api/membership/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        const data = await response.json();

        if (data.code !== 200) {
            handleTokenExpired();
            throw new Error(data.message || 'Token invalid');
        }

        const user = data.data.user;

        const kaksosUser: KaksosUser = {
            id: user.id,
            email: user.email,
            firstName: user.first_name || user.firstName || 'User',
            lastName: user.last_name || user.lastName || '',
            roles: user.roles || [],
            sponsorCode: user.sponsor_code || user.sponsorCode,
        };

        setStoredUser(kaksosUser);

        return { valid: true, user: kaksosUser };
    },

    /**
     * Logout - clear tokens
     */
    logout(): void {
        clearToken();
    },
};

// ============================================
// CONVERSATION TYPES
// ============================================

export interface Conversation {
    id: number;
    conversation_id: string;
    peeler_id: string | null;
    boby_place_id: string;
    user_message: string;
    kaksos_response: string;
    circle: 'center' | 'inner' | 'mid' | 'outer' | 'public';
    tokens_input: number;
    tokens_output: number;
    cost: number;
    duration_ms: number;
    created_at: string;
    user_name?: string;
    user_email?: string;
    place_name?: string;
}

export interface ConversationsResponse {
    success: boolean;
    data: Conversation[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        offset: number;
        totalPages: number;
        hasMore: boolean;
    };
}

export interface ConversationResponse {
    success: boolean;
    conversation: Conversation;
}

// ============================================
// SETTINGS TYPES
// ============================================

export interface KaksosSettings {
    boby_place_id: string;
    kaksos_name: string;
    communication_style: string;
    response_length: string;
    proactiveness: string;
    custom_instructions: string;
    value_framework: string | null;
    preferred_model: string;
}

export interface SettingsResponse {
    success: boolean;
    has_settings: boolean;
    has_api_key: boolean;
    api_key_preview: string | null;
    settings: KaksosSettings;
}

export interface ApiKeyResponse {
    success: boolean;
    message?: string;
    has_api_key: boolean;
    api_key_preview: string | null;
}

export interface ApiKeyTestResponse {
    success: boolean;
    valid: boolean;
    message: string;
}

// ============================================
// SETTINGS API
// ============================================

// Settings API uses kaksos.getboby.ai (routes to kaksos-api via Cloudflare Worker)
const KAKSOS_API_URL = 'https://kaksos.getboby.ai';

export const settingsApi = {
    /**
     * Fetch settings for a Boby Place
     */
    async getSettings(bobyPlaceId: string): Promise<SettingsResponse> {
        const token = getToken();

        const response = await fetch(`${KAKSOS_API_URL}/api/settings/${bobyPlaceId}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch settings: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Save settings for a Boby Place
     */
    async saveSettings(bobyPlaceId: string, settings: Partial<KaksosSettings>): Promise<{ success: boolean }> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/settings/${bobyPlaceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(settings),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to save settings: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Test settings with a preview message
     */
    async testPreview(params: {
        boby_place_id?: string;
        kaksos_name?: string;
        communication_style?: string;
        response_length?: string;
        proactiveness?: string;
        custom_instructions?: string;
        test_question: string;
    }): Promise<{
        success: boolean;
        response: string;
        settings_used: {
            kaksos_name: string;
            communication_style: string;
            response_length: string;
            proactiveness: string;
        };
    }> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/settings/test-preview`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Test failed: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Save API key (encrypted on server)
     */
    async saveApiKey(bobyPlaceId: string, apiKey: string): Promise<ApiKeyResponse> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/settings/${bobyPlaceId}/api-key`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ api_key: apiKey }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to save API key: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Remove API key
     */
    async removeApiKey(bobyPlaceId: string): Promise<ApiKeyResponse> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/settings/${bobyPlaceId}/api-key`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to remove API key: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Test API key validity
     */
    async testApiKey(bobyPlaceId: string): Promise<ApiKeyTestResponse> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/settings/${bobyPlaceId}/api-key/test`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to test API key: ${response.status}`);
        }

        return response.json();
    },
};

// ============================================
// CONVERSATIONS API
// ============================================

export const conversationsApi = {
    /**
     * List conversations for a Boby Place
     */
    async list(bobyPlaceId: string, options?: {
        limit?: number;
        offset?: number;
        circle?: string;
        search?: string;
    }): Promise<ConversationsResponse> {
        const token = getToken();

        const params = new URLSearchParams({
            bobyPlaceId,
            limit: String(options?.limit || 20),
            offset: String(options?.offset || 0),
        });

        if (options?.circle) {
            params.append('circle', options.circle);
        }
        if (options?.search) {
            params.append('search', options.search);
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/conversations?${params}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch conversations: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Get a single conversation by ID
     */
    async get(id: number): Promise<ConversationResponse> {
        const token = getToken();

        const response = await fetch(`${KAKSOS_API_URL}/api/conversations/${id}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch conversation: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Delete a conversation
     */
    async delete(id: number): Promise<{ success: boolean; message: string }> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/conversations/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to delete conversation: ${response.status}`);
        }

        return response.json();
    },
};

// ============================================
// KMKY TYPES (Know Me Know You)
// ============================================

export interface KmkyMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export interface KmkyConversation {
    id: string;
    title: string;
    status: 'active' | 'archived' | 'planted';
    message_count: number;
    created_at: string;
    updated_at: string;
    messages?: KmkyMessage[];
}

export interface KmkyConversationsResponse {
    success: boolean;
    conversations: KmkyConversation[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

export interface KmkyConversationResponse {
    success: boolean;
    conversation: KmkyConversation;
}

export interface KmkyMessageResponse {
    success: boolean;
    userMessage: KmkyMessage;
    assistantMessage: KmkyMessage;
    messageCount: number;
    newTitle?: string;
}

export interface KmkyStatistics {
    conversations: {
        total: number;
        active: number;
        planted: number;
    };
    qaPairs: {
        total: number;
        pending: number;
        trained: number;
        rejected: number;
    };
}

// ============================================
// KMKY API
// ============================================

export const kmkyApi = {
    /**
     * Create a new conversation
     */
    async createConversation(bobyPlaceId: string, title?: string): Promise<{ success: boolean; conversationId: string }> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/kmky/conversations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bobyPlaceId, title }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to create conversation: ${response.status}`);
        }

        return response.json();
    },

    /**
     * List conversations
     */
    async listConversations(bobyPlaceId: string, options?: {
        status?: 'active' | 'archived' | 'planted';
        limit?: number;
        offset?: number;
    }): Promise<KmkyConversationsResponse> {
        const token = getToken();

        const params = new URLSearchParams({
            bobyPlaceId,
            limit: String(options?.limit || 50),
            offset: String(options?.offset || 0),
        });

        if (options?.status) {
            params.append('status', options.status);
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/kmky/conversations?${params}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch conversations: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Get a conversation with messages
     */
    async getConversation(conversationId: string, bobyPlaceId: string): Promise<KmkyConversationResponse> {
        const token = getToken();

        const response = await fetch(`${KAKSOS_API_URL}/api/kmky/conversations/${conversationId}?bobyPlaceId=${bobyPlaceId}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch conversation: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Send a message in a conversation
     */
    async sendMessage(conversationId: string, content: string, bobyPlaceId: string): Promise<KmkyMessageResponse> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/kmky/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content, bobyPlaceId }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to send message: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Archive (plant) a conversation - extracts QA pairs
     */
    async archiveConversation(conversationId: string, bobyPlaceId: string): Promise<{
        success: boolean;
        qaCount: number;
        qaPairs: Array<{ question: string; answer: string }>;
        conversationDeleted: boolean;
    }> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/kmky/conversations/${conversationId}/archive`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bobyPlaceId }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to archive conversation: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Delete a conversation
     */
    async deleteConversation(conversationId: string, bobyPlaceId: string): Promise<{ success: boolean }> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/kmky/conversations/${conversationId}?bobyPlaceId=${bobyPlaceId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to delete conversation: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Get KMKY statistics
     */
    async getStatistics(bobyPlaceId: string): Promise<{ success: boolean; statistics: KmkyStatistics }> {
        const token = getToken();

        const response = await fetch(`${KAKSOS_API_URL}/api/kmky/statistics?bobyPlaceId=${bobyPlaceId}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch statistics: ${response.status}`);
        }

        return response.json();
    },
};

// ============================================
// QA ARCHIVE TYPES (Nurture)
// ============================================

export interface QAPair {
    id: string;
    conversation_id: string;
    question_number: number;
    question: string;
    answer: string;
    circle_assignment: 'center' | 'inner' | 'mid' | 'outer' | 'public';
    training_status: 'pending' | 'trained' | 'rejected' | 'tested';
    trained_as_type?: string;
    training_example_id?: number;
    seed_id?: string;
    created_at: string;
    trained_at?: string;
    importance: number;
    source_peeler_id?: string;
    source_peeler_name?: string;
    source_type: 'kmky' | 'public';
    personal_only: boolean;
    wrong_answer?: string;
    training_feedback?: string;
}

export interface QAArchiveResponse {
    success: boolean;
    count: number;
    qaPairs: QAPair[];
}

export interface QATrainResponse {
    success: boolean;
    message: string;
    trainingExampleId?: number;
}

// ============================================
// QA ARCHIVE API (Nurture)
// ============================================

export const qaArchiveApi = {
    /**
     * List QA pairs from archive
     */
    async list(bobyPlaceId: string, options?: {
        trainingStatus?: 'pending' | 'trained' | 'rejected' | 'tested';
        circleLevel?: string;
        limit?: number;
        offset?: number;
    }): Promise<QAArchiveResponse> {
        const token = getToken();

        const params = new URLSearchParams({
            bobyPlaceId,
            limit: String(options?.limit || 100),
            offset: String(options?.offset || 0),
        });

        if (options?.trainingStatus) {
            params.append('trainingStatus', options.trainingStatus);
        }
        if (options?.circleLevel) {
            params.append('circleLevel', options.circleLevel);
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/kmky/qa-archive?${params}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch QA archive: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Train a QA pair (approve, correct, reject)
     */
    async train(qaId: string, params: {
        action: 'approve' | 'correct' | 'reject' | 'tested';
        bobyPlaceId: string;
        correctedAnswer?: string;
        circleLevel?: string;
    }): Promise<QATrainResponse> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/kmky/qa-archive/${qaId}/train`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to train QA pair: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Update circle assignment for a QA pair
     */
    async updateCircle(qaId: string, circleLevel: string, bobyPlaceId: string): Promise<{ success: boolean }> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/kmky/qa-archive/${qaId}/circle?bobyPlaceId=${bobyPlaceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ circleLevel }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to update circle: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Delete a QA pair
     */
    async delete(qaId: string, bobyPlaceId: string): Promise<{ success: boolean }> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/kmky/qa-archive/${qaId}?bobyPlaceId=${bobyPlaceId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to delete QA pair: ${response.status}`);
        }

        return response.json();
    },
};

// ============================================
// SOWING TYPES
// ============================================

export interface SowingAnswer {
    question_id: number;
    answer_text: string;
    circle_level: 'center' | 'inner' | 'mid' | 'outer';
    is_living_memory?: boolean;
    answered_at?: string;
}

export interface SowingAnswersResponse {
    success: boolean;
    answers: SowingAnswer[];
}

export interface SowingCompleteResponse {
    success: boolean;
    message: string;
    instructions?: string;
    instructionPreview?: string;
    seedCount?: number;
    seedsStored?: number;
    metadata?: {
        generator: string;
        ownerName: string;
        categoryCounts?: Record<string, number>;
    };
}

// ============================================
// SOWING API
// ============================================

export const sowingApi = {
    /**
     * Get existing answers for the current user
     */
    async getAnswers(): Promise<SowingAnswersResponse> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/sowing/answers`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch answers: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Save or update an answer (upsert)
     */
    async saveAnswer(params: {
        question_id: number;
        answer_text: string;
        circle_level?: 'center' | 'inner' | 'mid' | 'outer';
        is_living_memory?: boolean;
    }): Promise<{ success: boolean; message: string; verified?: boolean }> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/sowing/answer`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to save answer: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Reset all answers for the current user
     */
    async resetAnswers(): Promise<{ success: boolean; message: string }> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/sowing/reset`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to reset answers: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Complete the sowing session
     */
    async complete(params: {
        bobyPlaceId: string;
        answers?: Record<string, string>;
        tier?: 'starter' | 'deep' | 'complete';
        kaksosName?: string;
    }): Promise<SowingCompleteResponse> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/sowing/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to complete sowing: ${response.status}`);
        }

        return response.json();
    },
};

// ============================================
// CIRCLE MANAGEMENT TYPES
// ============================================

export type CircleLevel = 'center' | 'inner' | 'mid' | 'outer' | 'public';

export interface CircleMember {
    id: string;
    peeler_id: string;
    peeler_email: string | null;
    peeler_name: string | null;
    circle_level: CircleLevel;
    relationship_notes: string | null;
    invited_at: string;
    accepted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface CircleStats {
    center: number;
    inner: number;
    mid: number;
    outer: number;
    public: number;
}

export interface CircleMembersResponse {
    success: boolean;
    members: CircleMember[];
    stats: CircleStats;
    total: number;
}

export interface CircleMemberResponse {
    success: boolean;
    message: string;
    member?: CircleMember;
}

export interface CircleLookupResponse {
    success: boolean;
    exists: boolean;
    member?: CircleMember;
    peeler?: {
        id: string;
        email: string;
        name: string | null;
    };
    message?: string;
}

// ============================================
// CIRCLE MANAGEMENT API
// ============================================

export const circlesApi = {
    /**
     * List all circle members
     */
    async listMembers(bobyPlaceId: string, circleLevel?: CircleLevel | 'all'): Promise<CircleMembersResponse> {
        const token = getToken();

        const params = new URLSearchParams({ bobyPlaceId });
        if (circleLevel && circleLevel !== 'all') {
            params.append('circleLevel', circleLevel);
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/circles/members?${params}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch members: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Add a new member to a circle
     */
    async addMember(params: {
        bobyPlaceId: string;
        peelerId: string;
        peelerEmail?: string;
        peelerName?: string;
        circleLevel: CircleLevel;
        relationshipNotes?: string;
    }): Promise<CircleMemberResponse> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/circles/members`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to add member: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Update a member's circle level or details
     */
    async updateMember(id: string, bobyPlaceId: string, updates: {
        circleLevel?: CircleLevel;
        peelerName?: string;
        peelerEmail?: string;
        relationshipNotes?: string;
    }): Promise<{ success: boolean; message: string }> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/circles/members/${id}?bobyPlaceId=${bobyPlaceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to update member: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Remove a member from circles
     */
    async removeMember(id: string, bobyPlaceId: string): Promise<{ success: boolean; message: string }> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/circles/members/${id}?bobyPlaceId=${bobyPlaceId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to remove member: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Look up a member by TelePathCode
     */
    async lookupMember(peelerId: string, bobyPlaceId: string): Promise<CircleLookupResponse> {
        const token = getToken();

        const response = await fetch(`${KAKSOS_API_URL}/api/circles/members/${peelerId}/lookup?bobyPlaceId=${bobyPlaceId}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to lookup member: ${response.status}`);
        }

        return response.json();
    },
};

// ============================================
// NURTURE v2 TYPES
// ============================================

export interface NurtureChatResponse {
    responseId: string;
    message: string;
    circleLevel: string;
    memberContext: string;
    memoryContext: {
        totalMemories: number;
        byType: {
            seeds: number;
            personalSubsets: number;
            qaMemories: number;
        };
        byCircle: Record<string, number>;
    };
    sources: Array<{
        type: string;
        seedId?: string;
        subsetId?: string;
        peelerId?: string;
        peelerName?: string;
        circle?: string;
    }>;
    timestamp: string;
}

export interface NurtureFeedbackResponse {
    success: boolean;
    feedbackId: string;
    message: string;
}

export interface NurturePendingSeedsResponse {
    needsReview: Array<{
        id: string;
        question: string;
        answer: string;
        circle_level: string;
        category: string;
        review_reason: string;
        updated_at: string;
    }>;
    pendingCorrections: Array<{
        id: string;
        suggested_answer: string;
        status: string;
        created_at: string;
        correction_text: string;
        response_id: string;
    }>;
    recentRevocations: Array<{
        id: string;
        fact_summary: string;
        peeler_name: string;
        revoked_reason: string;
        revoked_at: string;
    }>;
    summary: {
        totalNeedsAttention: number;
        reviewCount: number;
        correctionCount: number;
        revocationCount: number;
    };
}

export interface NurtureStatsResponse {
    seeds: {
        byCircle: Record<string, { total: number; active: number }>;
        total: number;
    };
    personalSubsets: {
        total: number;
        active: number;
        uniqueContributors: number;
    };
    activity: {
        seedsThisWeek: number;
        seedsThisMonth: number;
    };
    feedback: {
        total: number;
        good: number;
        corrections: number;
        never: number;
    };
    circles: Record<string, number>;
}

export interface NurtureCircleMembersResponse {
    members: Array<{
        id: string;
        member_user_id: string;
        member_name: string;
        member_email: string;
        circle_level: string;
        created_at: string;
    }>;
    total: number;
}

// ============================================
// NURTURE v2 API
// ============================================

// ============================================
// WATCH GROW TYPES (Long-Term Memory)
// ============================================

export interface WatchGrowSeed {
    id: string;
    question: string;
    answer: string;
    circle_level: CircleLevel;
    source_peeler_id: string | null;
    source_peeler_name: string | null;
    source_circle_level: string | null;
    category: string | null;
    created_at: string;
    trained_at: string | null;
    is_boundary: boolean;
}

export interface WatchGrowSeedsResponse {
    success: boolean;
    seeds: WatchGrowSeed[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

export interface WatchGrowStatsResponse {
    success: boolean;
    stats: {
        totalSeeds: number;
        boundarySeeds: number;
        byCircle: Record<string, { total: number; active: number }>;
        growth: {
            thisWeek: number;
            thisMonth: number;
        };
        timeline: Array<{
            weekStart: string;
            seedsAdded: number;
        }>;
        uniqueContributors: number;
    };
}

export interface WatchGrowSeedResponse {
    success: boolean;
    seed: WatchGrowSeed;
}

export interface WatchGrowBoundaryResponse {
    success: boolean;
    message: string;
    is_boundary: boolean;
}

// ============================================
// WATCH GROW API (Long-Term Memory)
// ============================================

// ============================================
// SEEDS LIBRARY TYPES
// ============================================

export interface SeedQuestion {
    id: number;
    questionNumber: number;
    questionText: string;
    helperText: string | null;
    category: 'essential' | 'deep_roots' | 'complete';
    subcategory: string | null;
    answer: string | null;
    source: 'settings' | 'library' | null;
    updatedAt: string | null;
}

export interface SeedsLibraryQuestionsResponse {
    success: boolean;
    questions: SeedQuestion[];
    stats: {
        total: number;
        answered: number;
        unanswered: number;
    };
}

export interface SeedsLibraryStatsResponse {
    total: number;
    answered: number;
    unanswered: number;
    byCategory: Record<string, { total: number; answered: number }>;
    bySource: Record<string, number>;
}

export interface SeedsLibraryAnswerResponse {
    success: boolean;
    questionId: number;
    answer: string;
    source: string;
    updatedAt: string;
}

// ============================================
// SEEDS LIBRARY API
// ============================================

export const seedsLibraryApi = {
    /**
     * Get all 99 questions with answers
     */
    async getQuestions(bobyPlaceId: string, options?: {
        category?: 'essential' | 'deep_roots' | 'complete' | 'all';
        answered?: boolean;
    }): Promise<SeedsLibraryQuestionsResponse> {
        const token = getToken();

        const params = new URLSearchParams();
        if (options?.category && options.category !== 'all') {
            params.append('category', options.category);
        }
        if (options?.answered !== undefined) {
            params.append('answered', String(options.answered));
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/seeds-library/questions?${params}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                'X-Boby-Place-Id': bobyPlaceId,
                'X-User-Id': getStoredUser()?.id || '',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch questions: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Save or update an answer
     */
    async saveAnswer(bobyPlaceId: string, questionId: number, answer: string): Promise<SeedsLibraryAnswerResponse> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/seeds-library/questions/${questionId}/answer`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Boby-Place-Id': bobyPlaceId,
                'X-User-Id': getStoredUser()?.id || '',
            },
            body: JSON.stringify({ answer }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to save answer: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Get summary statistics
     */
    async getStats(bobyPlaceId: string): Promise<SeedsLibraryStatsResponse> {
        const token = getToken();

        const response = await fetch(`${KAKSOS_API_URL}/api/seeds-library/stats`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                'X-Boby-Place-Id': bobyPlaceId,
                'X-User-Id': getStoredUser()?.id || '',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch stats: ${response.status}`);
        }

        return response.json();
    },
};

export const watchGrowApi = {
    /**
     * List permanent seeds (Long-Term Memory)
     */
    async getSeeds(bobyPlaceId: string, options?: {
        circle?: CircleLevel | 'all';
        search?: string;
        limit?: number;
        offset?: number;
        includeBoundary?: boolean;
    }): Promise<WatchGrowSeedsResponse> {
        const token = getToken();

        const params = new URLSearchParams({
            limit: String(options?.limit || 50),
            offset: String(options?.offset || 0),
        });

        if (options?.circle && options.circle !== 'all') {
            params.append('circle', options.circle);
        }
        if (options?.search) {
            params.append('search', options.search);
        }
        if (options?.includeBoundary) {
            params.append('includeBoundary', 'true');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/watch-grow/seeds?${params}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                'X-Boby-Place-Id': bobyPlaceId,
                'X-User-Id': getStoredUser()?.id || '',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch seeds: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Get growth statistics
     */
    async getStats(bobyPlaceId: string): Promise<WatchGrowStatsResponse> {
        const token = getToken();

        const response = await fetch(`${KAKSOS_API_URL}/api/watch-grow/stats`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                'X-Boby-Place-Id': bobyPlaceId,
                'X-User-Id': getStoredUser()?.id || '',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch stats: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Get a specific seed's full details
     */
    async getSeed(bobyPlaceId: string, seedId: string): Promise<WatchGrowSeedResponse> {
        const token = getToken();

        const response = await fetch(`${KAKSOS_API_URL}/api/watch-grow/seeds/${seedId}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                'X-Boby-Place-Id': bobyPlaceId,
                'X-User-Id': getStoredUser()?.id || '',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch seed: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Mark a seed as boundary (suppressed) - per "No Unsee" principle
     */
    async setBoundary(bobyPlaceId: string, seedId: string, isBoundary: boolean, reason?: string): Promise<WatchGrowBoundaryResponse> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/watch-grow/seeds/${seedId}/boundary`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Boby-Place-Id': bobyPlaceId,
                'X-User-Id': getStoredUser()?.id || '',
            },
            body: JSON.stringify({ is_boundary: isBoundary, reason }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Failed to update boundary: ${response.status}`);
        }

        return response.json();
    },
};

export const nurtureApi = {
    /**
     * Test a message as a specific circle member
     */
    async chat(params: {
        bobyPlaceId: string;
        message: string;
        circleLevel: CircleLevel;
        memberId?: string;
        memberName?: string;
    }): Promise<NurtureChatResponse> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/nurture/chat`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Boby-Place-Id': params.bobyPlaceId,
                'X-User-Id': getStoredUser()?.id || '',
            },
            body: JSON.stringify({
                message: params.message,
                circleLevel: params.circleLevel,
                memberId: params.memberId,
                memberName: params.memberName,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Chat failed: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Record feedback on a response with multi-circle support
     */
    async feedback(params: {
        bobyPlaceId: string;
        responseId: string;
        feedbackType: 'good' | 'correct' | 'never';
        correction?: string;
        seedId?: string;
        reason?: string;
        // Fields for creating trained seeds
        question?: string;
        answer?: string;
        // Multi-circle support - array of circles to save to
        circleLevels?: CircleLevel[];
        testerName?: string;
    }): Promise<NurtureFeedbackResponse> {
        const token = getToken();

        if (!token) {
            throw new Error('Authentication required');
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/nurture/feedback`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Boby-Place-Id': params.bobyPlaceId,
                'X-User-Id': getStoredUser()?.id || '',
            },
            body: JSON.stringify({
                responseId: params.responseId,
                feedbackType: params.feedbackType,
                correction: params.correction,
                seedId: params.seedId,
                reason: params.reason,
                question: params.question,
                answer: params.answer,
                // Send array of circles for multi-circle approval
                circleLevels: params.circleLevels,
                testerName: params.testerName,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Feedback failed: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Get seeds needing attention
     */
    async getPendingSeeds(bobyPlaceId: string): Promise<NurturePendingSeedsResponse> {
        const token = getToken();

        const response = await fetch(`${KAKSOS_API_URL}/api/nurture/pending-seeds`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                'X-Boby-Place-Id': bobyPlaceId,
                'X-User-Id': getStoredUser()?.id || '',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch pending seeds: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Get nurture statistics
     */
    async getStats(bobyPlaceId: string): Promise<NurtureStatsResponse> {
        const token = getToken();

        const response = await fetch(`${KAKSOS_API_URL}/api/nurture/stats`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                'X-Boby-Place-Id': bobyPlaceId,
                'X-User-Id': getStoredUser()?.id || '',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch stats: ${response.status}`);
        }

        return response.json();
    },

    /**
     * Get circle members for perspective selector
     */
    async getCircleMembers(bobyPlaceId: string, circle?: CircleLevel): Promise<NurtureCircleMembersResponse> {
        const token = getToken();

        const params = new URLSearchParams();
        if (circle) {
            params.append('circle', circle);
        }

        const response = await fetch(`${KAKSOS_API_URL}/api/nurture/circle-members?${params}`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
                'X-Boby-Place-Id': bobyPlaceId,
                'X-User-Id': getStoredUser()?.id || '',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch circle members: ${response.status}`);
        }

        return response.json();
    },
};
