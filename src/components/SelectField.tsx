import { useId, type SelectHTMLAttributes } from 'react';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
    allLabel?: string;
}

export default function SelectField({
    label,
    options,
    allLabel = 'All',
    ...selectProps
}: SelectFieldProps) {
    const id = useId();
    return (
        <div className="field">
            <label htmlFor={id}>{label}</label>
            <select id={id} {...selectProps}>
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
