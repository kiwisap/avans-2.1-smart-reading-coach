import type { Book } from '../types/api.ts';
import Button from './Button.tsx';

interface AddToListButtonProps {
    book: Pick<Book, 'id' | 'title'>;
    onList: boolean;
    onAdd: (book: Pick<Book, 'id' | 'title'>) => void;
}

export default function AddToListButton({ book, onList, onAdd }: AddToListButtonProps) {
    if (onList) {
        return (
            <span className="status-chip is-success">
                <i className="bi bi-bookmark-check-fill" aria-hidden="true" />
                Op je leeslijst
            </span>
        );
    }
    return (
        <Button
            variant="secondary"
            icon="bi-bookmark-plus"
            aria-label={`Voeg ${book.title} toe aan je leeslijst`}
            onClick={() => onAdd(book)}
        >
            Toevoegen
        </Button>
    );
}
