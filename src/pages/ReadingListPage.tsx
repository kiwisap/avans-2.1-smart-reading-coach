import { Link } from 'react-router-dom';
import Alert from '../components/Alert.tsx';
import BookCard from '../components/BookCard.tsx';
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
            <label className="choice">
                <input
                    type="checkbox"
                    checked={isRead}
                    onChange={() => onToggle(item.id, isRead ? 'unread' : 'read')}
                />
                <span>
                    I have read <span className="visually-hidden">{title}</span>
                    <span aria-hidden="true">this</span>
                </span>
            </label>
            <Button
                variant="secondary"
                aria-label={`Remove ${title} from your reading list`}
                onClick={() => onRemove(item)}
            >
                Remove
            </Button>
        </>
    );
}

export default function ReadingListPage() {
    const { items, error, notice, setStatus, remove } = useReadingList();
    const readCount = items?.filter((item) => item.status === 'read').length ?? 0;

    return (
        <section>
            <h1>My reading list</h1>

            {error && <Alert>{error}</Alert>}
            {notice && <Alert type="success">{notice}</Alert>}

            {!items && !error && <Skeleton lines={6} label="Loading your reading list" />}

            {items?.length === 0 && (
                <p>
                    Your reading list is empty. Add titles from the{' '}
                    <Link to="/catalog">catalog</Link> or from your{' '}
                    <Link to="/advice">reading advice</Link>.
                </p>
            )}

            {items && items.length > 0 && (
                <>
                    <p role="status">
                        {items.length} titles, {readCount} read.
                    </p>
                    <div className="book-grid">
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
                                <article key={item.id} className="book-card">
                                    <h2>Title no longer available</h2>
                                    <p>This title was removed from the catalog.</p>
                                    <div className="card-actions">
                                        <Button variant="secondary" onClick={() => remove(item)}>
                                            Remove
                                        </Button>
                                    </div>
                                </article>
                            ),
                        )}
                    </div>
                </>
            )}
        </section>
    );
}
