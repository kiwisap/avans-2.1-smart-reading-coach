import i18n from '../i18n/index.ts';

const API_URL = import.meta.env.VITE_API_URL;

// An error answer from the backend. `message` is the text for the user, already in our language.
export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

// The error answer of the API is a problem details object (RFC 9457, application/problem+json).
// The backend translates `detail` itself, using the Accept-Language header we send.
interface ProblemDetails {
    detail?: string;
}

interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    token?: string | null;
}

// Calls the backend and returns the JSON as type T. Throws ApiError when the request fails.
export async function apiFetch<T = unknown>(
    path: string,
    { method = 'GET', body, token }: RequestOptions = {},
): Promise<T> {
    // The backend answers (errors, advice texts) in the language of the app.
    const headers: Record<string, string> = { 'Accept-Language': i18n.language };
    if (body) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    let response: Response;
    try {
        response = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new ApiError(0, i18n.t('errors.serverUnreachable'));
    }

    const data = (await response.json().catch(() => ({}))) as ProblemDetails;
    if (!response.ok) {
        throw new ApiError(response.status, data.detail ?? i18n.t('errors.generic'));
    }
    return data as T;
}

export function errorMessage(err: unknown): string {
    return err instanceof Error ? err.message : i18n.t('errors.generic');
}
