import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import AuthLayout from '../components/AuthLayout.tsx';
import Button from '../components/Button.tsx';
import TextField from '../components/TextField.tsx';
import { useTranslation } from 'react-i18next';

// The link from the reset mail: choose a new password, then log in with it.
export default function ResetPasswordPage() {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const token = useSearchParams()[0].get('token') ?? '';
    const [password, setPassword] = useState('');
    const [repeat, setRepeat] = useState('');
    const [error, setError] = useState<string | null>(token ? null : t('verify.link.missing'));
    const [saving, setSaving] = useState(false);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (password !== repeat) {
            setError(t('settings.account.passwordsDiffer'));
            return;
        }
        setError(null);
        setSaving(true);
        try {
            await apiFetch('/auth/password/reset', {
                method: 'POST',
                body: { token, newPassword: password },
            });
            // Also ends a session that may still be open, the old password no longer counts.
            logout(t('reset.done'));
            navigate('/login', { replace: true });
        } catch (err) {
            setError(errorMessage(err));
            setSaving(false);
        }
    }

    return (
        <AuthLayout
            title={t('reset.new.title')}
            subtitle={t('reset.new.subtitle')}
            bo={
                error
                    ? { mood: 'think', text: t('reset.new.boError') }
                    : { mood: 'happy', text: t('auth.bo.noPeeking') }
            }
        >
            {error && (
                <Alert>
                    {error} <Link to="/forgot-password">{t('reset.new.again')}</Link>
                </Alert>
            )}
            {token && (
                <form onSubmit={handleSubmit}>
                    <TextField
                        label={t('settings.account.newPassword')}
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        maxLength={72}
                        hint={t('auth.register.passwordHint')}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                    <TextField
                        label={t('settings.account.repeatPassword')}
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={8}
                        maxLength={72}
                        value={repeat}
                        onChange={(event) => setRepeat(event.target.value)}
                    />
                    <Button
                        type="submit"
                        size="lg"
                        className="w-100"
                        icon="bi-key"
                        disabled={saving}
                    >
                        {saving ? t('reset.new.saving') : t('reset.new.submit')}
                    </Button>
                </form>
            )}
        </AuthLayout>
    );
}
