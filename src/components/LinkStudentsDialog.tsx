import { useEffect, useId, useRef, useState } from 'react';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import type { StudentLink } from '../types/api.ts';
import Alert from './Alert.tsx';
import Button from './Button.tsx';
import TextField from './TextField.tsx';
import { useTranslation } from 'react-i18next';

interface LinkStudentsDialogProps {
    open: boolean;
    // changed is true when the teacher linked or unlinked at least one student.
    onClose: (changed: boolean) => void;
}

// The API needs at least this many characters and sends at most MAX_RESULTS students.
const MIN_LENGTH = 2;
const MAX_RESULTS = 20;
const DEBOUNCE_MS = 300;

// A teacher searches a student by name or email address and links themselves to them.
export default function LinkStudentsDialog({ open, onClose }: LinkStudentsDialogProps) {
    const { t } = useTranslation();
    const { token } = useAuth();
    const ref = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const resultsId = useId();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<StudentLink[] | null>(null);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [changed, setChanged] = useState(false);

    const trimmed = query.trim();

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    // Searches a moment after the teacher stops typing.
    useEffect(() => {
        if (!open || trimmed.length < MIN_LENGTH) return undefined;
        let cancelled = false;
        const timer = window.setTimeout(() => {
            apiFetch<{ students: StudentLink[] }>(
                `/students/search?search=${encodeURIComponent(trimmed)}`,
                { token },
            )
                .then((data) => {
                    if (cancelled) return;
                    setResults(data.students);
                    setSearching(false);
                })
                .catch((err: unknown) => {
                    if (cancelled) return;
                    setError(errorMessage(err));
                    setSearching(false);
                });
        }, DEBOUNCE_MS);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [open, trimmed, token]);

    function handleQuery(value: string) {
        setQuery(value);
        setError(null);
        setNotice(null);
        if (value.trim().length < MIN_LENGTH) {
            setResults(null);
            setSearching(false);
        } else {
            setSearching(true);
        }
    }

    async function toggle(student: StudentLink) {
        setBusyId(student.id);
        setError(null);
        setNotice(null);
        try {
            const { student: updated } = await apiFetch<{ student: StudentLink }>(
                `/students/${student.id}/link`,
                { method: student.linked ? 'DELETE' : 'PUT', token },
            );
            setResults((current) =>
                (current ?? []).map((item) => (item.id === updated.id ? updated : item)),
            );
            setChanged(true);
            setNotice(
                updated.linked
                    ? t('students.link.nowLinked', { name: updated.name })
                    : t('students.link.nowUnlinked', { name: updated.name }),
            );
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setBusyId(null);
        }
    }

    function close() {
        const didChange = changed;
        setQuery('');
        setResults(null);
        setSearching(false);
        setError(null);
        setNotice(null);
        setChanged(false);
        onClose(didChange);
    }

    return (
        <dialog
            ref={ref}
            aria-labelledby={titleId}
            className="dialog link-dialog"
            onCancel={(event) => {
                event.preventDefault();
                close();
            }}
        >
            <div className="p-4">
                <h2 id={titleId} className="h4 mb-2">
                    <i className="bi bi-person-plus me-2" aria-hidden="true" />
                    {t('students.link.title')}
                </h2>
                <p className="text-body-secondary">{t('students.link.intro')}</p>

                <form role="search" onSubmit={(event) => event.preventDefault()}>
                    <TextField
                        label={t('students.link.search')}
                        type="search"
                        autoComplete="off"
                        spellCheck={false}
                        maxLength={100}
                        hint={t('students.link.searchHint', { min: MIN_LENGTH })}
                        aria-controls={resultsId}
                        value={query}
                        onChange={(event) => handleQuery(event.target.value)}
                    />
                </form>

                {error && <Alert>{error}</Alert>}
                {notice && <Alert type="success">{notice}</Alert>}

                <div id={resultsId} className="link-results" aria-busy={searching}>
                    {searching && (
                        <p className="small text-body-secondary mb-0" role="status">
                            {t('students.link.searching')}
                        </p>
                    )}
                    {!searching && results?.length === 0 && (
                        <p className="small mb-0" role="status">
                            {t('students.link.none', { query: trimmed })}
                        </p>
                    )}
                    {!searching && results && results.length > 0 && (
                        <>
                            <ul className="list-group" aria-label={t('students.link.results')}>
                                {results.map((student) => (
                                    <li
                                        key={student.id}
                                        className="list-group-item d-flex flex-wrap justify-content-between align-items-center gap-2"
                                    >
                                        <span className="min-w-0">
                                            <strong className="d-block text-truncate">
                                                {student.name}
                                                {student.linked && (
                                                    <span className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle ms-2">
                                                        {t('students.link.linked')}
                                                    </span>
                                                )}
                                            </strong>
                                            <span className="small text-body-secondary text-break">
                                                {student.email}
                                            </span>
                                        </span>
                                        <Button
                                            size="sm"
                                            variant={student.linked ? 'secondary' : 'primary'}
                                            disabled={busyId === student.id}
                                            aria-label={t(
                                                student.linked
                                                    ? 'students.link.unlinkLabel'
                                                    : 'students.link.linkLabel',
                                                { name: student.name },
                                            )}
                                            onClick={() => toggle(student)}
                                        >
                                            {student.linked
                                                ? t('students.link.unlink')
                                                : t('students.link.link')}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                            {results.length >= MAX_RESULTS && (
                                <p className="small text-body-secondary mt-2 mb-0">
                                    {t('students.link.limit', { max: MAX_RESULTS })}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="d-flex justify-content-end bg-body-tertiary px-4 py-3 rounded-bottom">
                <Button onClick={close}>{t('students.link.done')}</Button>
            </div>
        </dialog>
    );
}
