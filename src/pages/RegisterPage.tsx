import { useState, type SubmitEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import AuthLayout, { type AuthBo } from '../components/AuthLayout.tsx';
import Button from '../components/Button.tsx';
import TextField from '../components/TextField.tsx';
import { Trans, useTranslation } from 'react-i18next';

export default function RegisterPage() {
    const { t } = useTranslation();
    const { user, register } = useAuth();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState('');
    const [infix, setInfix] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [focused, setFocused] = useState<'email' | 'password' | null>(null);
    if (user) return <Navigate to="/" replace />;

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const sentTo = await register({ firstName, infix, lastName }, email, password);
            // First the email address: the link in the mail logs the student in and starts the
            // reading profile game.
            navigate('/check-email', { replace: true, state: { email: sentTo, name: firstName } });
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    // Bo gets to know the new student while they fill in the form.
    const name = firstName.trim();
    let bo: AuthBo = { mood: 'wave', text: t('auth.bo.registerHello') };
    if (submitting) bo = { mood: 'party', text: t('auth.bo.registerGo', { name }) };
    else if (error) bo = { mood: 'think', text: t('auth.bo.registerError') };
    else if (focused === 'password') {
        bo = {
            mood: 'happy',
            text: password.length >= 8 ? t('auth.bo.passwordLong') : t('auth.bo.noPeeking'),
        };
    } else if (focused === 'email') bo = { mood: 'think', text: t('auth.bo.registerEmail') };
    else if (name) bo = { mood: 'party', text: t('auth.bo.registerHi', { name }) };

    return (
        <AuthLayout title={t('auth.register.title')} subtitle={t('auth.register.subtitle')} bo={bo}>
            {error && <Alert>{error}</Alert>}
            <form onSubmit={handleSubmit}>
                {/* First name and infix side by side, the last name below: room for every label. */}
                <div className="row g-2">
                    <div className="col-sm-7">
                        <TextField
                            label={t('auth.register.firstName')}
                            autoComplete="given-name"
                            required
                            maxLength={60}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="col-sm-5">
                        <TextField
                            label={t('auth.register.infix')}
                            autoComplete="additional-name"
                            maxLength={20}
                            value={infix}
                            onChange={(e) => setInfix(e.target.value)}
                        />
                    </div>
                    <div className="col-12">
                        <TextField
                            label={t('auth.register.lastName')}
                            autoComplete="family-name"
                            required
                            maxLength={80}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                </div>
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
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={72}
                    hint={t('auth.register.passwordHint')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
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
