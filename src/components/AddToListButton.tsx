import type { Book } from '../types/api.ts';
import Button from './Button.tsx';
import { useTranslation } from 'react-i18next';

interface AddToListButtonProps {
    book: Pick<Book, 'id' | 'title'>;
    onList: boolean;
    onAdd: (book: Pick<Book, 'id' | 'title'>) => void;
}

export default function AddToListButton({ book, onList, onAdd }: AddToListButtonProps) {
    const { t } = useTranslation();
    if (onList) {
        return (
            <span className="status-chip is-success">
                <i className="bi bi-bookmark-check-fill" aria-hidden="true" />
                {t('readingList.onList')}
            </span>
        );
    }
    return (
        <Button
            variant="secondary"
            icon="bi-bookmark-plus"
            aria-label={t('readingList.addLabel', { title: book.title })}
            onClick={() => onAdd(book)}
        >
            {t('readingList.add')}
        </Button>
    );
}
