import { useId, useState } from 'react';
import type { ChoiceOption } from './RadioGroup.tsx';

interface CheckboxGroupProps<T extends string> {
    legend: string;
    options: ChoiceOption<T>[];
    values: T[];
    onChange: (values: T[]) => void;
    required?: boolean;
    hint?: string;
    error?: string;
    max?: number; // limits the number of choices
    searchable?: boolean; // adds a filter box for long lists
}

export default function CheckboxGroup<T extends string>({
    legend,
    options,
    values,
    onChange,
    required,
    hint,
    error,
    max,
    searchable = false,
}: CheckboxGroupProps<T>) {
    const id = useId();
    const [query, setQuery] = useState('');
    const describedBy =
        [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
    const atLimit = max !== undefined && values.length >= max;

    const visible = options.filter(
        (option) =>
            values.includes(option.value) ||
            option.label.toLowerCase().includes(query.trim().toLowerCase()),
    );

    function toggle(value: T) {
        onChange(
            values.includes(value) ? values.filter((item) => item !== value) : [...values, value],
        );
    }

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
            {max !== undefined && (
                <p className="hint" aria-live="polite">
                    {values.length} of {max} chosen
                </p>
            )}
            {searchable && (
                <div className="field">
                    <label htmlFor={`${id}-filter`}>Filter the list</label>
                    <input
                        id={`${id}-filter`}
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </div>
            )}
            <div className={searchable ? 'choice-list scrollable' : 'choice-list'}>
                {visible.map((option) => (
                    <label key={option.value} className="choice">
                        <input
                            type="checkbox"
                            value={option.value}
                            checked={values.includes(option.value)}
                            disabled={atLimit && !values.includes(option.value)}
                            onChange={() => toggle(option.value)}
                        />
                        {option.label}
                    </label>
                ))}
                {visible.length === 0 && <p>No matches.</p>}
            </div>
            {error && (
                <small id={`${id}-error`} className="error-text">
                    {error}
                </small>
            )}
        </fieldset>
    );
}
