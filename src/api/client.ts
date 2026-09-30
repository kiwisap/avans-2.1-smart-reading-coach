const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
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
    const headers: Record<string, string> = {};
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
        throw new ApiError(0, 'De server is niet bereikbaar. Probeer het later opnieuw.');
    }

    const data = (await response.json().catch(() => ({}))) as { message?: string };
    if (!response.ok) {
        throw new ApiError(response.status, data.message ?? 'Er is iets misgegaan');
    }
    return data as T;
}

export function errorMessage(err: unknown): string {
    return err instanceof Error ? err.message : 'Er is iets misgegaan';
}
