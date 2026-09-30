interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

// First, last and the pages around the current one, with ellipses in between.
function visiblePages(page: number, totalPages: number): (number | 'gap-start' | 'gap-end')[] {
    const pages: (number | 'gap-start' | 'gap-end')[] = [];
    for (let current = 1; current <= totalPages; current += 1) {
        if (current === 1 || current === totalPages || Math.abs(current - page) <= 1) {
            pages.push(current);
        } else if (pages[pages.length - 1] !== 'gap-start' && current < page) {
            pages.push('gap-start');
        } else if (pages[pages.length - 1] !== 'gap-end' && current > page) {
            pages.push('gap-end');
        }
    }
    return pages;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;
    return (
        <nav aria-label="Paginering" className="mt-5">
            <ul className="pagination justify-content-center flex-wrap">
                <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                    <button
                        type="button"
                        className="page-link"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                    >
                        <i className="bi bi-chevron-left" aria-hidden="true" /> Vorige
                    </button>
                </li>
                {visiblePages(page, totalPages).map((item) =>
                    typeof item === 'string' ? (
                        <li key={item} className="page-item disabled" aria-hidden="true">
                            <span className="page-link">…</span>
                        </li>
                    ) : (
                        <li key={item} className={`page-item ${item === page ? 'active' : ''}`}>
                            <button
                                type="button"
                                className="page-link"
                                aria-current={item === page ? 'page' : undefined}
                                aria-label={`Pagina ${item}`}
                                onClick={() => onPageChange(item)}
                            >
                                {item}
                            </button>
                        </li>
                    ),
                )}
                <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                    <button
                        type="button"
                        className="page-link"
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                    >
                        Volgende <i className="bi bi-chevron-right" aria-hidden="true" />
                    </button>
                </li>
            </ul>
        </nav>
    );
}
