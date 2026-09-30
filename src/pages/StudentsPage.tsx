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
            <h1>Your students</h1>
            {error && <Alert>{error}</Alert>}
            {!students && !error && <Skeleton lines={4} label="Loading students" />}
            {students?.length === 0 && (
                <p>
                    No students are linked to you yet. Students link themselves to you on their
                    &quot;My teachers&quot; page.
                </p>
            )}
            {students && students.length > 0 && (
                <ul className="list">
                    {students.map((student) => (
                        <li key={student.id}>
                            <span>
                                <Link to={`/students/${student.id}`}>
                                    <strong>{student.name}</strong>
                                </Link>{' '}
                                <span className="book-meta">{student.email}</span>
                            </span>
                            <span className={student.hasProfile ? 'badge badge-read' : 'badge'}>
                                {student.hasProfile ? '✓ Profile filled in' : 'No profile yet'}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
