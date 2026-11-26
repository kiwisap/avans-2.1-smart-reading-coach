import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import { useProgress } from '../game/ProgressContext.tsx';
import type { Book, ReadingListItem, ReadingStatus } from '../types/api.ts';
import i18n from '../i18n/index.ts';

// Loads the student's reading list and exposes add, toggle, rate and remove.
// Every action that can earn XP refreshes the progress, which shows the XP that was gained.
// Pass enabled=false for roles without a reading list (teachers).
export function useReadingList(enabled = true) {
    const { token } = useAuth();
    const { refresh: refreshProgress } = useProgress();
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
        // source: where the student added it, so we can see whether the advice of Bo helps.
        async (book: Pick<Book, 'id' | 'title'>, source: 'advice' | 'catalog' = 'catalog') => {
            setError(null);
            try {
                const { item } = await apiFetch<{ item: ReadingListItem }>('/reading-list', {
                    method: 'POST',
                    token,
                    body: { bookId: book.id, source },
                });
                setItems((current) => [item, ...(current ?? [])]);
                setNotice(i18n.t('readingList.added', { title: book.title }));
                void refreshProgress();
            } catch (err) {
                setError(errorMessage(err));
            }
        },
        [token, refreshProgress],
    );

    const setStatus = useCallback(
        // Returns the updated item, or null when it failed.
        async (id: string, status: ReadingStatus): Promise<ReadingListItem | null> => {
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
                if (status === 'read') void refreshProgress();
                return item;
            } catch (err) {
                setError(errorMessage(err));
                return null;
            }
        },
        [token, refreshProgress],
    );

    const rate = useCallback(
        // Returns an error message, or null when the rating was saved.
        async (item: ReadingListItem, rating: number, comment: string): Promise<string | null> => {
            try {
                const { item: updated } = await apiFetch<{ item: ReadingListItem }>(
                    `/reading-list/${item.id}/rating`,
                    { method: 'PUT', token, body: { rating, comment: comment.trim() || null } },
                );
                setItems((current) =>
                    (current ?? []).map((existing) =>
                        existing.id === item.id ? updated : existing,
                    ),
                );
                setNotice(
                    i18n.t('rating.saved', {
                        title: item.book?.title ?? i18n.t('book.fallbackTitle'),
                    }),
                );
                void refreshProgress();
                return null;
            } catch (err) {
                return errorMessage(err);
            }
        },
        [token, refreshProgress],
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
                    i18n.t('readingList.removed', {
                        title: item.book?.title ?? i18n.t('book.fallbackTitle'),
                    }),
                );
            } catch (err) {
                setError(errorMessage(err));
            }
        },
        [token],
    );

    return { items, bookIds, error, notice, add, setStatus, rate, remove };
}
