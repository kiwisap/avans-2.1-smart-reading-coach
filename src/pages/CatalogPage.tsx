import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import AddToListButton from '../components/AddToListButton.tsx';
import Alert from '../components/Alert.tsx';
import BookCard from '../components/BookCard.tsx';
import BookGrid from '../components/BookGrid.tsx';
import Button from '../components/Button.tsx';
import CatalogSearchForm from '../components/CatalogSearchForm.tsx';
import Pagination from '../components/Pagination.tsx';
import ShelfIllustration from '../components/ShelfIllustration.tsx';
import Skeleton from '../components/Skeleton.tsx';
import { useCatalogQuery } from '../hooks/useCatalogQuery.ts';
import { useReadingList } from '../hooks/useReadingList.ts';
import type { BookFacets, BookPage } from '../types/api.ts';
import { Trans, useTranslation } from 'react-i18next';

const PAGE_SIZE = 18;

export default function CatalogPage() {
    const { t } = useTranslation();
    const { token, user } = useAuth();
    const isStudent = user?.role === 'student';
    const readingList = useReadingList(isStudent);
    const { filters, page, apply, changePage, reset } = useCatalogQuery(); // applied, from the URL
    const resultsRef = useRef<HTMLDivElement>(null);
    const [options, setOptions] = useState<BookFacets>({ types: [], levels: [], themes: [] });
    const [result, setResult] = useState<BookPage | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0); // raised by the retry button

    useEffect(() => {
        apiFetch<BookFacets>('/books/filters', { token })
            .then(setOptions)
            .catch((err: unknown) => setError(errorMessage(err)));
    }, [token, reloadKey]);

    useEffect(() => {
        const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
        if (filters.search) params.set('search', filters.search);
        for (const type of filters.types) params.append('type', type);
        for (const level of filters.levels) params.append('level', level);
        for (const theme of filters.themes) params.append('theme', theme);
        let cancelled = false;
        apiFetch<BookPage>(`/books?${params}`, { token })
            .then((data) => {
                if (cancelled) return;
                setResult(data);
                setError(null);
            })
            .catch((err: unknown) => {
                if (!cancelled) setError(errorMessage(err));
            });
        return () => {
            cancelled = true;
        };
    }, [token, filters, page, reloadKey]);

    function retry() {
        setError(null);
        setReloadKey((key) => key + 1);
    }

    // Switching page keeps the filters out of view: scroll to the start of the results.
    function handlePageChange(next: number) {
        changePage(next);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        resultsRef.current?.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
            block: 'start',
        });
    }

    const totalPages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;

    const hasFilters = Object.values(filters).some((value) =>
        Array.isArray(value) ? value.length > 0 : Boolean(value),
    );

    return (
        <section>
            <div className="hero mb-5">
                <div className="row align-items-center g-4">
                    <div className="col-lg-7">
                        <p className="eyebrow text-secondary mb-2">{t('catalog.eyebrow')}</p>
                        <h1 className="display-5 mb-2">{t('catalog.heading')}</h1>
                        <p className="fs-5 text-body-secondary mb-4">
                            {user?.role === 'student' ? (
                                <Trans
                                    i18nKey="catalog.heroStudent"
                                    values={{ name: user.name }}
                                    components={{ advice: <Link to="/advice" /> }}
                                />
                            ) : (
                                t('catalog.heroTeacher')
                            )}
                        </p>

                        <CatalogSearchForm
                            filters={filters}
                            options={options}
                            onApply={apply}
                            onReset={reset}
                        />
                    </div>
                    <div className="col-lg-5 d-none d-lg-block">
                        <ShelfIllustration className="shelf" />
                    </div>
                </div>
            </div>

            <div ref={resultsRef} className="results-anchor" />

            {error && <Alert onRetry={retry}>{error}</Alert>}
            {readingList.error && <Alert>{readingList.error}</Alert>}
            {readingList.notice && <Alert type="success">{readingList.notice}</Alert>}

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <p role="status" aria-live="polite" className="text-body-secondary mb-0">
                    {result ? t('catalog.results', { count: result.total }) : t('common.loading')}
                </p>
                {result && result.items.length > 0 && (
                    <Pagination
                        position="top"
                        page={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            {!result && !error && (
                <Skeleton variant="cards" lines={6} label={t('catalog.loadingCatalog')} />
            )}

            {result && result.items.length === 0 && (
                <div className="text-center py-5">
                    <i
                        className="bi bi-emoji-neutral display-4 text-body-secondary"
                        aria-hidden="true"
                    />
                    <h2 className="h4 mt-3">{t('catalog.emptyTitle')}</h2>
                    <p className="text-body-secondary">{t('catalog.emptyHint')}</p>
                    {hasFilters && (
                        <Button variant="secondary" onClick={reset}>
                            {t('catalog.clearFilters')}
                        </Button>
                    )}
                </div>
            )}

            {result && result.items.length > 0 && (
                <>
                    <BookGrid>
                        {result.items.map((book) => (
                            <BookCard key={book.id} book={book}>
                                {isStudent && (
                                    <AddToListButton
                                        book={book}
                                        onList={readingList.bookIds.has(book.id)}
                                        onAdd={readingList.add}
                                    />
                                )}
                            </BookCard>
                        ))}
                    </BookGrid>
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </section>
    );
}
