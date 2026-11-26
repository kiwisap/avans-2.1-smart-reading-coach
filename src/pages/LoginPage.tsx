import { useState, type SubmitEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ApiError, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import AuthLayout, { type AuthBo } from '../components/AuthLayout.tsx';
import Button from '../components/Button.tsx';
import ResendVerification from '../components/ResendVerification.tsx';
import TextField from '../components/TextField.tsx';
import { Trans, useTranslation } from 'react-i18next';

export default function LoginPage() {
    const { t } = useTranslation();
    const { user, login, notice } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [focused, setFocused] = useState<'email' | 'password' | null>(null);
    // The password was right, but the email address is not confirmed yet.
    const [unconfirmed, setUnconfirmed] = useState(false);

    // Where the route guard sent the visitor from. Also used when the session appears first.
    const from = (location.state as { from?: string } | null)?.from;

    if (user) return <Navigate to={from ?? '/'} replace />;

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setUnconfirmed(false);
        setSubmitting(true);
        try {
            await login(email, password);
            navigate(from ?? '/', { replace: true });
        } catch (err) {
            setUnconfirmed(err instanceof ApiError && err.status === 403);
            setError(errorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    // Bo reacts to the form: he looks away while you type your password.
    let bo: AuthBo = { mood: 'wave', text: t('auth.bo.loginHello') };
    if (submitting) bo = { mood: 'party', text: t('auth.bo.loginGo') };
    else if (unconfirmed) bo = { mood: 'wave', text: t('auth.bo.loginUnconfirmed') };
    else if (error) bo = { mood: 'think', text: t('auth.bo.loginError') };
    else if (focused === 'password') bo = { mood: 'happy', text: t('auth.bo.noPeeking') };
    else if (focused === 'email') bo = { mood: 'think', text: t('auth.bo.loginEmail') };
    else if (notice) bo = { mood: 'wave', text: t('auth.bo.loginNotice') };

    return (
        <AuthLayout title={t('auth.login.title')} subtitle={t('auth.login.subtitle')} bo={bo}>
            {notice && !error && <Alert type="success">{notice}</Alert>}
            {error && <Alert>{error}</Alert>}
            {unconfirmed && (
                <div className="mb-4">
                    <ResendVerification email={email.trim()} />
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <TextField
                    label={t('auth.email')}
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                />
                <TextField
                    label={t('auth.password')}
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                />
                <p className="text-end small mt-n2 mb-3">
                    <Link to="/forgot-password">{t('auth.login.forgot')}</Link>
                </p>
                <Button type="submit" size="lg" className="w-100" disabled={submitting}>
                    {submitting ? t('auth.login.submitting') : t('auth.login.submit')}
                </Button>
            </form>
            <p className="mt-4 mb-0">
                <Trans
                    i18nKey="auth.login.noAccount"
                    components={{ register: <Link to="/register" /> }}
                />
            </p>
        </AuthLayout>
    );
}
