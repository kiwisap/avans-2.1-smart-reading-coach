import { useId, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
    wrapperClassName?: string;
}

export default function TextField({
    label,
    error,
    hint,
    required,
    wrapperClassName = 'mb-3',
    className = '',
    ...inputProps
}: TextFieldProps) {
    const id = useId();
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

    return (
        <div className={wrapperClassName}>
            <label htmlFor={id} className="form-label fw-semibold">
                {label}
                {required && <span aria-hidden="true"> *</span>}
            </label>
            <input
                id={id}
                required={required}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={describedBy}
                className={`form-control ${error ? 'is-invalid' : ''} ${className}`.trim()}
                {...inputProps}
            />
            {hint && (
                <div id={hintId} className="form-text">
                    {hint}
                </div>
            )}
            {error && (
                <div id={errorId} className="invalid-feedback d-block">
                    {error}
                </div>
            )}
        </div>
    );
}
