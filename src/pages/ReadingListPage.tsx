import { Link } from 'react-router-dom';
import Alert from '../components/Alert.tsx';
import BookCard from '../components/BookCard.tsx';
import BookGrid from '../components/BookGrid.tsx';
import MissingBookCard from '../components/MissingBookCard.tsx';
import Button from '../components/Button.tsx';
import Skeleton from '../components/Skeleton.tsx';
import { useReadingList } from '../hooks/useReadingList.ts';
import type { ReadingListItem, ReadingStatus } from '../types/api.ts';
import { Trans, useTranslation } from 'react-i18next';

interface ItemActionsProps {
    item: ReadingListItem;
    title: string;
    onToggle: (id: string, status: ReadingStatus) => void;
    onRemove: (item: ReadingListItem) => void;
}

function ItemActions({ item, title, onToggle, onRemove }: ItemActionsProps) {
    const { t } = useTranslation();
    const isRead = item.status === 'read';
    return (
        <>
            <Button
                variant={isRead ? 'success' : 'secondary'}
                icon={isRead ? 'bi-check-circle-fill' : 'bi-circle'}
                aria-pressed={isRead}
                onClick={() => onToggle(item.id, isRead ? 'unread' : 'read')}
            >
                {t('readingList.markRead')}
                <span className="visually-hidden"> {title}</span>
            </Button>
            <Button
                variant="outline-danger"
                icon="bi-trash"
                className="ms-auto"
                aria-label={t('readingList.removeLabel', { title })}
                onClick={() => onRemove(item)}
            >
                {t('readingList.remove')}
            </Button>
        </>
    );
}

export default function ReadingListPage() {
    const { t } = useTranslation();
    const { items, error, notice, setStatus, remove } = useReadingList();
    const readCount = items?.filter((item) => item.status === 'read').length ?? 0;

    const progress = items && items.length > 0 ? Math.round((readCount / items.length) * 100) : 0;

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
                                aria-valuenow={progress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            >
                                <div
                                    className="progress-bar bg-success"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    <BookGrid>
                        {items.map((item) =>
                            item.book ? (
                                <BookCard key={item.id} book={item.book}>
                                    <ItemActions
                                        item={item}
                                        title={item.book.title}
                                        onToggle={setStatus}
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
        </section>
    );
}
