import { useTranslation } from 'react-i18next';
interface SkeletonProps {
    lines?: number;
    label?: string;
    variant?: 'lines' | 'cards';
}

// Placeholders shown while data loads. Screen readers get a single "Loading" message.
export default function Skeleton({ lines = 3, label, variant = 'lines' }: SkeletonProps) {
    const { t } = useTranslation();
    return (
        <div role="status" aria-busy="true">
            <span className="visually-hidden">{label ?? t('common.loading')}</span>
            <div aria-hidden="true" className="placeholder-glow">
                {variant === 'lines' ? (
                    Array.from({ length: lines }, (_, index) => (
                        <span key={index} className="placeholder col-12 rounded mb-3 d-block" />
                    ))
                ) : (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
                        {Array.from({ length: lines }, (_, index) => (
                            <div key={index} className="col">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body">
                                        <span className="placeholder col-4 rounded mb-3 d-block" />
                                        <span className="placeholder col-9 rounded mb-2 d-block" />
                                        <span className="placeholder col-6 rounded mb-4 d-block" />
                                        <span className="placeholder col-12 rounded mb-2 d-block" />
                                        <span className="placeholder col-10 rounded d-block" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
