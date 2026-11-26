import { useState, type SubmitEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import AuthLayout from '../components/AuthLayout.tsx';
import Button from '../components/Button.tsx';
import TextField from '../components/TextField.tsx';
import { Trans, useTranslation } from 'react-i18next';

export default function RegisterPage() {
    const { t } = useTranslation();
    const { user, register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    // Set before registering: the moment the account exists this page renders again with a user,
    // and must then send the new student to the reading profile game instead of the catalogue.
    const [justRegistered, setJustRegistered] = useState(false);

    if (user) return <Navigate to={justRegistered ? '/welcome' : '/'} replace />;

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        setJustRegistered(true);
        try {
            await register(name, email, password);
            // New students start with their reading profile (they can skip it there).
            navigate('/welcome', { replace: true });
        } catch (err) {
            setJustRegistered(false);
            setError(errorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout title={t('auth.register.title')} subtitle={t('auth.register.subtitle')}>
            {error && <Alert>{error}</Alert>}
            <form onSubmit={handleSubmit}>
                <TextField
                    label={t('auth.register.name')}
                    autoComplete="name"
                    required
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    label={t('auth.email')}
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    label={t('auth.password')}
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={72}
                    hint={t('auth.register.passwordHint')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" size="lg" className="w-100" disabled={submitting}>
                    {submitting ? t('auth.register.submitting') : t('auth.register.submit')}
                </Button>
            </form>
            <p className="mt-4 mb-0">
                <Trans
                    i18nKey="auth.register.haveAccount"
                    components={{ login: <Link to="/login" /> }}
                />
            </p>
        </AuthLayout>
    );
}
