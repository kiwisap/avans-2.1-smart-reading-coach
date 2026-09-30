import type { ReactNode } from 'react';

// Shown when a title was removed from the catalog after it was put on a reading list.
export default function MissingBookCard({ children }: { children?: ReactNode }) {
    return (
        <div className="col">
            <article className="card book-card h-100 border-start border-secondary shadow-sm">
                <div className="card-body">
                    <h2 className="h5 card-title">
                        <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
                        Titel niet meer beschikbaar
                    </h2>
                    <p className="text-body-secondary mb-0">
                        Deze titel is uit de catalogus verwijderd.
                    </p>
                </div>
                {children && (
                    <div className="card-footer bg-transparent border-top-0 pb-3">
                        <div className="d-flex flex-wrap align-items-center gap-2">{children}</div>
                    </div>
                )}
            </article>
        </div>
    );
}
