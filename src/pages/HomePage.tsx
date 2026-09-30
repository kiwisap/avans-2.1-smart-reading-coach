import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from '../components/Alert.tsx';

export default function HomePage() {
    const { user } = useAuth();
    const location = useLocation();
    const notice = (location.state as { notice?: string } | null)?.notice;

    if (!user) return null;

    return (
        <section>
            {notice && <Alert>{notice}</Alert>}
            <h1>Welcome, {user.name}</h1>
            <p>You are logged in as a {user.role}.</p>
            <ul>
                {user.role === 'student' && (
                    <li>
                        <Link to="/profile">Fill in or change your reading profile</Link>
                    </li>
                )}
                {user.role === 'student' && (
                    <li>
                        <Link to="/advice">Get your reading advice</Link>
                    </li>
                )}
                {user.role === 'student' && (
                    <li>
                        <Link to="/reading-list">Open your reading list</Link>
                    </li>
                )}
                {user.role === 'student' && (
                    <li>
                        <Link to="/teachers">Link to your teacher</Link>
                    </li>
                )}
                {user.role === 'teacher' && (
                    <li>
                        <Link to="/students">See your students</Link>
                    </li>
                )}
                <li>
                    <Link to="/catalog">Browse the catalog</Link>
                </li>
            </ul>
        </section>
    );
}
