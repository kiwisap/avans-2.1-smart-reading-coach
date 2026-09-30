import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import BookCard from '../components/BookCard.tsx';
import BookGrid from '../components/BookGrid.tsx';
import MissingBookCard from '../components/MissingBookCard.tsx';
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
            setNotice(
                `"${book.title}" is toegevoegd aan de leeslijst van ${overview.student.name}.`,
            );
        } catch (err) {
            setError(errorMessage(err));
        }
    }

    if (error && !overview) {
        return (
            <section>
                <Alert>{error}</Alert>
                <p>
                    <Link to="/students">Terug naar je leerlingen</Link>
                </p>
            </section>
        );
    }

    if (!overview) {
        return (
            <section>
                <Skeleton lines={6} label="Leerling laden" />
            </section>
        );
    }

    const { student, profile, readingList } = overview;

    return (
        <section>
            <p>
                <Link to="/students">
                    <i className="bi bi-arrow-left me-1" aria-hidden="true" />
                    Terug naar je leerlingen
                </Link>
            </p>
            <header className="mb-4">
                <h1 className="page-title">
                    <i className="bi bi-person-circle me-2" aria-hidden="true" />
                    {student.name}
                </h1>
                <p className="text-body-secondary mb-0">{student.email}</p>
            </header>

            {error && <Alert>{error}</Alert>}
            {notice && <Alert type="success">{notice}</Alert>}

            <h2 className="h4 mb-3">Leesprofiel</h2>
            {profile ? (
                <ProfileSummary profile={profile} />
            ) : (
                <p className="text-body-secondary">
                    Deze leerling heeft nog geen leesprofiel ingevuld.
                </p>
            )}

            <h2 className="h4 mt-4 mb-3">Leeslijst</h2>
            {readingList.length === 0 && (
                <p className="text-body-secondary">Er staat nog niets op de leeslijst.</p>
            )}
            <BookGrid>
                {readingList.map((item) =>
                    item.book ? (
                        <BookCard key={item.id} book={item.book}>
                            <StatusBadge status={item.status} />
                        </BookCard>
                    ) : (
                        <MissingBookCard key={item.id}>
                            <StatusBadge status={item.status} />
                        </MissingBookCard>
                    ),
                )}
            </BookGrid>

            <TeacherAddBook
                studentName={student.name}
                existingBookIds={existingBookIds}
                onAdd={addTitle}
            />
        </section>
    );
}
