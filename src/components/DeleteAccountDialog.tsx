import { useEffect, useId, useRef, useState, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from './Alert.tsx';
import Button from './Button.tsx';
import TextField from './TextField.tsx';
import { useTranslation } from 'react-i18next';

interface DeleteAccountDialogProps {
    open: boolean;
    onClose: () => void;
}

// Asks for confirmation before the account is removed for good: the consequences, the word
// VERWIJDEREN typed over and the password. A native <dialog>, on top of the settings panel.
export default function DeleteAccountDialog({ open, onClose }: DeleteAccountDialogProps) {
    const { t } = useTranslation();
    const { token, user, logout } = useAuth();
    const navigate = useNavigate();
    const ref = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const [typed, setTyped] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const word = t('settings.delete.word');
    const confirmed = typed.trim() === word && password !== '';

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    function close() {
        setTyped('');
        setPassword('');
        setError(null);
        onClose();
    }

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!confirmed) return;
        setDeleting(true);
        setError(null);
        try {
            await apiFetch('/auth/me', {
                method: 'DELETE',
                token,
                body: { currentPassword: password },
            });
            logout(t('settings.delete.done'));
            navigate('/login', { replace: true });
        } catch (err) {
            setError(errorMessage(err));
            setDeleting(false);
        }
    }

    const consequences =
        user?.role === 'teacher'
            ? [t('settings.delete.teacher.a'), t('settings.delete.teacher.b')]
            : [
                  t('settings.delete.student.a'),
                  t('settings.delete.student.b'),
                  t('settings.delete.student.c'),
              ];

    return (
        <dialog
            ref={ref}
            aria-labelledby={titleId}
            className="dialog delete-dialog"
            onCancel={(event) => {
                // React passes the event on to the settings panel around this dialog, which
                // would close as well. Escape only closes this dialog.
                event.preventDefault();
                event.stopPropagation();
                close();
            }}
        >
            <form onSubmit={handleSubmit} noValidate>
                <div className="p-4">
                    <div className="delete-icon mb-3" aria-hidden="true">
                        <i className="bi bi-exclamation-triangle-fill" />
                    </div>
                    <h2 id={titleId} className="h4 mb-3">
                        {t('settings.delete.title')}
                    </h2>
                    <p className="mb-2">{t('settings.delete.intro')}</p>
                    <ul className="delete-consequences">
                        {consequences.map((line) => (
                            <li key={line}>{line}</li>
                        ))}
                    </ul>
                    <p className="fw-semibold">{t('settings.delete.final')}</p>

                    {error && <Alert>{error}</Alert>}

                    <TextField
                        label={t('settings.delete.typeLabel', { word })}
                        autoComplete="off"
                        spellCheck={false}
                        value={typed}
                        onChange={(event) => setTyped(event.target.value)}
                    />
                    <TextField
                        label={t('settings.delete.password')}
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </div>
                <div className="d-flex flex-wrap justify-content-end gap-2 bg-body-tertiary px-4 py-3 rounded-bottom">
                    <Button variant="secondary" onClick={close}>
                        {t('settings.delete.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        variant="danger"
                        icon="bi-trash3"
                        disabled={!confirmed || deleting}
                    >
                        {deleting ? t('settings.delete.deleting') : t('settings.delete.confirm')}
                    </Button>
                </div>
            </form>
        </dialog>
    );
}
