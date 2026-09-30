import { useState, type FormEvent } from 'react';
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

    async function handleSearch(event: FormEvent<HTMLFormElement>) {
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
        <section aria-labelledby="add-title-heading" className="card">
            <h2 id="add-title-heading">Add a title to {studentName}&apos;s reading list</h2>
            <form onSubmit={handleSearch} role="search">
                <TextField
                    label="Search the catalog"
                    type="search"
                    placeholder="Title, author or theme"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
                <Button type="submit" disabled={searching}>
                    {searching ? 'Searching...' : 'Search'}
                </Button>
            </form>

            {error && <Alert>{error}</Alert>}

            {results && (
                <>
                    <p role="status">
                        {results.length === 0
                            ? 'No titles found.'
                            : `Showing ${results.length} titles.`}
                    </p>
                    <ul className="list">
                        {results.map((book) => (
                            <li key={book.id}>
                                <span>
                                    <strong>{book.title}</strong>
                                    {book.author && <> by {book.author}</>}
                                    <span className="book-meta">
                                        {' '}
                                        · {TYPE_LABELS[book.type] ?? book.type}
                                    </span>
                                </span>
                                {existingBookIds.has(book.id) ? (
                                    <span className="on-list">✓ On the list</span>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        aria-label={`Add ${book.title} to ${studentName}'s reading list`}
                                        onClick={() => onAdd(book)}
                                    >
                                        Add
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </section>
    );
}
