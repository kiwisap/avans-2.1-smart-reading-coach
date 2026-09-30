import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import AddToListButton from '../components/AddToListButton.tsx';
import Alert from '../components/Alert.tsx';
import BookCard from '../components/BookCard.tsx';
import Button from '../components/Button.tsx';
import Pagination from '../components/Pagination.tsx';
import SelectField from '../components/SelectField.tsx';
import TextField from '../components/TextField.tsx';
import { TYPE_LABELS } from '../constants/labels.ts';
import { useReadingList } from '../hooks/useReadingList.ts';
import type { BookFacets, BookPage } from '../types/api.ts';

const PAGE_SIZE = 12;

interface Filters {
    search: string;
    type: string;
    level: string;
    theme: string;
}

const EMPTY_FILTERS: Filters = { search: '', type: '', level: '', theme: '' };

export default function CatalogPage() {
    const { token, user } = useAuth();
    const isStudent = user?.role === 'student';
    const readingList = useReadingList(isStudent);
    const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS); // what the user is typing
    const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS); // what is applied
    const [page, setPage] = useState(1);
    const [options, setOptions] = useState<BookFacets>({ types: [], levels: [], themes: [] });
    const [result, setResult] = useState<BookPage | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    function updateDraft(field: keyof Filters) {
        return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setDraft((current) => ({ ...current, [field]: event.target.value }));
    }

    function applyFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPage(1);
        setFilters(draft);
    }

    function resetFilters() {
        setDraft(EMPTY_FILTERS);
        setFilters(EMPTY_FILTERS);
        setPage(1);
    }

    const totalPages = result ? Math.max(1, Math.ceil(result.total / PAGE_SIZE)) : 1;

    return (
        <section>
            <h1>Catalog</h1>

            <form className="filters card" onSubmit={applyFilters} role="search">
                <TextField
                    label="Search"
                    type="search"
                    placeholder="Title, author or theme"
                    value={draft.search}
                    onChange={updateDraft('search')}
                />
                <SelectField
                    label="Type"
                    value={draft.type}
                    onChange={updateDraft('type')}
                    options={options.types.map((type) => ({
                        value: type,
                        label: TYPE_LABELS[type] ?? type,
                    }))}
                />
                <SelectField
                    label="Level"
                    value={draft.level}
                    onChange={updateDraft('level')}
                    options={options.levels.map((level) => ({ value: level, label: level }))}
                />
                <SelectField
                    label="Theme"
                    value={draft.theme}
                    onChange={updateDraft('theme')}
                    options={options.themes.map((theme) => ({ value: theme, label: theme }))}
                />
                <div className="filter-actions">
                    <Button type="submit">Search</Button>
                    <Button variant="secondary" onClick={resetFilters}>
                        Reset
                    </Button>
                </div>
            </form>

            {error && <Alert>{error}</Alert>}
            {readingList.error && <Alert>{readingList.error}</Alert>}
            {readingList.notice && <Alert type="success">{readingList.notice}</Alert>}

            <p role="status" aria-live="polite">
                {result ? `${result.total} results` : 'Loading...'}
            </p>

            {result && (
                <>
                    <div className="book-grid">
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
                    </div>
                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </>
            )}
        </section>
    );
}
