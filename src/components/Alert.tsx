import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface AlertProps {
    type?: 'error' | 'success' | 'info';
    children: ReactNode;
    onRetry?: () => void; // shows a "try again" button, for errors that may pass
}

const STYLES = {
    error: { className: 'alert-danger', icon: 'bi-exclamation-octagon-fill' },
    success: { className: 'alert-success', icon: 'bi-check-circle-fill' },
    info: { className: 'alert-info', icon: 'bi-info-circle-fill' },
} as const;

export default function Alert({ type = 'error', children, onRetry }: AlertProps) {
    const { t } = useTranslation();
    const { className, icon } = STYLES[type];
    return (
        <div
            className={`alert ${className} d-flex align-items-start gap-2`}
            role={type === 'error' ? 'alert' : 'status'}
        >
            <i className={`bi ${icon} mt-1`} aria-hidden="true" />
            <div>
                {children}
                {onRetry && (
                    <div className="mt-2">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={onRetry}
                        >
                            <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
                            {t('common.retry')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
