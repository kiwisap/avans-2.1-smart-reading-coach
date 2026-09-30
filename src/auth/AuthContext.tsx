import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { apiFetch } from '../api/client.ts';
import type { AuthResponse, User } from '../types/api.ts';

const TOKEN_KEY = 'src_token';

interface AuthContextValue {
    token: string | null;
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredToken(): string | null {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

function storeToken(token: string | null): void {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
    } catch {
        // Storage can be unavailable (private mode). The session then lasts until reload.
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(readStoredToken);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(Boolean(readStoredToken()));

    // Restore the session from a stored token.
    useEffect(() => {
        // Without a stored token there is nothing to restore (loading starts as false).
        if (!token) return undefined;
        let cancelled = false;
        apiFetch<{ user: User }>('/auth/me', { token })
            .then((data) => {
                if (!cancelled) setUser(data.user);
            })
            .catch(() => {
                if (cancelled) return;
                storeToken(null);
                setToken(null);
                setUser(null);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [token]);

    const startSession = useCallback((data: AuthResponse) => {
        storeToken(data.token);
        setUser(data.user);
        setToken(data.token);
    }, []);

    const login = useCallback(
        async (email: string, password: string) => {
            startSession(
                await apiFetch<AuthResponse>('/auth/login', {
                    method: 'POST',
                    body: { email, password },
                }),
            );
        },
        [startSession],
    );

    const register = useCallback(
        async (name: string, email: string, password: string) => {
            startSession(
                await apiFetch<AuthResponse>('/auth/register', {
                    method: 'POST',
                    body: { name, email, password },
                }),
            );
        },
        [startSession],
    );

    const logout = useCallback(() => {
        storeToken(null);
        setToken(null);
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({ token, user, loading, login, register, logout }),
        [token, user, loading, login, register, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
}
