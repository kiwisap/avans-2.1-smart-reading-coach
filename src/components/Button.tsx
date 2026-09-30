import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}

export default function Button({
    children,
    variant = 'primary',
    type = 'button',
    ...props
}: ButtonProps) {
    return (
        <button type={type} className={`button button-${variant}`} {...props}>
            {children}
        </button>
    );
}
