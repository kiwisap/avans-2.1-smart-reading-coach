import { useEffect, useState } from 'react';
import { apiFetch, errorMessage } from '../api/client.ts';
import Alert from './Alert.tsx';
import Button from './Button.tsx';
import { useTranslation } from 'react-i18next';

const WAIT_SECONDS = 60; // the API sends at most one confirmation mail a minute

// "Send the mail again", with a short wait between tries. The API answers the same whether the
// address has an account or not, so this never tells anyone which addresses exist.
export default function ResendVerification({ email }: { email: string }) {
    const { t } = useTranslation();
    const [wait, setWait] = useState(0);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (wait <= 0) return undefined;
        const timer = window.setTimeout(() => setWait((seconds) => seconds - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [wait]);

    async function resend() {
        setError(null);
        try {
            await apiFetch('/auth/verify-email/resend', { method: 'POST', body: { email } });
            setSent(true);
            setWait(WAIT_SECONDS);
        } catch (err) {
            setError(errorMessage(err));
        }
    }

    return (
        <div>
            {error && <Alert>{error}</Alert>}
            {sent && <Alert type="success">{t('verify.resent', { email })}</Alert>}
            <Button
                variant="secondary"
                icon="bi-envelope-arrow-up"
                disabled={!email || wait > 0}
                onClick={resend}
            >
                {wait > 0 ? t('verify.resendWait', { seconds: wait }) : t('verify.resend')}
            </Button>
        </div>
    );
}
