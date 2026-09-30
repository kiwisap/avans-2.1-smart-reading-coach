import type { Book } from '../types/api.ts';
import Button from './Button.tsx';

interface AddToListButtonProps {
    book: Pick<Book, 'id' | 'title'>;
    onList: boolean;
    onAdd: (book: Pick<Book, 'id' | 'title'>) => void;
}

export default function AddToListButton({ book, onList, onAdd }: AddToListButtonProps) {
    if (onList) {
        return <p className="on-list">✓ On your reading list</p>;
    }
    return (
        <Button
            variant="secondary"
            aria-label={`Add ${book.title} to your reading list`}
            onClick={() => onAdd(book)}
        >
            Add to reading list
        </Button>
    );
}
