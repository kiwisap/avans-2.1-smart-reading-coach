import { useEffect, useId, useRef, useState, type ReactNode, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import type { ReadingProfile, User } from '../types/api.ts';
import Alert from './Alert.tsx';
import Button from './Button.tsx';
import Mascot from './Mascot.tsx';
import TextField from './TextField.tsx';
import { useTranslation } from 'react-i18next';

interface SettingsPanelProps {
    open: boolean;
    onClose: () => void;
}

interface Notice {
    type: 'success' | 'error';
    text: string;
}

type AiStatus = 'ok' | 'unavailable' | 'disabled' | 'unknown';

// A small form inside a collapsible section, with its own message.
function SettingSection({
    title,
    current,
    icon,
    children,
}: {
    title: string;
    current: string;
    icon: string;
    children: ReactNode;
}) {
    return (
        <details className="setting-section">
            <summary>
                <i className={`bi ${icon}`} aria-hidden="true" />
                <span className="flex-grow-1 min-w-0">
                    <span className="d-block fw-semibold">{title}</span>
                    <span className="d-block small text-body-secondary text-truncate">
                        {current}
                    </span>
                </span>
                <i className="bi bi-chevron-down setting-chevron" aria-hidden="true" />
            </summary>
            <div className="setting-body">{children}</div>
        </details>
    );
}

// Settings of the logged in user as a panel on the right: reading profile (with Bo), name, email,
// password, logging out and information about the app. A native <dialog>, so it traps the focus,
// closes on Escape and gives the focus back to the button that opened it.
export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
    const { t, i18n } = useTranslation();
    const { token, user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    const [profile, setProfile] = useState<ReadingProfile | null | undefined>(undefined);
    const [aiStatus, setAiStatus] = useState<AiStatus>('unknown');

    // The panel is mounted again on every opening (see Layout), so these start fresh.
    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [emailPassword, setEmailPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [busy, setBusy] = useState<'name' | 'email' | 'password' | null>(null);
    const [notices, setNotices] = useState<Partial<Record<'name' | 'email' | 'password', Notice>>>(
        {},
    );

    const isStudent = user?.role === 'student';

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    // A click on the dark backdrop (the dialog element itself, outside the panel) closes it.
    // Keyboard users close it with Escape or the close button.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return undefined;
        const closeOnBackdrop = (event: MouseEvent) => {
            if (event.target === dialog) onClose();
        };
        dialog.addEventListener('click', closeOnBackdrop);
        return () => dialog.removeEventListener('click', closeOnBackdrop);
    }, [onClose]);

    // Fresh data every time the panel opens.
    useEffect(() => {
        if (!open || !user) return undefined;
        let cancelled = false;

        apiFetch<{ ai?: AiStatus }>('/health')
            .then((health) => {
                if (!cancelled) setAiStatus(health.ai ?? 'unknown');
            })
            .catch(() => {
                if (!cancelled) setAiStatus('unknown');
            });

        if (user.role === 'student') {
            apiFetch<{ profile: ReadingProfile | null }>('/profile/me', { token })
                .then((data) => {
                    if (!cancelled) setProfile(data.profile);
                })
                .catch(() => {
                    if (!cancelled) setProfile(null);
                });
        }
        return () => {
            cancelled = true;
        };
    }, [open, user, token]);

    if (!user) return null;

    function notify(form: 'name' | 'email' | 'password', notice: Notice) {
        setNotices((current) => ({ ...current, [form]: notice }));
    }

    async function saveAccount(form: 'name' | 'email', body: Record<string, string>, done: string) {
        setBusy(form);
        try {
            const data = await apiFetch<{ user: User }>('/auth/me', {
                method: 'PATCH',
                token,
                body,
            });
            updateUser(data.user);
            if (form === 'email') setEmailPassword('');
            notify(form, { type: 'success', text: done });
        } catch (err) {
            notify(form, { type: 'error', text: errorMessage(err) });
        } finally {
            setBusy(null);
        }
    }

    function handleName(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        void saveAccount('name', { name: name.trim() }, t('settings.account.nameSaved'));
    }

    function handleEmail(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        void saveAccount(
            'email',
            { email: email.trim(), currentPassword: emailPassword },
            t('settings.account.emailSaved'),
        );
    }

    async function handlePassword(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (newPassword !== repeatPassword) {
            notify('password', { type: 'error', text: t('settings.account.passwordsDiffer') });
            return;
        }
        setBusy('password');
        try {
            await apiFetch('/auth/me/password', {
                method: 'PUT',
                token,
                body: { currentPassword, newPassword },
            });
            setCurrentPassword('');
            setNewPassword('');
            setRepeatPassword('');
            notify('password', { type: 'success', text: t('settings.account.passwordSaved') });
        } catch (err) {
            notify('password', { type: 'error', text: errorMessage(err) });
        } finally {
            setBusy(null);
        }
    }

    function goTo(path: string) {
        onClose();
        navigate(path);
    }

    function handleLogout() {
        onClose();
        logout();
        navigate('/login');
    }

    const built = new Date(__BUILD_TIME__).toLocaleString(i18n.language, {
        dateStyle: 'long',
        timeStyle: 'short',
    });
    const aiText = {
        ok: t('settings.about.aiOk'),
        unavailable: t('settings.about.aiUnavailable'),
        disabled: t('settings.about.aiDisabled'),
        unknown: t('settings.about.aiUnknown'),
    }[aiStatus];

    return (
        <dialog
            ref={dialogRef}
            className="settings-panel"
            aria-labelledby={titleId}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
        >
            <div className="settings-inner">
                <header className="settings-header">
                    <span className="avatar avatar-lg" aria-hidden="true">
                        {user.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex-grow-1 min-w-0">
                        <h2 id={titleId} className="h5 mb-0 text-truncate">
                            {user.name}
                        </h2>
                        <p className="small text-body-secondary mb-0 text-truncate">
                            {user.email} · {t(`roles.${user.role}`)}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label={t('settings.close')}
                        onClick={onClose}
                    />
                </header>

                <div className="settings-content">
                    {isStudent && (
                        <section aria-labelledby={`${titleId}-profile`} className="settings-block">
                            <h3 id={`${titleId}-profile`} className="settings-heading">
                                {t('settings.profile.heading')}
                            </h3>
                            <div className="settings-bo">
                                <Mascot mood={profile ? 'happy' : 'wave'} size={72} />
                                <p className="speech-bubble speech-bubble-sm mb-0">
                                    {profile === undefined
                                        ? t('settings.profile.loading')
                                        : profile
                                          ? t('settings.profile.filledBubble')
                                          : t('settings.profile.emptyBubble')}
                                </p>
                            </div>
                            {profile && (
                                <ul
                                    className="list-unstyled d-flex flex-wrap gap-1 mt-3 mb-0"
                                    aria-label={t('settings.profile.summary')}
                                >
                                    <li>
                                        <span className="chip">
                                            {t('settings.profile.level', {
                                                level: profile.languageLevel,
                                            })}
                                        </span>
                                    </li>
                                    {profile.topics.map((topic) => (
                                        <li key={topic}>
                                            <span className="chip">{topic}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {profile !== undefined && (
                                <div className="d-flex flex-wrap align-items-center gap-3 mt-3">
                                    <Button
                                        className="btn-accent"
                                        icon="bi-controller"
                                        onClick={() => goTo('/welcome')}
                                    >
                                        {profile
                                            ? t('settings.profile.edit')
                                            : t('settings.profile.start')}
                                    </Button>
                                    <Link to="/profile" className="small" onClick={onClose}>
                                        {t('settings.profile.form')}
                                    </Link>
                                </div>
                            )}
                        </section>
                    )}

                    <section aria-labelledby={`${titleId}-account`} className="settings-block">
                        <h3 id={`${titleId}-account`} className="settings-heading">
                            {t('settings.account.heading')}
                        </h3>

                        <SettingSection
                            title={t('settings.account.name')}
                            current={user.name}
                            icon="bi-person"
                        >
                            {notices.name && (
                                <Alert type={notices.name.type}>{notices.name.text}</Alert>
                            )}
                            <form onSubmit={handleName}>
                                <TextField
                                    label={t('settings.account.name')}
                                    autoComplete="name"
                                    required
                                    maxLength={100}
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                />
                                <Button type="submit" size="sm" disabled={busy === 'name'}>
                                    {busy === 'name'
                                        ? t('settings.account.saving')
                                        : t('settings.account.saveName')}
                                </Button>
                            </form>
                        </SettingSection>

                        <SettingSection
                            title={t('settings.account.email')}
                            current={user.email}
                            icon="bi-envelope"
                        >
                            {notices.email && (
                                <Alert type={notices.email.type}>{notices.email.text}</Alert>
                            )}
                            <form onSubmit={handleEmail}>
                                <TextField
                                    label={t('settings.account.newEmail')}
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                />
                                <TextField
                                    label={t('settings.account.currentPassword')}
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    hint={t('settings.account.currentPasswordHint')}
                                    value={emailPassword}
                                    onChange={(event) => setEmailPassword(event.target.value)}
                                />
                                <Button type="submit" size="sm" disabled={busy === 'email'}>
                                    {busy === 'email'
                                        ? t('settings.account.saving')
                                        : t('settings.account.saveEmail')}
                                </Button>
                            </form>
                        </SettingSection>

                        <SettingSection
                            title={t('settings.account.password')}
                            current={t('settings.account.passwordCurrent')}
                            icon="bi-key"
                        >
                            {notices.password && (
                                <Alert type={notices.password.type}>{notices.password.text}</Alert>
                            )}
                            <form onSubmit={handlePassword}>
                                <TextField
                                    label={t('settings.account.currentPassword')}
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={currentPassword}
                                    onChange={(event) => setCurrentPassword(event.target.value)}
                                />
                                <TextField
                                    label={t('settings.account.newPassword')}
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    minLength={8}
                                    maxLength={72}
                                    hint={t('auth.register.passwordHint')}
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                />
                                <TextField
                                    label={t('settings.account.repeatPassword')}
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    minLength={8}
                                    maxLength={72}
                                    value={repeatPassword}
                                    onChange={(event) => setRepeatPassword(event.target.value)}
                                />
                                <Button type="submit" size="sm" disabled={busy === 'password'}>
                                    {busy === 'password'
                                        ? t('settings.account.saving')
                                        : t('settings.account.savePassword')}
                                </Button>
                            </form>
                        </SettingSection>

                        <Button
                            variant="outline-danger"
                            icon="bi-box-arrow-right"
                            className="w-100 mt-3"
                            onClick={handleLogout}
                        >
                            {t('nav.logout')}
                        </Button>
                    </section>

                    <section
                        aria-labelledby={`${titleId}-about`}
                        className="settings-block settings-about"
                    >
                        <h3 id={`${titleId}-about`} className="settings-heading">
                            {t('settings.about.heading')}
                        </h3>
                        <dl className="mb-2">
                            <div>
                                <dt>{t('settings.about.version')}</dt>
                                <dd>{__APP_VERSION__}</dd>
                            </div>
                            <div>
                                <dt>{t('settings.about.built')}</dt>
                                <dd>{built}</dd>
                            </div>
                            <div>
                                <dt>{t('settings.about.commit')}</dt>
                                <dd>
                                    <code>{__GIT_COMMIT__}</code>
                                </dd>
                            </div>
                            <div>
                                <dt>{t('settings.about.ai')}</dt>
                                <dd>
                                    <i
                                        className={`bi ${aiStatus === 'ok' ? 'bi-circle-fill text-success' : 'bi-circle text-secondary'} me-1 small`}
                                        aria-hidden="true"
                                    />
                                    {aiText}
                                </dd>
                            </div>
                        </dl>
                        <p className="small text-body-secondary mb-0">{t('settings.about.text')}</p>
                    </section>
                </div>
            </div>
        </dialog>
    );
}
