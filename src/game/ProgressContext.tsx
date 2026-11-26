import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { apiFetch } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import XpToasts, { type XpToast } from '../components/XpToasts.tsx';
import type { Progress } from '../types/api.ts';

interface ProgressContextValue {
    progress: Progress | null; // null for teachers and while loading
    // Call after something that can earn XP. Shows "+XP" and new badges when there are any.
    refresh: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

interface Stored {
    userId: string;
    data: Progress;
}

const SHOW_MS = 4000;
const SHOW_BADGE_MS = 8000;

// The game of the app: XP and badges of the logged in student, available on every page.
export function ProgressProvider({ children }: { children: ReactNode }) {
    const { token, user } = useAuth();
    const studentId = user?.role === 'student' ? user.id : null;
    const [stored, setStored] = useState<Stored | null>(null);
    const [toasts, setToasts] = useState<XpToast[]>([]);
    const last = useRef<Stored | null>(null); // what the next refresh compares with
    const nextToastId = useRef(0);

    useEffect(() => {
        if (!studentId || !token) return undefined;
        let cancelled = false;
        apiFetch<Progress>('/progress/me', { token })
            .then((data) => {
                if (cancelled) return;
                last.current = { userId: studentId, data };
                setStored(last.current);
            })
            .catch(() => {
                // Without progress the app works as before, only without XP.
            });
        return () => {
            cancelled = true;
        };
    }, [studentId, token]);

    const dismiss = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const refresh = useCallback(async () => {
        if (!studentId || !token) return;
        try {
            const data = await apiFetch<Progress>('/progress/me', { token });
            const before = last.current?.userId === studentId ? last.current.data : null;
            last.current = { userId: studentId, data };
            setStored(last.current);
            if (!before || data.xp <= before.xp) return;

            const earnedBefore = new Set(
                before.badges.filter((badge) => badge.earnedAt).map((badge) => badge.id),
            );
            const badges = data.badges
                .filter((badge) => badge.earnedAt && !earnedBefore.has(badge.id))
                .map((badge) => badge.id);
            nextToastId.current += 1;
            const id = nextToastId.current;
            setToasts((current) => [...current, { id, xp: data.xp - before.xp, badges }]);
            window.setTimeout(() => dismiss(id), badges.length > 0 ? SHOW_BADGE_MS : SHOW_MS);
        } catch {
            // A missed update is not worth an error message, the next one catches up.
        }
    }, [studentId, token, dismiss]);

    const progress = stored && stored.userId === studentId ? stored.data : null;
    const value = useMemo(() => ({ progress, refresh }), [progress, refresh]);

    return (
        <ProgressContext.Provider value={value}>
            {children}
            <XpToasts toasts={studentId ? toasts : []} onDismiss={dismiss} />
        </ProgressContext.Provider>
    );
}

export function useProgress(): ProgressContextValue {
    const value = useContext(ProgressContext);
    if (!value) throw new Error('useProgress must be used inside ProgressProvider');
    return value;
}
