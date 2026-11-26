import { useEffect, useId, useRef, useState } from 'react';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import type { LinkedTeacher } from '../types/api.ts';
import Alert from './Alert.tsx';
import Button from './Button.tsx';
import Skeleton from './Skeleton.tsx';
import { useTranslation } from 'react-i18next';

interface MyTeachersDialogProps {
    open: boolean;
    onClose: () => void;
}

// The teachers who are linked to the logged in student and what they can see. Teachers link
// themselves, so the student only looks here. A native <dialog>, on top of the settings panel.
export default function MyTeachersDialog({ open, onClose }: MyTeachersDialogProps) {
    const { t } = useTranslation();
    const { token } = useAuth();
    const ref = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const [teachers, setTeachers] = useState<LinkedTeacher[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0); // raised by the retry button

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    // Fresh data every time the dialog opens.
    useEffect(() => {
        if (!open) return undefined;
        let cancelled = false;
        apiFetch<{ teachers: LinkedTeacher[] }>('/teachers', { token })
            .then((data) => {
                if (!cancelled) setTeachers(data.teachers);
            })
            .catch((err: unknown) => {
                if (!cancelled) setError(errorMessage(err));
            });
        return () => {
            cancelled = true;
        };
    }, [open, token, reloadKey]);

    function retry() {
        setError(null);
        setReloadKey((key) => key + 1);
    }

    return (
        <dialog
            ref={ref}
            aria-labelledby={titleId}
            className="dialog teachers-dialog"
            onCancel={(event) => {
                // React passes the event on to the settings panel around this dialog, which
                // would close as well. Escape only closes this dialog.
                event.preventDefault();
                event.stopPropagation();
                onClose();
            }}
        >
            <div className="p-4">
                <h2 id={titleId} className="h4 mb-2">
                    <i className="bi bi-mortarboard me-2" aria-hidden="true" />
                    {t('teachers.title')}
                </h2>
                <p className="text-body-secondary">{t('teachers.intro')}</p>

                {error && <Alert onRetry={retry}>{error}</Alert>}
                {!teachers && !error && <Skeleton lines={2} label={t('teachers.loading')} />}
                {teachers?.length === 0 && (
                    <p className="teachers-empty mb-0">
                        <i className="bi bi-info-circle me-2" aria-hidden="true" />
                        {t('teachers.none')}
                    </p>
                )}
                {teachers && teachers.length > 0 && (
                    <>
                        <ul className="list-group mb-3">
                            {teachers.map((teacher) => (
                                <li
                                    key={teacher.id}
                                    className="list-group-item d-flex align-items-center gap-3"
                                >
                                    <i
                                        className="bi bi-person-badge fs-4 text-body-secondary"
                                        aria-hidden="true"
                                    />
                                    <span className="min-w-0">
                                        <strong className="d-block text-truncate">
                                            {teacher.name}
                                        </strong>
                                        <a
                                            href={`mailto:${teacher.email}`}
                                            className="small text-break"
                                            aria-label={t('teachers.contact', {
                                                name: teacher.name,
                                            })}
                                        >
                                            {teacher.email}
                                        </a>
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p className="small text-body-secondary mb-0">{t('teachers.question')}</p>
                    </>
                )}
            </div>
            <div className="d-flex justify-content-end bg-body-tertiary px-4 py-3 rounded-bottom">
                <Button variant="secondary" onClick={onClose}>
                    {t('teachers.close')}
                </Button>
            </div>
        </dialog>
    );
}
