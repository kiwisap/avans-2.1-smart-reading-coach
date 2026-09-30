import { useState, type SubmitEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import AuthLayout from '../components/AuthLayout.tsx';
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

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
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
        <AuthLayout title="Inloggen" subtitle="Welkom terug. Ga verder waar je gebleven was.">
            {error && <Alert>{error}</Alert>}
            <form onSubmit={handleSubmit}>
                <TextField
                    label="E-mail"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    label="Wachtwoord"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" size="lg" className="w-100" disabled={submitting}>
                    {submitting ? 'Bezig met inloggen...' : 'Inloggen'}
                </Button>
            </form>
            <p className="mt-4 mb-0">
                Nog geen account? <Link to="/register">Registreer</Link>
            </p>
        </AuthLayout>
    );
}
