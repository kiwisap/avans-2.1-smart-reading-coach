import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import AuthLayout, { type AuthBo } from '../components/AuthLayout.tsx';
import type { User } from '../types/api.ts';
import { useTranslation } from 'react-i18next';

// A link works once. React may run the effect twice in development, so the request is shared.
const requests = new Map<string, Promise<{ user: User }>>();

function confirm(token: string): Promise<{ user: User }> {
    let request = requests.get(token);
    if (!request) {
        request = apiFetch<{ user: User }>('/auth/email/confirm', {
            method: 'POST',
            body: { token },
        });
        requests.set(token, request);
    }
    return request;
}

// The link sent to a new email address: from now on the account uses that address.
export default function ConfirmEmailPage() {
    const { t } = useTranslation();
    const { user, updateUser } = useAuth();
    const token = useSearchParams()[0].get('token') ?? '';
    const [newEmail, setNewEmail] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(token ? null : t('verify.link.missing'));
    const userId = user?.id;

    useEffect(() => {
        if (!token) return undefined;
        let cancelled = false;
        confirm(token)
            .then((data) => {
                if (cancelled) return;
                setNewEmail(data.user.email);
                // Logged in as this user (maybe in this very tab): show the new address right away.
                if (data.user.id === userId) updateUser(data.user);
            })
            .catch((err: unknown) => {
                if (!cancelled) setError(errorMessage(err));
            });
        return () => {
            cancelled = true;
        };
    }, [token, userId, updateUser]);

    let bo: AuthBo = { mood: 'think', text: t('verify.link.boChecking') };
    if (error) bo = { mood: 'think', text: t('verify.change.boFailed') };
    else if (newEmail) bo = { mood: 'party', text: t('verify.change.bo', { email: newEmail }) };

    return (
        <AuthLayout title={t('verify.change.title')} subtitle={t('verify.change.subtitle')} bo={bo}>
            {error && <Alert>{error}</Alert>}
            {newEmail && (
                <Alert type="success">{t('verify.change.done', { email: newEmail })}</Alert>
            )}
            {!error && !newEmail && (
                <p role="status" className="d-flex align-items-center gap-2">
                    <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                    {t('verify.link.checking')}
                </p>
            )}
            {(error || newEmail) && (
                <p className="mt-3 mb-0">
                    <Link to={user ? '/' : '/login'}>
                        {user ? t('verify.change.toApp') : t('verify.link.toLogin')}
                    </Link>
                </p>
            )}
        </AuthLayout>
    );
}
