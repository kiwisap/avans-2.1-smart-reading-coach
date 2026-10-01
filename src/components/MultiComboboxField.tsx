import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

export interface ComboboxOption {
    value: string;
    label: string;
}

interface MultiComboboxFieldProps {
    label: string;
    values: string[];
    options: ComboboxOption[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    emptyText?: string;
    maxSelected?: number;
    wrapperClassName?: string;
}

// Searchable multi select: type to narrow the list, pick several, chosen values show as chips.
// Follows the ARIA 1.2 combobox pattern (focus stays in the input, options via aria-activedescendant).
export default function MultiComboboxField({
    label,
    values,
    options,
    onChange,
    placeholder,
    emptyText,
    maxSelected = Number.POSITIVE_INFINITY,
    wrapperClassName = 'mb-3',
}: MultiComboboxFieldProps) {
    const { t } = useTranslation();
    const id = useId();
    const listId = `${id}-list`;
    const rootRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    const visible = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return needle
            ? options.filter((option) => option.label.toLowerCase().includes(needle))
            : options;
    }, [options, query]);

    const labelOf = (value: string) =>
        options.find((option) => option.value === value)?.label ?? value;

    const limitReached = values.length >= maxSelected;

    function toggle(value: string) {
        if (values.includes(value)) onChange(values.filter((v) => v !== value));
        else if (!limitReached) onChange([...values, value]);
    }

    function close() {
        setOpen(false);
        setQuery('');
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (!open) setOpen(true);
                else setActiveIndex((index) => Math.min(index + 1, visible.length - 1));
                break;
            case 'ArrowUp':
                event.preventDefault();
                setActiveIndex((index) => Math.max(index - 1, 0));
                break;
            case 'Enter':
                if (open) {
                    event.preventDefault(); // do not submit the search form
                    const option = visible[activeIndex];
                    if (option) toggle(option.value);
                }
                break;
            case 'Escape':
                if (open) {
                    event.preventDefault();
                    close();
                }
                break;
            case 'Backspace': {
                const last = values.at(-1);
                if (query === '' && last !== undefined) onChange(values.slice(0, -1));
                break;
            }
            default:
        }
    }

    return (
        <div
            ref={rootRef}
            className={`combobox position-relative ${wrapperClassName}`}
            onBlur={(event) => {
                if (!rootRef.current?.contains(event.relatedTarget)) close();
            }}
        >
            <label htmlFor={id} className="form-label fw-semibold">
                {label}
            </label>
            <div className="position-relative">
                <input
                    id={id}
                    type="text"
                    role="combobox"
                    className="form-control combobox-input"
                    autoComplete="off"
                    placeholder={
                        values.length > 0
                            ? t('combobox.selected', { count: values.length })
                            : (placeholder ?? t('combobox.all'))
                    }
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={
                        open && visible[activeIndex] ? `${id}-opt-${activeIndex}` : undefined
                    }
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setActiveIndex(0);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onClick={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                />
                {values.length > 0 && (
                    <button
                        type="button"
                        className="combobox-clear btn btn-sm"
                        aria-label={t('combobox.clear', { label })}
                        onClick={() => {
                            onChange([]);
                            setQuery('');
                        }}
                    >
                        <i className="bi bi-x-lg" aria-hidden="true" />
                    </button>
                )}
            </div>
            {open && (
                <ul
                    id={listId}
                    role="listbox"
                    aria-label={label}
                    aria-multiselectable="true"
                    className="combobox-menu list-unstyled"
                >
                    {visible.map((option, index) => {
                        const selected = values.includes(option.value);
                        const disabled = limitReached && !selected;
                        return (
                            // Keyboard support lives on the input; the options are pointer targets.
                            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                            <li
                                key={option.value}
                                id={`${id}-opt-${index}`}
                                role="option"
                                aria-selected={selected}
                                aria-disabled={disabled || undefined}
                                className={`combobox-option${index === activeIndex ? ' active' : ''}${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}`}
                                onMouseDown={(event) => event.preventDefault()}
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => toggle(option.value)}
                            >
                                <i
                                    className={`bi ${selected ? 'bi-check-square-fill' : 'bi-square'} me-2`}
                                    aria-hidden="true"
                                />
                                {option.label}
                            </li>
                        );
                    })}
                    {limitReached && (
                        <li
                            className="combobox-empty text-body-secondary small"
                            role="presentation"
                        >
                            {t('combobox.limitReached', { max: maxSelected })}
                        </li>
                    )}
                    {visible.length === 0 && (
                        <li className="combobox-empty text-body-secondary" role="presentation">
                            {emptyText ?? t('combobox.nothingFound')}
                        </li>
                    )}
                </ul>
            )}
            {values.length > 0 && (
                <ul className="combobox-chips list-unstyled d-flex flex-wrap gap-1 mt-2 mb-0">
                    {values.map((value) => (
                        <li key={value}>
                            <button
                                type="button"
                                className="chip chip-removable"
                                aria-label={t('combobox.remove', { label: labelOf(value) })}
                                onClick={() => toggle(value)}
                            >
                                {labelOf(value)}
                                <i className="bi bi-x ms-1" aria-hidden="true" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
