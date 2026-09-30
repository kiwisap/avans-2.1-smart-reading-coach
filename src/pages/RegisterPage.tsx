import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
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

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        <section className="card narrow">
            <h1>Create an account</h1>
            {error && <Alert>{error}</Alert>}
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
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
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={72}
                    hint="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creating account...' : 'Register'}
                </Button>
            </form>
            <p>
                Already have an account? <Link to="/login">Log in</Link>
            </p>
        </section>
    );
}
