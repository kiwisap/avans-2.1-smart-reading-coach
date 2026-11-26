import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.tsx';
import ResendVerification from '../components/ResendVerification.tsx';
import TextField from '../components/TextField.tsx';
import { Trans, useTranslation } from 'react-i18next';

// Right after registering: the account exists, but first the email address must be confirmed.
export default function CheckEmailPage() {
    const { t } = useTranslation();
    const state = useLocation().state as { email?: string; name?: string } | null;
    // Opened without coming from the register form: the visitor types the address.
    const [email, setEmail] = useState(state?.email ?? '');
    const name = state?.name?.trim();

    return (
        <AuthLayout
            title={t('verify.check.title')}
            subtitle={t('verify.check.subtitle')}
            bo={{
                mood: 'party',
                text: name
                    ? t('verify.check.boName', { name, email: state?.email })
                    : t('verify.check.bo'),
            }}
        >
            <ol className="check-steps">
                <li>
                    <Trans
                        i18nKey="verify.check.step1"
                        values={{ email: state?.email ?? t('verify.check.yourAddress') }}
                        components={{ strong: <strong /> }}
                    />
                </li>
                <li>{t('verify.check.step2')}</li>
                <li>{t('verify.check.step3')}</li>
            </ol>

            <h2 className="h6 mt-4">{t('verify.check.noMail')}</h2>
            <p className="text-body-secondary small">{t('verify.check.spam')}</p>
            {!state?.email && (
                <TextField
                    label={t('auth.email')}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            )}
            <ResendVerification email={email.trim()} />

            <p className="mt-4 mb-0 small">
                <Trans
                    i18nKey="verify.check.other"
                    components={{ register: <Link to="/register" />, login: <Link to="/login" /> }}
                />
            </p>
        </AuthLayout>
    );
}
