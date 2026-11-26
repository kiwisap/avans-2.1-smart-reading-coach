import type { ChangeEvent } from 'react';

interface ChoiceCardProps {
    type: 'radio' | 'checkbox';
    name: string;
    value: string;
    checked: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    title: string;
    description?: string;
    icon?: string; // Bootstrap Icons class
    disabled?: boolean;
    compact?: boolean; // small chip style, for long lists such as topics
}

// A big, tappable answer. Underneath it is a real radio button or checkbox, so it works with the
// keyboard (tab, space, arrow keys) and screen readers exactly like a normal form field.
export default function ChoiceCard({
    type,
    name,
    value,
    checked,
    onChange,
    title,
    description,
    icon,
    disabled = false,
    compact = false,
}: ChoiceCardProps) {
    return (
        <label
            className={`choice-card ${compact ? 'is-compact' : ''} ${checked ? 'is-checked' : ''} ${disabled ? 'is-disabled' : ''}`}
        >
            <input
                className="visually-hidden"
                type={type}
                name={name}
                value={value}
                checked={checked}
                disabled={disabled}
                onChange={onChange}
            />
            <span className="choice-body">
                {icon && <i className={`bi ${icon} choice-icon`} aria-hidden="true" />}
                <span className="choice-text">
                    <span className="choice-title">{title}</span>
                    {description && <span className="choice-description">{description}</span>}
                </span>
                <i
                    className={`bi ${checked ? 'bi-check-circle-fill' : 'bi-circle'} choice-check`}
                    aria-hidden="true"
                />
            </span>
        </label>
    );
}
