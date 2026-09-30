import type { ReactNode } from 'react';
import { TYPE_LABELS } from '../constants/labels.ts';
import type { Book } from '../types/api.ts';

interface BookCardProps {
    book: Book;
    motivation?: string; // only set on the advice page ("why this fits you")
    children?: ReactNode; // slot for actions, such as the add to reading list button
}

export default function BookCard({ book, motivation, children }: BookCardProps) {
    return (
        <article className="book-card">
            <p className="book-meta">
                {TYPE_LABELS[book.type] ?? book.type}
                {book.genre && ` · ${book.genre}`}
                {book.levelLabel && ` · Level ${book.levelLabel}`}
            </p>
            <h2>{book.title}</h2>
            {book.author && <p className="book-author">{book.author}</p>}
            {book.description && <p>{book.description}</p>}
            {motivation && (
                <div className="motivation">
                    <h3>Why this fits you</h3>
                    <p>{motivation}</p>
                </div>
            )}
            {book.themes.length > 0 && (
                <ul className="tags" aria-label="Themes">
                    {book.themes.map((theme) => (
                        <li key={theme}>{theme}</li>
                    ))}
                </ul>
            )}
            {book.url && (
                <a href={book.url} target="_blank" rel="noreferrer">
                    Read online (opens in a new tab)
                </a>
            )}
            {children && <div className="card-actions">{children}</div>}
        </article>
    );
}
