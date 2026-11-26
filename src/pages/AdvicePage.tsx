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
import type { Advice } from '../types/api.ts';
import { Trans, useTranslation } from 'react-i18next';

export default function AdvicePage() {
    const { t } = useTranslation();
    const { token } = useAuth();
    const readingList = useReadingList();
    const [advice, setAdvice] = useState<Advice | null>(null);
    const [error, setError] = useState<ApiError | null>(null);
    const [reloadKey, setReloadKey] = useState(0); // raised by the retry button

    useEffect(() => {
        let cancelled = false;
        apiFetch<Advice>('/advice', { token })
            .then((data) => {
                if (!cancelled) setAdvice(data);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setError(err instanceof ApiError ? err : new ApiError(0, t('errors.generic')));
            });
        return () => {
            cancelled = true;
        };
    }, [token, t, reloadKey]);

    function retry() {
        setError(null);
        setReloadKey((key) => key + 1);
    }

    const suggestions = advice?.suggestions;

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
            {error && error.status !== 409 && <Alert onRetry={retry}>{error.message}</Alert>}
            {readingList.error && <Alert>{readingList.error}</Alert>}
            {readingList.notice && <Alert type="success">{readingList.notice}</Alert>}

            {!advice && !error && (
                <Skeleton variant="cards" lines={3} label={t('advice.loading')} />
            )}

            {advice && suggestions && (
                <>
                    <p role="status" className="mb-1">
                        <Trans
                            i18nKey="advice.count"
                            count={suggestions.length}
                            components={{ profile: <Link to="/profile" /> }}
                        />
                    </p>
                    {/* Transparency: the student can see whether an AI model made the advice. */}
                    <p className="advice-source small text-body-secondary mb-3">
                        <i
                            className={`bi ${advice.source === 'ai' ? 'bi-cpu' : 'bi-list-check'} me-1`}
                            aria-hidden="true"
                        />
                        {advice.source === 'ai' ? t('advice.sourceAi') : t('advice.sourceRules')}
                    </p>
                    <BookGrid>
                        {suggestions.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                motivation={book.motivation}
                                reasons={book.reasons}
                            >
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
