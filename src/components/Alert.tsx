import type { ReactNode } from 'react';

interface AlertProps {
    type?: 'error' | 'success' | 'info';
    children: ReactNode;
}

const STYLES = {
    error: { className: 'alert-danger', icon: 'bi-exclamation-octagon-fill' },
    success: { className: 'alert-success', icon: 'bi-check-circle-fill' },
    info: { className: 'alert-info', icon: 'bi-info-circle-fill' },
} as const;

export default function Alert({ type = 'error', children }: AlertProps) {
    const { className, icon } = STYLES[type];
    return (
        <div
            className={`alert ${className} d-flex align-items-start gap-2`}
            role={type === 'error' ? 'alert' : 'status'}
        >
            <i className={`bi ${icon} mt-1`} aria-hidden="true" />
            <div>{children}</div>
        </div>
    );
}
