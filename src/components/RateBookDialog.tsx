import { useEffect, useId, useRef, useState, type SubmitEvent } from 'react';
import type { ReadingListItem } from '../types/api.ts';
import Alert from './Alert.tsx';
import BoSays from './BoSays.tsx';
import Button from './Button.tsx';
import XpHint from './XpHint.tsx';
import { useTranslation } from 'react-i18next';

const MAX_STARS = 5;
const MAX_COMMENT = 280;
const WORDS = [
    'rating.word.1',
    'rating.word.2',
    'rating.word.3',
    'rating.word.4',
    'rating.word.5',
] as const;

interface RateBookDialogProps {
    item: ReadingListItem;
    open: boolean;
    xp: number | undefined; // XP for rating, shown as a hint
    onClose: () => void;
    // Returns an error message, or null when it was saved.
    onSave: (item: ReadingListItem, rating: number, comment: string) => Promise<string | null>;
}

// Bo asks what the student thought of a title they just read: stars and, if they like, a few
// words. The answer helps the advice, also for students with a similar profile.
// The parent mounts it again (with a key) for every title, so the fields start fresh.
export default function RateBookDialog({ item, open, xp, onClose, onSave }: RateBookDialogProps) {
    const { t } = useTranslation();
    const ref = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const commentId = useId();
    const [rating, setRating] = useState(item.rating ?? 0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState(item.comment ?? '');
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const title = item.book?.title ?? t('book.fallbackTitle');
    const shown = hover || rating;

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (rating === 0) return;
        setSaving(true);
        setError(null);
        const failed = await onSave(item, rating, comment);
        setSaving(false);
        if (failed) setError(failed);
        else onClose();
    }

    return (
        <dialog
            ref={ref}
            aria-labelledby={titleId}
            className="dialog rate-dialog"
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
        >
            <form onSubmit={handleSubmit}>
                <div className="p-4">
                    <h2 id={titleId} className="visually-hidden">
                        {t('rating.title', { title })}
                    </h2>
                    <BoSays mood="party" size={72} className="bo-says-sm mb-3">
                        <p className="mb-0">
                            {item.rating
                                ? t('rating.boAgain', { title })
                                : t('rating.boAsk', { title })}
                        </p>
                    </BoSays>

                    {error && <Alert>{error}</Alert>}

                    <fieldset className="mb-3">
                        <legend className="form-label fw-semibold fs-6">
                            {t('rating.starsLegend')}
                        </legend>
                        <div className="star-input" onMouseLeave={() => setHover(0)}>
                            {Array.from({ length: MAX_STARS }, (_, index) => {
                                const value = index + 1;
                                return (
                                    <label
                                        key={value}
                                        className={value <= shown ? 'is-on' : ''}
                                        onMouseEnter={() => setHover(value)}
                                    >
                                        <input
                                            type="radio"
                                            name="rating"
                                            className="visually-hidden"
                                            value={value}
                                            checked={rating === value}
                                            onChange={() => setRating(value)}
                                        />
                                        <i
                                            className={`bi ${value <= shown ? 'bi-star-fill' : 'bi-star'}`}
                                            aria-hidden="true"
                                        />
                                        <span className="visually-hidden">
                                            {t('rating.stars', { count: value, max: MAX_STARS })}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        <p className="small text-body-secondary mb-0 mt-1" aria-live="polite">
                            {shown > 0 ? t(WORDS[shown - 1] ?? WORDS[0]) : '\u00a0'}
                        </p>
                    </fieldset>

                    <label htmlFor={commentId} className="form-label fw-semibold">
                        {t('rating.commentLabel')}
                    </label>
                    <textarea
                        id={commentId}
                        className="form-control"
                        rows={3}
                        maxLength={MAX_COMMENT}
                        placeholder={t('rating.commentPlaceholder')}
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                    />
                    <p className="form-text mb-0">
                        {t('rating.commentHint', { left: MAX_COMMENT - comment.length })}
                    </p>
                </div>
                <div className="d-flex flex-wrap align-items-center justify-content-end gap-2 bg-body-tertiary px-4 py-3 rounded-bottom">
                    <Button variant="secondary" onClick={onClose}>
                        {t('rating.skip')}
                    </Button>
                    <Button type="submit" icon="bi-send" disabled={rating === 0 || saving}>
                        {saving ? t('rating.saving') : t('rating.save')}
                    </Button>
                    {!item.rating && <XpHint xp={xp} />}
                </div>
            </form>
        </dialog>
    );
}
