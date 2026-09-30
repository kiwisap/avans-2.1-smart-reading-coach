import type { ReadingStatus } from '../types/api.ts';

// Read status, shown as text and a check mark so it does not rely on colour alone.
export default function StatusBadge({ status }: { status: ReadingStatus }) {
    const isRead = status === 'read';
    return (
        <p className={isRead ? 'badge badge-read' : 'badge'}>
            {isRead ? '✓ Read' : 'Not read yet'}
        </p>
    );
}
