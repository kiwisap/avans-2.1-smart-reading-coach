import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import type { Book, ReadingListItem, ReadingStatus } from '../types/api.ts';

// Loads the student's reading list and exposes add, toggle and remove.
// Pass enabled=false for roles without a reading list (teachers).
export function useReadingList(enabled = true) {
    const { token } = useAuth();
    const [items, setItems] = useState<ReadingListItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled) return undefined;
        let cancelled = false;
        apiFetch<{ items: ReadingListItem[] }>('/reading-list', { token })
            .then((data) => {
                if (!cancelled) setItems(data.items);
            })
            .catch((err: unknown) => {
                if (!cancelled) setError(errorMessage(err));
            });
        return () => {
            cancelled = true;
        };
    }, [token, enabled]);

    const bookIds = useMemo(() => new Set((items ?? []).map((item) => item.bookId)), [items]);

    const add = useCallback(
        async (book: Pick<Book, 'id' | 'title'>) => {
            setError(null);
            try {
                const { item } = await apiFetch<{ item: ReadingListItem }>('/reading-list', {
                    method: 'POST',
                    token,
                    body: { bookId: book.id },
                });
                setItems((current) => [item, ...(current ?? [])]);
                setNotice(`"${book.title}" was added to your reading list.`);
            } catch (err) {
                setError(errorMessage(err));
            }
        },
        [token],
    );

    const setStatus = useCallback(
        async (id: string, status: ReadingStatus) => {
            setError(null);
            try {
                const { item } = await apiFetch<{ item: ReadingListItem }>(`/reading-list/${id}`, {
                    method: 'PATCH',
                    token,
                    body: { status },
                });
                setItems((current) =>
                    (current ?? []).map((existing) => (existing.id === id ? item : existing)),
                );
            } catch (err) {
                setError(errorMessage(err));
            }
        },
        [token],
    );

    const remove = useCallback(
        async (item: ReadingListItem) => {
            setError(null);
            try {
                await apiFetch(`/reading-list/${item.id}`, { method: 'DELETE', token });
                setItems((current) =>
                    (current ?? []).filter((existing) => existing.id !== item.id),
                );
                setNotice(
                    `"${item.book?.title ?? 'The title'}" was removed from your reading list.`,
                );
            } catch (err) {
                setError(errorMessage(err));
            }
        },
        [token],
    );

    return { items, bookIds, error, notice, add, setStatus, remove };
}
