import { useId, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
}

export default function TextField({ label, error, hint, required, ...inputProps }: TextFieldProps) {
    const id = useId();
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

    return (
        <div className="field">
            <label htmlFor={id}>
                {label}
                {required && <span aria-hidden="true"> *</span>}
            </label>
            <input
                id={id}
                required={required}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={describedBy}
                {...inputProps}
            />
            {hint && (
                <small id={hintId} className="hint">
                    {hint}
                </small>
            )}
            {error && (
                <small id={errorId} className="error-text">
                    {error}
                </small>
            )}
        </div>
    );
}
