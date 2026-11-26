import { useProgress } from '../game/ProgressContext.tsx';
import type { Book } from '../types/api.ts';
import Button from './Button.tsx';
import XpHint from './XpHint.tsx';
import { useTranslation } from 'react-i18next';

interface AddToListButtonProps {
    book: Pick<Book, 'id' | 'title'>;
    onList: boolean;
    onAdd: (book: Pick<Book, 'id' | 'title'>) => void;
    // A tip of Bo earns a little more XP than a title from the catalog.
    source?: 'advice' | 'catalog';
}

export default function AddToListButton({
    book,
    onList,
    onAdd,
    source = 'catalog',
}: AddToListButtonProps) {
    const { t } = useTranslation();
    const { progress } = useProgress();
    if (onList) {
        return (
            <span className="status-chip is-success">
                <i className="bi bi-bookmark-check-fill" aria-hidden="true" />
                {t('readingList.onList')}
            </span>
        );
    }
    const rewards = progress?.rewards;
    return (
        <span className="d-inline-flex align-items-center gap-2">
            <Button
                variant="secondary"
                icon="bi-bookmark-plus"
                aria-label={t('readingList.addLabel', { title: book.title })}
                onClick={() => onAdd(book)}
            >
                {t('readingList.add')}
            </Button>
            <XpHint xp={source === 'advice' ? rewards?.addedFromAdvice : rewards?.added} />
        </span>
    );
}
