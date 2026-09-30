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
                    ? `Je bent nu gekoppeld aan ${updated.name}.`
                    : `Je bent niet meer gekoppeld aan ${updated.name}.`,
            );
        } catch (err) {
            setError(errorMessage(err));
        }
    }

    return (
        <section>
            <header className="mb-4">
                <h1 className="page-title">
                    <i className="bi bi-mortarboard me-2" aria-hidden="true" />
                    Mijn docenten
                </h1>
                <p className="text-body-secondary mb-0">
                    Een docent aan wie je gekoppeld bent, kan je leesprofiel en je leeslijst zien en
                    titels aan je lijst toevoegen. Je kunt de koppeling altijd weer verwijderen.
                </p>
            </header>

            {error && <Alert>{error}</Alert>}
            {notice && <Alert type="success">{notice}</Alert>}
            {!teachers && !error && <Skeleton lines={4} label="Docenten laden" />}
            {teachers?.length === 0 && <p>Er zijn nog geen docenten.</p>}

            {teachers && teachers.length > 0 && (
                <ul className="list-group shadow-sm">
                    {teachers.map((teacher) => (
                        <li
                            key={teacher.id}
                            className="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2 py-3"
                        >
                            <span className="d-flex align-items-center gap-3">
                                <i
                                    className="bi bi-person-badge fs-3 text-body-secondary"
                                    aria-hidden="true"
                                />
                                <span>
                                    <strong>{teacher.name}</strong>
                                    {teacher.linked && (
                                        <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle ms-2">
                                            <i
                                                className="bi bi-link-45deg me-1"
                                                aria-hidden="true"
                                            />
                                            Linked
                                        </span>
                                    )}
                                </span>
                            </span>
                            <Button
                                variant={teacher.linked ? 'secondary' : 'primary'}
                                size="sm"
                                aria-label={`${teacher.linked ? 'Ontkoppel van' : 'Koppel aan'} ${teacher.name}`}
                                onClick={() => toggleLink(teacher)}
                            >
                                {teacher.linked ? 'Ontkoppelen' : 'Koppel aan deze docent'}
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
