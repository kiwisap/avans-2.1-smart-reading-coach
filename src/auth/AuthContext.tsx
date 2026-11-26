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

export interface NameParts {
    firstName: string;
    infix: string; // tussenvoegsel, may be empty
    lastName: string;
}

interface AuthContextValue {
    token: string | null;
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: NameParts, email: string, password: string) => Promise<void>;
    logout: (notice?: string) => void;
    updateUser: (user: User) => void; // after the user changed their name or email address
    notice: string | null; // message for the login page after logging out, for example "account removed"
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
    const [notice, setNotice] = useState<string | null>(null);

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
        setNotice(null);
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
        async ({ firstName, infix, lastName }: NameParts, email: string, password: string) => {
            startSession(
                await apiFetch<AuthResponse>('/auth/register', {
                    method: 'POST',
                    body: {
                        firstName: firstName.trim(),
                        ...(infix.trim() ? { infix: infix.trim() } : {}),
                        lastName: lastName.trim(),
                        email,
                        password,
                    },
                }),
            );
        },
        [startSession],
    );

    // The notice lives here and not in the router state, because the route guard may redirect to
    // the login page before our own navigation does.
    const logout = useCallback((message?: string) => {
        storeToken(null);
        setToken(null);
        setUser(null);
        setNotice(message ?? null);
    }, []);

    const updateUser = useCallback((updated: User) => setUser(updated), []);

    const value = useMemo(
        () => ({ token, user, loading, login, register, logout, updateUser, notice }),
        [token, user, loading, login, register, logout, updateUser, notice],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
}
