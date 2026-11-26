import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import AuthLayout from '../components/AuthLayout.tsx';
import ResendVerification from '../components/ResendVerification.tsx';
import TextField from '../components/TextField.tsx';
import type { AuthResponse } from '../types/api.ts';
import { useTranslation } from 'react-i18next';

// A link works once. React may run the effect twice in development, so the request is shared.
const requests = new Map<string, Promise<AuthResponse>>();

function confirm(token: string): Promise<AuthResponse> {
    let request = requests.get(token);
    if (!request) {
        request = apiFetch<AuthResponse>('/auth/verify-email', {
            method: 'POST',
            body: { token },
        });
        requests.set(token, request);
    }
    return request;
}

// The link from the confirmation mail: confirms the address and logs the student in.
export default function VerifyEmailPage() {
    const { t } = useTranslation();
    const { acceptSession } = useAuth();
    const navigate = useNavigate();
    const token = useSearchParams()[0].get('token') ?? '';
    const [error, setError] = useState<string | null>(token ? null : t('verify.link.missing'));
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (!token) return undefined;
        let cancelled = false;
        confirm(token)
            .then((data) => {
                if (cancelled) return;
                acceptSession(data);
                // A new student starts with the reading profile game.
                navigate(data.user.role === 'student' ? '/welcome' : '/', { replace: true });
            })
            .catch((err: unknown) => {
                if (!cancelled) setError(errorMessage(err));
            });
        return () => {
            cancelled = true;
        };
    }, [token, acceptSession, navigate]);

    return (
        <AuthLayout
            title={error ? t('verify.link.failedTitle') : t('verify.link.title')}
            subtitle={error ? t('verify.link.failedSubtitle') : t('verify.link.subtitle')}
            bo={
                error
                    ? { mood: 'think', text: t('verify.link.boFailed') }
                    : { mood: 'think', text: t('verify.link.boChecking') }
            }
        >
            {error ? (
                <>
                    <Alert>{error}</Alert>
                    <TextField
                        label={t('auth.email')}
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                    <ResendVerification email={email.trim()} />
                    <p className="mt-4 mb-0 small">
                        <Link to="/login">{t('verify.link.toLogin')}</Link>
                    </p>
                </>
            ) : (
                <p role="status" className="d-flex align-items-center gap-2">
                    <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                    {t('verify.link.checking')}
                </p>
            )}
        </AuthLayout>
    );
}
