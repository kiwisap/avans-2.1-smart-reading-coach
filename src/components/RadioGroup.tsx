import { useId } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const id = useId();
    const describedBy =
        [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

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
                        <span className="visually-hidden"> {t('common.required')}</span>
                    </>
                )}
            </legend>
            {hint && (
                <div id={`${id}-hint`} className="form-text mt-0 mb-2">
                    {hint}
                </div>
            )}
            {options.map((option) => {
                const inputId = `${id}-${option.value}`;
                return (
                    <div key={option.value} className="form-check py-1">
                        <input
                            id={inputId}
                            className="form-check-input"
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={() => onChange(option.value)}
                        />
                        <label htmlFor={inputId} className="form-check-label">
                            {option.label}
                        </label>
                    </div>
                );
            })}
            {error && (
                <div id={`${id}-error`} className="text-danger mt-2">
                    <i className="bi bi-exclamation-circle me-1" aria-hidden="true" />
                    {error}
                </div>
            )}
        </fieldset>
    );
}
