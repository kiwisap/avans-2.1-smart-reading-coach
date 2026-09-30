import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import Alert from '../components/Alert.tsx';
import Button from '../components/Button.tsx';
import ConfirmDialog from '../components/ConfirmDialog.tsx';
import ProfileForm from '../components/ProfileForm.tsx';
import ProfileSummary from '../components/ProfileSummary.tsx';
import Skeleton from '../components/Skeleton.tsx';
import {
    EMPTY_PROFILE,
    clearDraft,
    loadDraft,
    sameProfile,
    saveDraft,
    toFormValues,
    toProfileInput,
    validateProfile,
    type ProfileErrors,
    type ProfileFormValues,
} from '../profile/profileDraft.ts';
import type { ProfileOptions, ReadingProfile } from '../types/api.ts';

interface Message {
    type: 'success' | 'error' | 'info';
    text: ReactNode;
}

export default function ProfilePage() {
    const { token, user } = useAuth();
    const userId = user?.id ?? '';
    const [options, setOptions] = useState<ProfileOptions | null>(null);
    const [saved, setSaved] = useState<ReadingProfile | null | undefined>(undefined); // undefined: loading, null: no profile yet
    const [editing, setEditing] = useState(false);
    const [values, setValues] = useState<ProfileFormValues>(EMPTY_PROFILE);
    const [errors, setErrors] = useState<ProfileErrors>({});
    const [submitCount, setSubmitCount] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            apiFetch<ProfileOptions>('/profile/options', { token }),
            apiFetch<{ profile: ReadingProfile | null }>('/profile/me', { token }),
        ])
            .then(([loadedOptions, { profile }]) => {
                if (cancelled) return;
                const draft = loadDraft(userId);
                const baseline = profile ? toFormValues(profile) : EMPTY_PROFILE;
                const hasUnsavedDraft = draft !== null && !sameProfile(draft, baseline);

                setOptions(loadedOptions);
                setSaved(profile);
                if (draft && hasUnsavedDraft) {
                    setValues(draft);
                    setEditing(true);
                    setMessage({
                        type: 'info',
                        text: 'We restored the changes you had not saved yet.',
                    });
                } else if (!profile) {
                    setValues(EMPTY_PROFILE);
                    setEditing(true);
                }
            })
            .catch((err: unknown) => {
                if (!cancelled) setMessage({ type: 'error', text: errorMessage(err) });
            });
        return () => {
            cancelled = true;
        };
    }, [token, userId]);

    const baseline = saved ? toFormValues(saved) : EMPTY_PROFILE;
    const dirty = editing && !sameProfile(values, baseline);

    // Keep a draft while editing, so leaving the page by accident loses nothing.
    useEffect(() => {
        if (editing && dirty) saveDraft(userId, values);
    }, [editing, dirty, values, userId]);

    // Browser warning when closing the tab with unsaved changes.
    useEffect(() => {
        if (!dirty) return undefined;
        const warn = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);

    function handleChange<K extends keyof ProfileFormValues>(
        field: K,
        value: ProfileFormValues[K],
    ) {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => {
            if (!current[field]) return current;
            const rest = { ...current };
            delete rest[field];
            return rest;
        });
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!options) return;
        const found = validateProfile(values, options.maxTopics);
        setErrors(found);
        setSubmitCount((count) => count + 1);
        if (Object.keys(found).length > 0) return;

        setSubmitting(true);
        setMessage(null);
        try {
            const { profile } = await apiFetch<{ profile: ReadingProfile }>('/profile/me', {
                method: 'PUT',
                token,
                body: toProfileInput(values),
            });
            clearDraft(userId);
            setSaved(profile);
            setEditing(false);
            setMessage({
                type: 'success',
                text: (
                    <>
                        Your reading profile has been saved.{' '}
                        <Link to="/advice">See your reading advice</Link>
                    </>
                ),
            });
        } catch (err) {
            setMessage({ type: 'error', text: errorMessage(err) });
        } finally {
            setSubmitting(false);
        }
    }

    function startEditing() {
        if (!saved) return;
        setValues(toFormValues(saved));
        setErrors({});
        setMessage(null);
        setEditing(true);
    }

    function discardChanges() {
        clearDraft(userId);
        setValues(baseline);
        setErrors({});
        setConfirmOpen(false);
        setEditing(false);
    }

    function handleCancel() {
        if (dirty) setConfirmOpen(true);
        else discardChanges();
    }

    if (saved === undefined && !message) {
        return (
            <section>
                <h1>My reading profile</h1>
                <Skeleton lines={5} label="Loading your profile" />
            </section>
        );
    }

    return (
        <section>
            <h1>My reading profile</h1>
            {message && <Alert type={message.type}>{message.text}</Alert>}

            {options && editing && (
                <ProfileForm
                    options={options}
                    values={values}
                    errors={errors}
                    submitCount={submitCount}
                    submitting={submitting}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={saved ? handleCancel : undefined}
                />
            )}

            {saved && !editing && (
                <>
                    <ProfileSummary profile={saved} />
                    <Button onClick={startEditing}>Edit profile</Button>
                </>
            )}

            <ConfirmDialog
                open={confirmOpen}
                title="Discard your changes?"
                confirmLabel="Discard changes"
                cancelLabel="Keep editing"
                onConfirm={discardChanges}
                onCancel={() => setConfirmOpen(false)}
            >
                <p>
                    You changed your profile but did not save it. If you continue, the changes are
                    lost.
                </p>
            </ConfirmDialog>
        </section>
    );
}
