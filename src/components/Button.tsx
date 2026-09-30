import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline-danger';
    size?: 'sm' | 'lg';
    icon?: string; // Bootstrap Icons class, for example "bi-search"
}

const VARIANTS = {
    primary: 'btn-primary',
    secondary: 'btn-outline-primary',
    success: 'btn-success',
    danger: 'btn-danger',
    'outline-danger': 'btn-outline-danger',
} as const;

export default function Button({
    children,
    variant = 'primary',
    size,
    icon,
    type = 'button',
    className = '',
    ...props
}: ButtonProps) {
    const classes = ['btn', VARIANTS[variant], size && `btn-${size}`, className]
        .filter(Boolean)
        .join(' ');
    return (
        <button type={type} className={classes} {...props}>
            {icon && <i className={`bi ${icon} me-2`} aria-hidden="true" />}
            {children}
        </button>
    );
}
