import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    // Where the bar sits relative to the cards: decides the spacing and which way the menu opens.
    position?: 'top' | 'bottom';
}

interface Gap {
    from: number;
    to: number;
}

type PageItem = number | Gap;

// First, last and the pages around the current one. Pages in between are grouped in a gap,
// which the user can open to pick any of the hidden pages.
function buildItems(page: number, totalPages: number): PageItem[] {
    const shown = new Set([1, totalPages, page - 1, page, page + 1]);
    const numbers = [...shown].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);

    const items: PageItem[] = [];
    numbers.forEach((current, index) => {
        const previous = numbers[index - 1];
        if (previous !== undefined) {
            const missing = current - previous - 1;
            if (missing === 1) items.push(previous + 1);
            else if (missing > 1) items.push({ from: previous + 1, to: current - 1 });
        }
        items.push(current);
    });
    return items;
}

interface GapDropdownProps extends Gap {
    onPageChange: (page: number) => void;
    opensUp: boolean;
}

// The "..." button. Opens a small menu, upwards for the bar below the cards, downwards for the top bar.
function GapDropdown({ from, to, onPageChange, opensUp }: GapDropdownProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLLIElement>(null);
    const menuId = useId();

    useEffect(() => {
        if (!open) return undefined;
        const onPointerDown = (event: MouseEvent) => {
            if (!ref.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const pages = Array.from({ length: to - from + 1 }, (_, index) => from + index);

    return (
        <li ref={ref} className={`page-item dropdown ${opensUp ? 'dropup' : ''}`}>
            <button
                type="button"
                className="page-link"
                aria-haspopup="true"
                aria-expanded={open}
                aria-controls={menuId}
                aria-label={t('pagination.pickPage', { from, to })}
                onClick={() => setOpen((current) => !current)}
            >
                …
            </button>
            {open && (
                <ul
                    id={menuId}
                    className="dropdown-menu show page-gap-menu"
                    data-bs-popper="static"
                >
                    {pages.map((number) => (
                        <li key={number}>
                            <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => {
                                    setOpen(false);
                                    onPageChange(number);
                                }}
                            >
                                {t('pagination.page', { number })}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
}

export default function Pagination({
    page,
    totalPages,
    onPageChange,
    position = 'bottom',
}: PaginationProps) {
    const { t } = useTranslation();
    if (totalPages <= 1) return null;
    return (
        <nav
            aria-label={position === 'top' ? t('pagination.above') : t('pagination.below')}
            className={position === 'top' ? '' : 'mt-4'}
        >
            <ul className="pagination justify-content-end flex-wrap mb-0">
                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                    <button
                        type="button"
                        className="page-link"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                    >
                        <i className="bi bi-chevron-left" aria-hidden="true" />{' '}
                        {t('pagination.previous')}
                    </button>
                </li>
                {buildItems(page, totalPages).map((item) =>
                    typeof item === 'number' ? (
                        <li key={item} className={`page-item ${item === page ? 'active' : ''}`}>
                            <button
                                type="button"
                                className="page-link"
                                aria-current={item === page ? 'page' : undefined}
                                aria-label={t('pagination.page', { number: item })}
                                onClick={() => onPageChange(item)}
                            >
                                {item}
                            </button>
                        </li>
                    ) : (
                        <GapDropdown
                            key={`gap-${item.from}`}
                            from={item.from}
                            to={item.to}
                            onPageChange={onPageChange}
                            opensUp={position === 'bottom'}
                        />
                    ),
                )}
                <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                    <button
                        type="button"
                        className="page-link"
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                    >
                        {t('pagination.next')}{' '}
                        <i className="bi bi-chevron-right" aria-hidden="true" />
                    </button>
                </li>
            </ul>
        </nav>
    );
}
