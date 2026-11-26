import { useEffect, useState } from 'react';
import { ApiError, apiFetch } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import type { Advice, Book } from '../types/api.ts';
import Alert from './Alert.tsx';
import BookCard from './BookCard.tsx';
import BookGrid from './BookGrid.tsx';
import Button from './Button.tsx';
import Skeleton from './Skeleton.tsx';
import { useTranslation } from 'react-i18next';

interface StudentAdviceProps {
    studentId: string;
    studentName: string;
    existingBookIds: Set<string>;
    onAdd: (book: Book) => void;
}

// The reading advice of a student as the teacher sees it: the same titles and reasons as the
// student gets, so the teacher can talk about them and put a title on the reading list.
export default function StudentAdvice({
    studentId,
    studentName,
    existingBookIds,
    onAdd,
}: StudentAdviceProps) {
    const { t } = useTranslation();
    const { token } = useAuth();
    const [advice, setAdvice] = useState<Advice | null>(null);
    const [error, setError] = useState<ApiError | null>(null);

    useEffect(() => {
        let cancelled = false;
        apiFetch<Advice>(`/students/${studentId}/advice`, { token })
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
    }, [studentId, token, t]);

    return (
        <section aria-labelledby="student-advice-heading" className="mt-4">
            <h2 id="student-advice-heading" className="h4 mb-3">
                {t('studentDetail.adviceHeading')}
            </h2>

            {error?.status === 409 && (
                <p className="text-body-secondary">{t('studentDetail.noAdvice')}</p>
            )}
            {error && error.status !== 409 && <Alert>{error.message}</Alert>}
            {!advice && !error && <Skeleton lines={3} label={t('studentDetail.adviceLoading')} />}

            {advice && (
                <>
                    <p className="advice-source small text-body-secondary mb-3">
                        <i
                            className={`bi ${advice.source === 'ai' ? 'bi-cpu' : 'bi-list-check'} me-1`}
                            aria-hidden="true"
                        />
                        {advice.source === 'ai'
                            ? t('studentDetail.adviceSourceAi')
                            : t('studentDetail.adviceSourceRules')}
                    </p>
                    <BookGrid>
                        {advice.suggestions.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                motivation={book.motivation}
                                reasons={book.reasons}
                            >
                                {existingBookIds.has(book.id) ? (
                                    <span className="status-chip is-success">
                                        <i
                                            className="bi bi-bookmark-check-fill"
                                            aria-hidden="true"
                                        />
                                        {t('studentDetail.onList')}
                                    </span>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        icon="bi-bookmark-plus"
                                        aria-label={t('studentDetail.addToListLabel', {
                                            title: book.title,
                                            name: studentName,
                                        })}
                                        onClick={() => onAdd(book)}
                                    >
                                        {t('studentDetail.addToList')}
                                    </Button>
                                )}
                            </BookCard>
                        ))}
                    </BookGrid>
                </>
            )}
        </section>
    );
}
