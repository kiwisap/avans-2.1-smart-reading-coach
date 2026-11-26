import { useState } from 'react';
import { Link } from 'react-router-dom';
import Alert from '../components/Alert.tsx';
import BookCard from '../components/BookCard.tsx';
import BookGrid from '../components/BookGrid.tsx';
import MissingBookCard from '../components/MissingBookCard.tsx';
import Button from '../components/Button.tsx';
import RateBookDialog from '../components/RateBookDialog.tsx';
import Skeleton from '../components/Skeleton.tsx';
import SourceChip from '../components/SourceChip.tsx';
import Stars from '../components/Stars.tsx';
import XpHint from '../components/XpHint.tsx';
import { useProgress } from '../game/ProgressContext.tsx';
import { useReadingList } from '../hooks/useReadingList.ts';
import type { ReadingListItem, ReadingStatus } from '../types/api.ts';
import { Trans, useTranslation } from 'react-i18next';

interface ItemActionsProps {
    item: ReadingListItem;
    title: string;
    readXp: number | undefined;
    onToggle: (item: ReadingListItem, status: ReadingStatus) => void;
    onRate: (item: ReadingListItem) => void;
    onRemove: (item: ReadingListItem) => void;
}

function ItemActions({ item, title, readXp, onToggle, onRate, onRemove }: ItemActionsProps) {
    const { t } = useTranslation();
    const isRead = item.status === 'read';
    return (
        <div className="w-100">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <SourceChip source={item.source} audience="student" />
                {isRead && item.rating && <Stars rating={item.rating} />}
            </div>
            {isRead && item.comment && <p className="item-comment small mb-2">{item.comment}</p>}
            <div className="d-flex flex-wrap align-items-center gap-2">
                <Button
                    variant={isRead ? 'success' : 'secondary'}
                    icon={isRead ? 'bi-check-circle-fill' : 'bi-circle'}
                    aria-pressed={isRead}
                    onClick={() => onToggle(item, isRead ? 'unread' : 'read')}
                >
                    {t('readingList.markRead')}
                    <span className="visually-hidden"> {title}</span>
                </Button>
                {!isRead && <XpHint xp={readXp} />}
                {isRead && (
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={item.rating ? 'bi-pencil' : 'bi-star'}
                        aria-label={t(item.rating ? 'rating.changeLabel' : 'rating.rateLabel', {
                            title,
                        })}
                        onClick={() => onRate(item)}
                    >
                        {item.rating ? t('rating.change') : t('rating.rate')}
                    </Button>
                )}
                <Button
                    variant="outline-danger"
                    icon="bi-trash"
                    className="ms-auto"
                    aria-label={t('readingList.removeLabel', { title })}
                    onClick={() => onRemove(item)}
                >
                    {t('readingList.remove')}
                </Button>
            </div>
        </div>
    );
}

export default function ReadingListPage() {
    const { t } = useTranslation();
    const { items, error, notice, setStatus, rate, remove } = useReadingList();
    const { progress } = useProgress();
    // The title Bo asks about. Kept after closing, so the dialog can close and give the focus back.
    const [rateTarget, setRateTarget] = useState<ReadingListItem | null>(null);
    const [rateOpen, setRateOpen] = useState(false);
    const [rateKey, setRateKey] = useState(0); // a new key gives the dialog fresh fields

    const readCount = items?.filter((item) => item.status === 'read').length ?? 0;
    const percent = items && items.length > 0 ? Math.round((readCount / items.length) * 100) : 0;

    function askRating(item: ReadingListItem) {
        setRateTarget(item);
        setRateKey((key) => key + 1);
        setRateOpen(true);
    }

    async function toggle(item: ReadingListItem, status: ReadingStatus) {
        const updated = await setStatus(item.id, status);
        // Just read and not rated yet: Bo asks what the student thought of it.
        if (updated && status === 'read' && !updated.rating && updated.book) askRating(updated);
    }

    return (
        <section>
            <header className="mb-4">
                <h1 className="page-title">
                    <i className="bi bi-bookmarks me-2" aria-hidden="true" />
                    {t('readingList.title')}
                </h1>
            </header>

            {error && <Alert>{error}</Alert>}
            {notice && <Alert type="success">{notice}</Alert>}

            {!items && !error && (
                <Skeleton variant="cards" lines={3} label={t('readingList.loading')} />
            )}

            {items?.length === 0 && (
                <div className="text-center py-5">
                    <i
                        className="bi bi-bookmark-heart display-4 text-body-secondary"
                        aria-hidden="true"
                    />
                    <h2 className="h4 mt-3">{t('readingList.emptyTitle')}</h2>
                    <p className="text-body-secondary">
                        <Trans
                            i18nKey="readingList.emptyHint"
                            components={{ catalog: <Link to="/" />, advice: <Link to="/advice" /> }}
                        />
                    </p>
                </div>
            )}

            {items && items.length > 0 && (
                <>
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <p role="status" className="fw-semibold mb-2">
                                {t('readingList.progress', {
                                    read: readCount,
                                    total: items.length,
                                })}
                            </p>
                            <div
                                className="progress"
                                role="progressbar"
                                aria-label={t('readingList.progressLabel')}
                                aria-valuenow={percent}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            >
                                <div
                                    className="progress-bar bg-success"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            {progress && (
                                <p className="small text-body-secondary mb-0 mt-2">
                                    {t('readingList.xpTip', {
                                        read: progress.rewards.read,
                                        rated: progress.rewards.rated,
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                    <BookGrid>
                        {items.map((item) =>
                            item.book ? (
                                <BookCard key={item.id} book={item.book}>
                                    <ItemActions
                                        item={item}
                                        title={item.book.title}
                                        readXp={progress?.rewards.read}
                                        onToggle={toggle}
                                        onRate={askRating}
                                        onRemove={remove}
                                    />
                                </BookCard>
                            ) : (
                                <MissingBookCard key={item.id}>
                                    <Button
                                        variant="outline-danger"
                                        icon="bi-trash"
                                        onClick={() => remove(item)}
                                    >
                                        {t('readingList.remove')}
                                    </Button>
                                </MissingBookCard>
                            ),
                        )}
                    </BookGrid>
                </>
            )}

            {rateTarget && (
                <RateBookDialog
                    key={rateKey}
                    item={rateTarget}
                    open={rateOpen}
                    xp={progress?.rewards.rated}
                    onClose={() => setRateOpen(false)}
                    onSave={rate}
                />
            )}
        </section>
    );
}
