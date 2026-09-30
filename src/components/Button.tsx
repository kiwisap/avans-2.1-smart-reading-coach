import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'lg';
    icon?: string; // Bootstrap Icons class, for example "bi-search"
}

const VARIANTS = {
    primary: 'btn-primary',
    secondary: 'btn-outline-primary',
    danger: 'btn-danger',
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
