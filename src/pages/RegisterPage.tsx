import { useState, type SubmitEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import AuthLayout from '../components/AuthLayout.tsx';
import Button from '../components/Button.tsx';
import TextField from '../components/TextField.tsx';

export default function RegisterPage() {
    const { user, register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
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
            await register(name, email, password);
            navigate('/', { replace: true });
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout
            title="Account aanmaken"
            subtitle="Het duurt maar een minuutje. Daarna kunnen we adviseren."
        >
            {error && <Alert>{error}</Alert>}
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Naam"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
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
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={72}
                    hint="Minimaal 8 tekens"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" size="lg" className="w-100" disabled={submitting}>
                    {submitting ? 'Account aanmaken...' : 'Registreren'}
                </Button>
            </form>
            <p className="mt-4 mb-0">
                Heb je al een account? <Link to="/login">Inloggen</Link>
            </p>
        </AuthLayout>
    );
}
