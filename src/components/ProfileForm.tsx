import { useEffect, useRef, type FormEventHandler } from 'react';
import { GOAL_LABELS, LENGTH_LABELS, TYPE_LABELS } from '../constants/labels.ts';
import type { ProfileErrors, ProfileFormValues } from '../profile/profileDraft.ts';
import type { ProfileOptions } from '../types/api.ts';
import Button from './Button.tsx';
import CheckboxGroup from './CheckboxGroup.tsx';
import RadioGroup, { type ChoiceOption } from './RadioGroup.tsx';

const toOptions = <T extends string>(
    values: readonly T[],
    labels: Record<string, string> = {},
): ChoiceOption<T>[] =>
    values
        .filter((value) => typeof value === 'string' && value !== '')
        .map((value) => ({ value, label: labels[value] ?? value }));

interface ProfileFormProps {
    options: ProfileOptions;
    values: ProfileFormValues;
    errors: ProfileErrors;
    submitCount: number;
    submitting: boolean;
    onChange: <K extends keyof ProfileFormValues>(field: K, value: ProfileFormValues[K]) => void;
    onSubmit: FormEventHandler<HTMLFormElement>;
    onCancel?: () => void;
}

export default function ProfileForm({
    options,
    values,
    errors,
    submitCount,
    submitting,
    onChange,
    onSubmit,
    onCancel,
}: ProfileFormProps) {
    const summaryRef = useRef<HTMLDivElement>(null);
    const errorList = Object.entries(errors);

    // Move focus to the error summary after a failed submit, so keyboard and screen reader users notice it.
    useEffect(() => {
        if (submitCount > 0 && errorList.length > 0) summaryRef.current?.focus();
    }, [submitCount]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <form onSubmit={onSubmit} noValidate>
            <p className="text-body-secondary">Velden met een * zijn verplicht.</p>

            {errorList.length > 0 && (
                <div className="alert alert-danger" role="alert" tabIndex={-1} ref={summaryRef}>
                    <p className="fw-semibold mb-1">Pas het volgende aan:</p>
                    <ul className="mb-0">
                        {errorList.map(([field, message]) => (
                            <li key={field}>{message}</li>
                        ))}
                    </ul>
                </div>
            )}

            <RadioGroup
                legend="Wat is je leesniveau?"
                name="languageLevel"
                required
                hint="Weet je het niet zeker? Vraag het je docent."
                options={toOptions(options.languageLevels)}
                value={values.languageLevel}
                onChange={(value) => onChange('languageLevel', value)}
                error={errors.languageLevel}
            />

            <CheckboxGroup
                legend="Wat voor soort teksten vind je leuk?"
                required
                options={toOptions(options.materialTypes, TYPE_LABELS)}
                values={values.materialTypes}
                onChange={(value) => onChange('materialTypes', value)}
                error={errors.materialTypes}
            />

            <CheckboxGroup
                legend="Welke onderwerpen interesseren je?"
                required
                searchable
                max={options.maxTopics}
                hint={`Kies er maximaal ${options.maxTopics}.`}
                options={toOptions(options.topics)}
                values={values.topics}
                onChange={(value) => onChange('topics', value)}
                error={errors.topics}
            />

            <RadioGroup
                legend="Hoe lang mag de tekst zijn?"
                name="desiredLength"
                required
                options={toOptions(options.desiredLengths, LENGTH_LABELS)}
                value={values.desiredLength}
                onChange={(value) => onChange('desiredLength', value)}
                error={errors.desiredLength}
            />

            <RadioGroup
                legend="Waarom wil je lezen?"
                name="readingGoal"
                required
                options={toOptions(options.readingGoals, GOAL_LABELS)}
                value={values.readingGoal}
                onChange={(value) => onChange('readingGoal', value)}
                error={errors.readingGoal}
            />

            <div className="d-flex gap-2">
                <Button type="submit" icon="bi-check-lg" disabled={submitting}>
                    {submitting ? 'Opslaan...' : 'Profiel opslaan'}
                </Button>
                {onCancel && (
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}
