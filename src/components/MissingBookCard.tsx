import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// Shown when a title was removed from the catalog after it was put on a reading list.
export default function MissingBookCard({ children }: { children?: ReactNode }) {
    const { t } = useTranslation();
    return (
        <div className="col">
            <article className="card book-card h-100 border-start border-secondary shadow-sm">
                <div className="card-body">
                    <h2 className="h5 card-title">
                        <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />
                        {t('book.missingTitle')}
                    </h2>
                    <p className="text-body-secondary mb-0">{t('book.missingText')}</p>
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
