import type { ReadingStatus } from '../types/api.ts';
import { useTranslation } from 'react-i18next';

// Read status, shown as text and an icon so it does not rely on colour alone.
// Same look as the other status chips in card footers.
export default function StatusBadge({ status }: { status: ReadingStatus }) {
    const { t } = useTranslation();
    const isRead = status === 'read';
    return (
        <span className={`status-chip ${isRead ? 'is-success' : 'is-neutral'}`}>
            <i
                className={`bi ${isRead ? 'bi-check-circle-fill' : 'bi-circle'}`}
                aria-hidden="true"
            />
            {t(`status.${status}`)}
        </span>
    );
}
