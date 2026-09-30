import { useEffect, useState } from 'react';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import Button from '../components/Button.tsx';
import Skeleton from '../components/Skeleton.tsx';
import type { TeacherLink } from '../types/api.ts';

export default function TeachersPage() {
    const { token } = useAuth();
    const [teachers, setTeachers] = useState<TeacherLink[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        apiFetch<{ teachers: TeacherLink[] }>('/teachers', { token })
            .then((data) => setTeachers(data.teachers))
            .catch((err: unknown) => setError(errorMessage(err)));
    }, [token]);

    async function toggleLink(teacher: TeacherLink) {
        setError(null);
        try {
            const { teacher: updated } = await apiFetch<{ teacher: TeacherLink }>(
                `/teachers/${teacher.id}/link`,
                {
                    method: teacher.linked ? 'DELETE' : 'PUT',
                    token,
                },
            );
            setTeachers((current) =>
                (current ?? []).map((item) => (item.id === updated.id ? updated : item)),
            );
            setNotice(
                updated.linked
                    ? `You are now linked to ${updated.name}.`
                    : `You are no longer linked to ${updated.name}.`,
            );
        } catch (err) {
            setError(errorMessage(err));
        }
    }

    return (
        <section>
            <h1>My teachers</h1>
            <p>
                A teacher you link to can see your reading profile and your reading list, and can
                add titles to your list. You can remove the link at any time.
            </p>

            {error && <Alert>{error}</Alert>}
            {notice && <Alert type="success">{notice}</Alert>}
            {!teachers && !error && <Skeleton lines={4} label="Loading teachers" />}
            {teachers?.length === 0 && <p>There are no teachers yet.</p>}

            {teachers && teachers.length > 0 && (
                <ul className="list">
                    {teachers.map((teacher) => (
                        <li key={teacher.id}>
                            <span>
                                <strong>{teacher.name}</strong>
                                {teacher.linked && <span className="on-list"> · ✓ Linked</span>}
                            </span>
                            <Button
                                variant={teacher.linked ? 'secondary' : 'primary'}
                                aria-label={`${teacher.linked ? 'Unlink from' : 'Link to'} ${teacher.name}`}
                                onClick={() => toggleLink(teacher)}
                            >
                                {teacher.linked ? 'Unlink' : 'Link to this teacher'}
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
