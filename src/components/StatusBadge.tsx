import type { ReadingStatus } from '../types/api.ts';

// Read status, shown as text and an icon so it does not rely on colour alone.
export default function StatusBadge({ status }: { status: ReadingStatus }) {
    const isRead = status === 'read';
    return (
        <span
            className={`badge rounded-pill border ${
                isRead
                    ? 'bg-success-subtle text-success-emphasis border-success-subtle'
                    : 'bg-body-secondary text-body-emphasis'
            }`}
        >
            <i
                className={`bi ${isRead ? 'bi-check-circle-fill' : 'bi-circle'} me-1`}
                aria-hidden="true"
            />
            {isRead ? 'Gelezen' : 'Nog niet gelezen'}
        </span>
    );
}
