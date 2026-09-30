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
            <span className="text-success-emphasis fw-semibold">
                <i className="bi bi-bookmark-check-fill me-1" aria-hidden="true" />
                Op je leeslijst
            </span>
        );
    }
    return (
        <Button
            variant="secondary"
            size="sm"
            icon="bi-bookmark-plus"
            aria-label={`Voeg ${book.title} toe aan je leeslijst`}
            onClick={() => onAdd(book)}
        >
            Toevoegen
        </Button>
    );
}
