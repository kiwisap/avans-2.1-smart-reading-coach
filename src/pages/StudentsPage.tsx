import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import Skeleton from '../components/Skeleton.tsx';
import type { StudentSummary } from '../types/api.ts';

export default function StudentsPage() {
    const { token } = useAuth();
    const [students, setStudents] = useState<StudentSummary[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiFetch<{ students: StudentSummary[] }>('/students', { token })
            .then((data) => setStudents(data.students))
            .catch((err: unknown) => setError(errorMessage(err)));
    }, [token]);

    return (
        <section>
            <header className="mb-4">
                <h1 className="page-title">
                    <i className="bi bi-people me-2" aria-hidden="true" />
                    Jouw leerlingen
                </h1>
            </header>
            {error && <Alert>{error}</Alert>}
            {!students && !error && <Skeleton lines={4} label="Leerlingen laden" />}
            {students?.length === 0 && (
                <div className="text-center py-5">
                    <i
                        className="bi bi-person-plus display-4 text-body-secondary"
                        aria-hidden="true"
                    />
                    <h2 className="h4 mt-3">Nog geen leerlingen</h2>
                    <p className="text-body-secondary">
                        Leerlingen koppelen zichzelf aan jou op hun pagina &quot;Mijn
                        docenten&quot;.
                    </p>
                </div>
            )}
            {students && students.length > 0 && (
                <ul className="list-group shadow-sm">
                    {students.map((student) => (
                        <li
                            key={student.id}
                            className="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2 py-3"
                        >
                            <span className="d-flex align-items-center gap-3">
                                <i
                                    className="bi bi-person-circle fs-3 text-body-secondary"
                                    aria-hidden="true"
                                />
                                <span>
                                    <Link to={`/students/${student.id}`} className="fw-semibold">
                                        {student.name}
                                    </Link>
                                    <br />
                                    <span className="text-body-secondary small">
                                        {student.email}
                                    </span>
                                </span>
                            </span>
                            <span
                                className={`badge rounded-pill border ${
                                    student.hasProfile
                                        ? 'bg-success-subtle text-success-emphasis border-success-subtle'
                                        : 'bg-body-secondary text-body-emphasis'
                                }`}
                            >
                                <i
                                    className={`bi ${student.hasProfile ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}
                                    aria-hidden="true"
                                />
                                {student.hasProfile ? 'Profiel ingevuld' : 'Nog geen profiel'}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
