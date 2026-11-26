import type { ReadingListSource } from '../types/api.ts';
import { useTranslation } from 'react-i18next';

const ICONS: Record<ReadingListSource, string> = {
    advice: 'bi-stars',
    catalog: 'bi-collection',
    teacher: 'bi-mortarboard',
};

interface SourceChipProps {
    source: ReadingListSource | null;
    // Students only see where a tip came from (Bo or a teacher), teachers see every source.
    audience: 'student' | 'teacher';
}

// Where a title on the reading list came from.
export default function SourceChip({ source, audience }: SourceChipProps) {
    const { t } = useTranslation();
    if (!source) return null;
    if (audience === 'student' && source === 'catalog') return null;
    return (
        <span className={`source-chip is-${source}`}>
            <i className={`bi ${ICONS[source]}`} aria-hidden="true" />
            {t(`source.${audience}.${source}`)}
        </span>
    );
}
