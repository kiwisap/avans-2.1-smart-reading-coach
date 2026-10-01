import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import AddToListButton from '../components/AddToListButton.tsx';
import Alert from '../components/Alert.tsx';
import BookCard from '../components/BookCard.tsx';
import BookGrid from '../components/BookGrid.tsx';
import Skeleton from '../components/Skeleton.tsx';
import { useReadingList } from '../hooks/useReadingList.ts';
import type { Suggestion } from '../types/api.ts';
import { Trans, useTranslation } from 'react-i18next';

export default function AdvicePage() {
    const { t } = useTranslation();
    const { token } = useAuth();
    const readingList = useReadingList();
    const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
    const [error, setError] = useState<ApiError | null>(null);

    useEffect(() => {
        let cancelled = false;
        apiFetch<{ suggestions: Suggestion[] }>('/advice', { token })
            .then((data) => {
                if (!cancelled) setSuggestions(data.suggestions);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setError(err instanceof ApiError ? err : new ApiError(0, t('errors.generic')));
            });
        return () => {
            cancelled = true;
        };
    }, [token, t]);

    return (
        <section>
            <header className="mb-4">
                <h1 className="page-title">
                    <i className="bi bi-stars me-2" aria-hidden="true" />
                    {t('advice.title')}
                </h1>
                <p className="text-body-secondary mb-0">{t('advice.intro')}</p>
            </header>

            {error?.status === 409 && (
                <Alert type="info">
                    <Trans
                        i18nKey="advice.goToProfile"
                        values={{ message: error.message }}
                        components={{ profile: <Link to="/profile" /> }}
                    />
                </Alert>
            )}
            {error && error.status !== 409 && <Alert>{error.message}</Alert>}
            {readingList.error && <Alert>{readingList.error}</Alert>}
            {readingList.notice && <Alert type="success">{readingList.notice}</Alert>}

            {!suggestions && !error && (
                <Skeleton variant="cards" lines={3} label={t('advice.loading')} />
            )}

            {suggestions && (
                <>
                    <p role="status" className="mb-3">
                        <Trans
                            i18nKey="advice.count"
                            count={suggestions.length}
                            components={{ profile: <Link to="/profile" /> }}
                        />
                    </p>
                    <BookGrid>
                        {suggestions.map((book) => (
                            <BookCard key={book.id} book={book} motivation={book.motivation}>
                                <AddToListButton
                                    book={book}
                                    onList={readingList.bookIds.has(book.id)}
                                    onAdd={readingList.add}
                                />
                            </BookCard>
                        ))}
                    </BookGrid>
                </>
            )}
        </section>
    );
}
