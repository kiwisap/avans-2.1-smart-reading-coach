import { useEffect, useRef, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import AddToListButton from '../components/AddToListButton.tsx';
import Alert from '../components/Alert.tsx';
import BookCard from '../components/BookCard.tsx';
import BookGrid from '../components/BookGrid.tsx';
import Button from '../components/Button.tsx';
import Pagination from '../components/Pagination.tsx';
import SelectField from '../components/SelectField.tsx';
import ShelfIllustration from '../components/ShelfIllustration.tsx';
import Skeleton from '../components/Skeleton.tsx';
import { TYPE_LABELS } from '../constants/labels.ts';
import { EMPTY_FILTERS, useCatalogQuery, type CatalogFilters } from '../hooks/useCatalogQuery.ts';
import { useReadingList } from '../hooks/useReadingList.ts';
import type { BookFacets, BookPage } from '../types/api.ts';

const PAGE_SIZE = 18;
const SEARCH_DEBOUNCE_MS = 500;

export default function CatalogPage() {
    const { token, user } = useAuth();
    const location = useLocation();
    const accessNotice = (location.state as { notice?: string } | null)?.notice;
    const isStudent = user?.role === 'student';
    const readingList = useReadingList(isStudent);
    const { filters, page, apply, changePage, reset } = useCatalogQuery(); // applied, from the URL
    const [draft, setDraft] = useState<CatalogFilters>(filters); // what the user is typing
    const draftRef = useRef(draft); // latest draft, read by the search timer below
    const resultsRef = useRef<HTMLDivElement>(null);
    const [options, setOptions] = useState<BookFacets>({ types: [], levels: [], themes: [] });
    const [result, setResult] = useState<BookPage | null>(null);
    const [error, setError] = useState<string | null>(null);

    // When the URL changes (back button, a followed link) the form follows it.
    const [syncedFilters, setSyncedFilters] = useState(filters);
    if (syncedFilters !== filters) {
        setSyncedFilters(filters);
        setDraft(filters);
    }

    useEffect(() => {
        draftRef.current = draft;
    }, [draft]);

    // Search as you type: 500 ms after the last keystroke the search text is applied, but only
    // when it differs from what is already applied.
    useEffect(() => {
        if (draft.search.trim() === filters.search) return undefined;
        const timer = window.setTimeout(() => {
            const latest = draftRef.current;
            apply({ ...latest, search: latest.search.trim() });
        }, SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [draft.search, filters.search, apply]);

    useEffect(() => {
        apiFetch<BookFacets>('/books/filters', { token })
            .then(setOptions)
            .catch((err: unknown) => setError(errorMessage(err)));
    }, [token]);

    useEffect(() => {
        const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
        for (const [key, value] of Object.entries(filters)) {
            if (value) params.set(key, value);
        }
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
    }, [token, filters, page]);

    function updateDraft(field: keyof CatalogFilters) {
        return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setDraft((current) => ({ ...current, [field]: event.target.value }));
    }

    function applyFilters(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        apply({ ...draft, search: draft.search.trim() });
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

    function resetFilters() {
        setDraft(EMPTY_FILTERS);
        reset();
    }

    const totalPages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;

    const hasFilters = Object.values(filters).some(Boolean);

    return (
        <section>
            {accessNotice && <Alert>{accessNotice}</Alert>}

            <div className="hero mb-5">
                <div className="row align-items-center g-4">
                    <div className="col-lg-7">
                        <p className="eyebrow text-secondary mb-2">Vrij lezen op maat</p>
                        <h1 className="display-5 mb-2">Vind je volgende leestip</h1>
                        <p className="fs-5 text-body-secondary mb-4">
                            {user?.role === 'student' ? (
                                <>
                                    Hoi {user.name}! Zoek in de catalogus, of{' '}
                                    <Link to="/advice">laat ons iets voor je uitkiezen</Link>.
                                </>
                            ) : (
                                'Zoek in de catalogus met boeken, artikelen en meer.'
                            )}
                        </p>

                        <form onSubmit={applyFilters} role="search">
                            <div className="hero-search input-group mb-3">
                                <span className="input-group-text ps-3" aria-hidden="true">
                                    <i className="bi bi-search" />
                                </span>
                                <label htmlFor="catalog-search" className="visually-hidden">
                                    Zoek op titel, auteur of thema
                                </label>
                                <input
                                    id="catalog-search"
                                    type="search"
                                    className="form-control"
                                    placeholder="Titel, auteur of thema"
                                    maxLength={100}
                                    value={draft.search}
                                    onChange={updateDraft('search')}
                                />
                                <button type="submit" className="btn btn-primary rounded-pill px-4">
                                    Zoeken
                                </button>
                            </div>

                            <div className="row g-2 align-items-end">
                                <div className="col-6 col-md-3">
                                    <SelectField
                                        label="Soort"
                                        wrapperClassName="mb-0"
                                        value={draft.type}
                                        onChange={updateDraft('type')}
                                        options={options.types.map((type) => ({
                                            value: type,
                                            label: TYPE_LABELS[type] ?? type,
                                        }))}
                                    />
                                </div>
                                <div className="col-6 col-md-3">
                                    <SelectField
                                        label="Niveau"
                                        wrapperClassName="mb-0"
                                        value={draft.level}
                                        onChange={updateDraft('level')}
                                        options={options.levels.map((level) => ({
                                            value: level,
                                            label: level,
                                        }))}
                                    />
                                </div>
                                <div className="col-12 col-md-4">
                                    <SelectField
                                        label="Thema"
                                        wrapperClassName="mb-0"
                                        value={draft.theme}
                                        onChange={updateDraft('theme')}
                                        options={options.themes.map((theme) => ({
                                            value: theme,
                                            label: theme,
                                        }))}
                                    />
                                </div>
                                <div className="col-12 col-md-auto">
                                    <button
                                        type="button"
                                        className="btn btn-link text-nowrap"
                                        onClick={resetFilters}
                                    >
                                        <i
                                            className="bi bi-arrow-counterclockwise me-1"
                                            aria-hidden="true"
                                        />
                                        Wissen
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="col-lg-5 d-none d-lg-block">
                        <ShelfIllustration className="shelf" />
                    </div>
                </div>
            </div>

            <div ref={resultsRef} className="results-anchor" />

            {error && <Alert>{error}</Alert>}
            {readingList.error && <Alert>{readingList.error}</Alert>}
            {readingList.notice && <Alert type="success">{readingList.notice}</Alert>}

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <p role="status" aria-live="polite" className="text-body-secondary mb-0">
                    {result
                        ? `${result.total} ${result.total === 1 ? 'resultaat' : 'resultaten'}`
                        : 'Laden...'}
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

            {!result && !error && <Skeleton variant="cards" lines={6} label="Catalogus laden" />}

            {result && result.items.length === 0 && (
                <div className="text-center py-5">
                    <i
                        className="bi bi-emoji-neutral display-4 text-body-secondary"
                        aria-hidden="true"
                    />
                    <h2 className="h4 mt-3">Niets gevonden</h2>
                    <p className="text-body-secondary">
                        Probeer andere woorden of haal een filter weg.
                    </p>
                    {hasFilters && (
                        <Button variant="secondary" onClick={resetFilters}>
                            Filters wissen
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
