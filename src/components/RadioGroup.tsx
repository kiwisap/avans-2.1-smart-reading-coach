import { useId } from 'react';

export interface ChoiceOption<T extends string> {
    value: T;
    label: string;
}

interface RadioGroupProps<T extends string> {
    legend: string;
    name: string;
    options: ChoiceOption<T>[];
    value: T | '';
    onChange: (value: T) => void;
    required?: boolean;
    hint?: string;
    error?: string;
}

export default function RadioGroup<T extends string>({
    legend,
    name,
    options,
    value,
    onChange,
    required,
    hint,
    error,
}: RadioGroupProps<T>) {
    const id = useId();
    const describedBy =
        [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

    return (
        <fieldset
            className="choice-group"
            aria-describedby={describedBy}
            aria-invalid={error ? 'true' : undefined}
        >
            <legend>
                {legend}
                {required && (
                    <>
                        <span aria-hidden="true"> *</span>
                        <span className="visually-hidden"> (required)</span>
                    </>
                )}
            </legend>
            {hint && (
                <small id={`${id}-hint`} className="hint">
                    {hint}
                </small>
            )}
            {options.map((option) => (
                <label key={option.value} className="choice">
                    <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={value === option.value}
                        onChange={() => onChange(option.value)}
                    />
                    {option.label}
                </label>
            ))}
            {error && (
                <small id={`${id}-error`} className="error-text">
                    {error}
                </small>
            )}
        </fieldset>
    );
}
