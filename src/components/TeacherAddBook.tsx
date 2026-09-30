import { useState, type SubmitEvent } from 'react';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import { TYPE_LABELS } from '../constants/labels.ts';
import type { Book, BookPage } from '../types/api.ts';
import Alert from './Alert.tsx';
import Button from './Button.tsx';
import TextField from './TextField.tsx';

interface TeacherAddBookProps {
    studentName: string;
    existingBookIds: Set<string>;
    onAdd: (book: Book) => void;
}

// Lets a teacher search the catalog and add a title to a student's reading list.
export default function TeacherAddBook({
    studentName,
    existingBookIds,
    onAdd,
}: TeacherAddBookProps) {
    const { token } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Book[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searching, setSearching] = useState(false);

    async function handleSearch(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSearching(true);
        try {
            const params = new URLSearchParams({ limit: '6' });
            if (query.trim()) params.set('search', query.trim());
            const data = await apiFetch<BookPage>(`/books?${params}`, { token });
            setResults(data.items);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSearching(false);
        }
    }

    return (
        <section aria-labelledby="add-title-heading" className="card shadow-sm mt-5">
            <div className="card-body">
                <h2 id="add-title-heading" className="h5">
                    <i className="bi bi-plus-circle me-2" aria-hidden="true" />
                    Voeg een titel toe aan de leeslijst van {studentName}
                </h2>
                <form
                    onSubmit={handleSearch}
                    role="search"
                    className="d-flex gap-2 align-items-end"
                >
                    <TextField
                        label="Zoek in de catalogus"
                        type="search"
                        placeholder="Titel, auteur of thema"
                        wrapperClassName="flex-grow-1"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                    <Button type="submit" icon="bi-search" disabled={searching}>
                        {searching ? 'Zoeken...' : 'Zoeken'}
                    </Button>
                </form>

                {error && <Alert>{error}</Alert>}

                {results && (
                    <>
                        <p role="status" className="text-body-secondary mt-3">
                            {results.length === 0
                                ? 'Geen titels gevonden.'
                                : `${results.length} titels gevonden.`}
                        </p>
                        <ul className="list-group">
                            {results.map((book) => (
                                <li
                                    key={book.id}
                                    className="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2"
                                >
                                    <span>
                                        <strong>{book.title}</strong>
                                        {book.author && <> van {book.author}</>}
                                        <span className="text-body-secondary">
                                            {' '}
                                            · {TYPE_LABELS[book.type] ?? book.type}
                                        </span>
                                    </span>
                                    {existingBookIds.has(book.id) ? (
                                        <span className="text-success-emphasis fw-semibold">
                                            <i
                                                className="bi bi-check-circle-fill me-1"
                                                aria-hidden="true"
                                            />
                                            Staat op de lijst
                                        </span>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            aria-label={`Voeg ${book.title} toe aan de leeslijst van ${studentName}`}
                                            onClick={() => onAdd(book)}
                                        >
                                            Toevoegen
                                        </Button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </section>
    );
}
