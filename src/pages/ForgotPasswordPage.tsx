import { useState, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, errorMessage } from '../api/client.ts';
import Alert from '../components/Alert.tsx';
import AuthLayout from '../components/AuthLayout.tsx';
import Button from '../components/Button.tsx';
import TextField from '../components/TextField.tsx';
import { useTranslation } from 'react-i18next';

// Asks for a link to choose a new password. The answer is the same for every address.
export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [sentTo, setSentTo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSending(true);
        try {
            await apiFetch('/auth/password/forgot', {
                method: 'POST',
                body: { email: email.trim() },
            });
            setSentTo(email.trim());
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSending(false);
        }
    }

    return (
        <AuthLayout
            title={t('reset.forgot.title')}
            subtitle={t('reset.forgot.subtitle')}
            bo={
                sentTo
                    ? { mood: 'party', text: t('reset.forgot.boSent') }
                    : { mood: 'think', text: t('reset.forgot.bo') }
            }
        >
            {error && <Alert>{error}</Alert>}
            {sentTo ? (
                <Alert type="success">{t('reset.forgot.sent', { email: sentTo })}</Alert>
            ) : (
                <form onSubmit={handleSubmit}>
                    <TextField
                        label={t('auth.email')}
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                    <Button
                        type="submit"
                        size="lg"
                        className="w-100"
                        icon="bi-envelope"
                        disabled={sending}
                    >
                        {sending ? t('reset.forgot.sending') : t('reset.forgot.submit')}
                    </Button>
                </form>
            )}
            <p className="mt-4 mb-0">
                <Link to="/login">{t('reset.backToLogin')}</Link>
            </p>
        </AuthLayout>
    );
}
