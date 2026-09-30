import { Link } from 'react-router-dom';
import Alert from '../components/Alert.tsx';
import BookCard from '../components/BookCard.tsx';
import BookGrid from '../components/BookGrid.tsx';
import MissingBookCard from '../components/MissingBookCard.tsx';
import Button from '../components/Button.tsx';
import Skeleton from '../components/Skeleton.tsx';
import StatusBadge from '../components/StatusBadge.tsx';
import { useReadingList } from '../hooks/useReadingList.ts';
import type { ReadingListItem, ReadingStatus } from '../types/api.ts';

interface ItemActionsProps {
    item: ReadingListItem;
    title: string;
    onToggle: (id: string, status: ReadingStatus) => void;
    onRemove: (item: ReadingListItem) => void;
}

function ItemActions({ item, title, onToggle, onRemove }: ItemActionsProps) {
    const isRead = item.status === 'read';
    return (
        <>
            <StatusBadge status={item.status} />
            <div className="form-check mb-0">
                <input
                    id={`read-${item.id}`}
                    className="form-check-input"
                    type="checkbox"
                    checked={isRead}
                    onChange={() => onToggle(item.id, isRead ? 'unread' : 'read')}
                />
                <label htmlFor={`read-${item.id}`} className="form-check-label">
                    Ik heb <span className="visually-hidden">{title}</span>
                    <span aria-hidden="true">dit</span> gelezen
                </label>
            </div>
            <Button
                variant="secondary"
                size="sm"
                icon="bi-trash"
                aria-label={`Verwijder ${title} van je leeslijst`}
                onClick={() => onRemove(item)}
            >
                Verwijderen
            </Button>
        </>
    );
}

export default function ReadingListPage() {
    const { items, error, notice, setStatus, remove } = useReadingList();
    const readCount = items?.filter((item) => item.status === 'read').length ?? 0;

    const progress = items && items.length > 0 ? Math.round((readCount / items.length) * 100) : 0;

    return (
        <section>
            <header className="mb-4">
                <h1 className="page-title">
                    <i className="bi bi-bookmarks me-2" aria-hidden="true" />
                    Mijn leeslijst
                </h1>
            </header>

            {error && <Alert>{error}</Alert>}
            {notice && <Alert type="success">{notice}</Alert>}

            {!items && !error && <Skeleton variant="cards" lines={3} label="Leeslijst laden" />}

            {items?.length === 0 && (
                <div className="text-center py-5">
                    <i
                        className="bi bi-bookmark-heart display-4 text-body-secondary"
                        aria-hidden="true"
                    />
                    <h2 className="h4 mt-3">Je leeslijst is leeg</h2>
                    <p className="text-body-secondary">
                        Voeg titels toe vanuit de <Link to="/">catalogus</Link> of vanuit je{' '}
                        <Link to="/advice">leesadvies</Link>.
                    </p>
                </div>
            )}

            {items && items.length > 0 && (
                <>
                    <div className="card shadow-sm mb-4">
                        <div className="card-body">
                            <p role="status" className="fw-semibold mb-2">
                                {readCount} van {items.length} titels gelezen
                            </p>
                            <div
                                className="progress"
                                role="progressbar"
                                aria-label="Leesvoortgang"
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
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => remove(item)}
                                    >
                                        Verwijderen
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
