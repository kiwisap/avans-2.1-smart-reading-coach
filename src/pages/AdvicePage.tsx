import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, apiFetch } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import AddToListButton from '../components/AddToListButton.tsx';
import Alert from '../components/Alert.tsx';
import BookCard from '../components/BookCard.tsx';
import Skeleton from '../components/Skeleton.tsx';
import { useReadingList } from '../hooks/useReadingList.ts';
import type { Suggestion } from '../types/api.ts';

export default function AdvicePage() {
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
                setError(err instanceof ApiError ? err : new ApiError(0, 'Something went wrong'));
            });
        return () => {
            cancelled = true;
        };
    }, [token]);

    return (
        <section>
            <h1>Your reading advice</h1>

            {error?.status === 409 && (
                <Alert type="info">
                    {error.message}. <Link to="/profile">Go to your reading profile</Link>
                </Alert>
            )}
            {error && error.status !== 409 && <Alert>{error.message}</Alert>}
            {readingList.error && <Alert>{readingList.error}</Alert>}
            {readingList.notice && <Alert type="success">{readingList.notice}</Alert>}

            {!suggestions && !error && <Skeleton lines={6} label="Finding suggestions for you" />}

            {suggestions && (
                <>
                    <p role="status">
                        {suggestions.length} suggestions based on your reading profile.{' '}
                        <Link to="/profile">Change your profile</Link> to get different advice.
                    </p>
                    <div className="book-grid">
                        {suggestions.map((book) => (
                            <BookCard key={book.id} book={book} motivation={book.motivation}>
                                <AddToListButton
                                    book={book}
                                    onList={readingList.bookIds.has(book.id)}
                                    onAdd={readingList.add}
                                />
                            </BookCard>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
