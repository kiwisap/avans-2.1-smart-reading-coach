import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import BookCard from '../components/BookCard.tsx';
import ProfileSummary from '../components/ProfileSummary.tsx';
import Skeleton from '../components/Skeleton.tsx';
import StatusBadge from '../components/StatusBadge.tsx';
import TeacherAddBook from '../components/TeacherAddBook.tsx';
import type { Book, ReadingListItem, StudentOverview } from '../types/api.ts';

export default function StudentDetailPage() {
    const { studentId } = useParams<{ studentId: string }>();
    // The key resets all state when the teacher switches to another student.
    return <StudentDetail key={studentId} studentId={studentId} />;
}

function StudentDetail({ studentId }: { studentId: string | undefined }) {
    const { token } = useAuth();
    const [overview, setOverview] = useState<StudentOverview | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        if (!studentId) return undefined;
        let cancelled = false;
        apiFetch<StudentOverview>(`/students/${studentId}`, { token })
            .then((data) => {
                if (!cancelled) setOverview(data);
            })
            .catch((err: unknown) => {
                if (!cancelled) setError(errorMessage(err));
            });
        return () => {
            cancelled = true;
        };
    }, [studentId, token]);

    const existingBookIds = useMemo(
        () => new Set((overview?.readingList ?? []).map((item) => item.bookId)),
        [overview],
    );

    async function addTitle(book: Book) {
        if (!studentId || !overview) return;
        setError(null);
        setNotice(null);
        try {
            const { item } = await apiFetch<{ item: ReadingListItem }>(
                `/students/${studentId}/reading-list`,
                {
                    method: 'POST',
                    token,
                    body: { bookId: book.id },
                },
            );
            setOverview((current) =>
                current ? { ...current, readingList: [item, ...current.readingList] } : current,
            );
            setNotice(`"${book.title}" was added to ${overview.student.name}'s reading list.`);
        } catch (err) {
            setError(errorMessage(err));
        }
    }

    if (error && !overview) {
        return (
            <section>
                <Alert>{error}</Alert>
                <p>
                    <Link to="/students">Back to your students</Link>
                </p>
            </section>
        );
    }

    if (!overview) {
        return (
            <section>
                <Skeleton lines={6} label="Loading student" />
            </section>
        );
    }

    const { student, profile, readingList } = overview;

    return (
        <section>
            <p>
                <Link to="/students">← Back to your students</Link>
            </p>
            <h1>{student.name}</h1>

            {error && <Alert>{error}</Alert>}
            {notice && <Alert type="success">{notice}</Alert>}

            <h2>Reading profile</h2>
            {profile ? (
                <ProfileSummary profile={profile} />
            ) : (
                <p>This student has not filled in a reading profile yet.</p>
            )}

            <h2>Reading list</h2>
            {readingList.length === 0 && <p>Nothing on the reading list yet.</p>}
            <div className="book-grid">
                {readingList.map((item) =>
                    item.book ? (
                        <BookCard key={item.id} book={item.book}>
                            <StatusBadge status={item.status} />
                        </BookCard>
                    ) : (
                        <article key={item.id} className="book-card">
                            <h3>Title no longer available</h3>
                            <StatusBadge status={item.status} />
                        </article>
                    ),
                )}
            </div>

            <TeacherAddBook
                studentName={student.name}
                existingBookIds={existingBookIds}
                onAdd={addTitle}
            />
        </section>
    );
}
