import { useState, type ReactNode } from 'react';
import { typeLabel } from '../i18n/labels.ts';
import { DEFAULT_TYPE_STYLE, TYPE_STYLES } from '../constants/typeStyles.ts';
import type { Book } from '../types/api.ts';
import { useTranslation } from 'react-i18next';

const LONG_DESCRIPTION = 180;

interface BookCardProps {
    book: Book;
    motivation?: string; // only set on the advice page ("why this fits you")
    children?: ReactNode; // slot for actions, such as the add to reading list button
}

// One catalog item. Renders its own grid column, so wrap cards in <BookGrid>.
export default function BookCard({ book, motivation, children }: BookCardProps) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const style = TYPE_STYLES[book.type] ?? DEFAULT_TYPE_STYLE;
    const description = book.description ?? '';
    const isLong = description.length > LONG_DESCRIPTION;

    return (
        <div className="col">
            <article
                className={`card book-card h-100 shadow-sm border-start border-${style.accent}`}
            >
                <div className="card-body d-flex flex-column pb-2">
                    <p className={`eyebrow text-${style.accent}-emphasis mb-2`}>
                        <i className={`bi ${style.icon} me-1`} aria-hidden="true" />
                        {typeLabel(book.type)}
                        {book.genre && ` · ${book.genre}`}
                    </p>

                    <h2 className="book-title h5 card-title">{book.title}</h2>
                    {book.author && <p className="author mb-3">{book.author}</p>}

                    {book.levelLabel && (
                        <p className="mb-3">
                            <span className="badge rounded-pill bg-body-secondary text-body-emphasis fw-medium">
                                <i className="bi bi-bar-chart-fill me-1" aria-hidden="true" />
                                {t('book.level', { level: book.levelLabel })}
                            </span>
                        </p>
                    )}

                    {description && (
                        <div className="mb-3">
                            <p className={`mb-1 ${expanded ? '' : 'line-clamp'}`}>{description}</p>
                            {isLong && (
                                <button
                                    type="button"
                                    className="btn btn-link btn-sm p-0"
                                    aria-expanded={expanded}
                                    onClick={() => setExpanded((current) => !current)}
                                >
                                    {expanded ? t('book.showLess') : t('book.readMore')}
                                    <span className="visually-hidden">
                                        {t('book.about', { title: book.title })}
                                    </span>
                                </button>
                            )}
                        </div>
                    )}

                    {motivation && (
                        <div className="motivation p-3 mb-3">
                            <h3 className="h6 mb-1">
                                <i className="bi bi-stars me-2" aria-hidden="true" />
                                {t('book.whyFits')}
                            </h3>
                            <p className="mb-0">{motivation}</p>
                        </div>
                    )}

                    {book.themes.length > 0 && (
                        <ul
                            className="list-unstyled d-flex flex-wrap gap-1 mb-3"
                            aria-label={t('book.themes')}
                        >
                            {book.themes.map((theme) => (
                                <li key={theme}>
                                    <span className="chip">{theme}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {book.url && (
                        <p className="mb-3">
                            <a href={book.url} target="_blank" rel="noreferrer">
                                {t('book.readOnline')}
                                <i className="bi bi-box-arrow-up-right ms-1" aria-hidden="true" />
                                <span className="visually-hidden">
                                    {' '}
                                    {t('book.opensInNewTab', { title: book.title })}
                                </span>
                            </a>
                        </p>
                    )}

                    <div className="mt-auto" />
                </div>
                {children && (
                    <div className="card-footer bg-transparent border-top py-3">
                        <div className="card-actions">{children}</div>
                    </div>
                )}
            </article>
        </div>
    );
}
