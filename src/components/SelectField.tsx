import { useId, type SelectHTMLAttributes } from 'react';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
    allLabel?: string;
    wrapperClassName?: string;
}

export default function SelectField({
    label,
    options,
    allLabel = 'Alle',
    wrapperClassName = 'mb-3',
    ...selectProps
}: SelectFieldProps) {
    const id = useId();
    return (
        <div className={wrapperClassName}>
            <label htmlFor={id} className="form-label fw-semibold">
                {label}
            </label>
            <select id={id} className="form-select" {...selectProps}>
                <option value="">{allLabel}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
