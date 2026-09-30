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
            className={`card card-body mb-4 shadow-sm ${error ? 'border-danger' : ''}`}
            aria-describedby={describedBy}
            aria-invalid={error ? 'true' : undefined}
        >
            <legend className="h6 float-none w-auto mb-1">
                {legend}
                {required && (
                    <>
                        <span aria-hidden="true"> *</span>
                        <span className="visually-hidden"> (verplicht)</span>
                    </>
                )}
            </legend>
            {hint && (
                <div id={`${id}-hint`} className="form-text mt-0 mb-2">
                    {hint}
                </div>
            )}
            {max !== undefined && (
                <p className="mb-2" aria-live="polite">
                    <span
                        className={`badge ${atLimit ? 'bg-warning-subtle text-warning-emphasis' : 'bg-primary-subtle text-primary-emphasis'}`}
                    >
                        {values.length} van {max} gekozen
                    </span>
                </p>
            )}
            {searchable && (
                <div className="mb-2">
                    <label htmlFor={`${id}-filter`} className="form-label visually-hidden">
                        Filter de lijst
                    </label>
                    <div className="input-group">
                        <span className="input-group-text" aria-hidden="true">
                            <i className="bi bi-search" />
                        </span>
                        <input
                            id={`${id}-filter`}
                            type="search"
                            className="form-control"
                            placeholder="Filter de lijst"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>
                </div>
            )}
            <div className={searchable ? 'choice-scroll border rounded px-3 py-1' : ''}>
                {visible.map((option) => {
                    const inputId = `${id}-${option.value}`;
                    return (
                        <div key={option.value} className="form-check py-1">
                            <input
                                id={inputId}
                                className="form-check-input"
                                type="checkbox"
                                value={option.value}
                                checked={values.includes(option.value)}
                                disabled={atLimit && !values.includes(option.value)}
                                onChange={() => toggle(option.value)}
                            />
                            <label htmlFor={inputId} className="form-check-label">
                                {option.label}
                            </label>
                        </div>
                    );
                })}
                {visible.length === 0 && (
                    <p className="text-body-secondary my-2">Geen resultaten.</p>
                )}
            </div>
            {error && (
                <div id={`${id}-error`} className="text-danger mt-2">
                    <i className="bi bi-exclamation-circle me-1" aria-hidden="true" />
                    {error}
                </div>
            )}
        </fieldset>
    );
}
