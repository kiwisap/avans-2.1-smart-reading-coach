import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import AddToListButton from '../components/AddToListButton.tsx';
import Alert from '../components/Alert.tsx';
import BoSays from '../components/BoSays.tsx';
import type { MascotMood } from '../components/Mascot.tsx';
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
    const noProfile = error?.status === 409;

    // What Bo says depends on the state of the advice.
    let bo: { mood: MascotMood; text: string } = { mood: 'think', text: t('advice.boLoading') };
    if (noProfile) bo = { mood: 'wave', text: t('advice.boNoProfile') };
    else if (error) bo = { mood: 'think', text: t('advice.boError') };
    else if (advice?.source === 'ai') bo = { mood: 'happy', text: t('advice.boAi') };
    else if (advice) bo = { mood: 'think', text: t('advice.boRules') };

    return (
        <section>
            <header className="mb-4">
                <h1 className="page-title">
                    <i className="bi bi-stars me-2" aria-hidden="true" />
                    {t('advice.title')}
                </h1>
                <p className="text-body-secondary mb-0">{t('advice.intro')}</p>
            </header>

            <BoSays mood={bo.mood} live className="mb-4">
                <p className="mb-0">{bo.text}</p>
                {noProfile && (
                    <Link to="/welcome" className="btn btn-accent btn-sm mt-2">
                        <i className="bi bi-controller me-2" aria-hidden="true" />
                        {t('advice.startProfile')}
                    </Link>
                )}
            </BoSays>

            {error && !noProfile && <Alert onRetry={retry}>{error.message}</Alert>}
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
                            components={{ profile: <Link to="/welcome" /> }}
                        />
                    </p>
                    <p className="small text-body-secondary mb-1">
                        <i className="bi bi-arrow-repeat me-1" aria-hidden="true" />
                        {t('advice.changes')}
                    </p>
                    {/* Transparency (AI Act): the student knows an AI chose these titles. */}
                    <p className="advice-source small text-body-secondary mb-3">
                        <i className="bi bi-cpu me-1" aria-hidden="true" />
                        {t('advice.disclaimer')}
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
                                    onAdd={(added) => readingList.add(added, 'advice')}
                                    source="advice"
                                />
                            </BookCard>
                        ))}
                    </BookGrid>
                </>
            )}
        </section>
    );
}
