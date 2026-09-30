import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import Button from '../components/Button.tsx';
import TextField from '../components/TextField.tsx';

export default function LoginPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (user) return <Navigate to="/" replace />;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login(email, password);
            const from = (location.state as { from?: string } | null)?.from;
            navigate(from ?? '/', { replace: true });
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="card narrow">
            <h1>Log in</h1>
            {error && <Alert>{error}</Alert>}
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Logging in...' : 'Log in'}
                </Button>
            </form>
            <p>
                No account yet? <Link to="/register">Register</Link>
            </p>
        </section>
    );
}
