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
            <p className="hint">Fields marked with * are required.</p>

            {errorList.length > 0 && (
                <div className="alert alert-error" role="alert" tabIndex={-1} ref={summaryRef}>
                    <p>Please fix the following:</p>
                    <ul>
                        {errorList.map(([field, message]) => (
                            <li key={field}>{message}</li>
                        ))}
                    </ul>
                </div>
            )}

            <RadioGroup
                legend="What is your reading level?"
                name="languageLevel"
                required
                hint="Not sure? Ask your teacher."
                options={toOptions(options.languageLevels)}
                value={values.languageLevel}
                onChange={(value) => onChange('languageLevel', value)}
                error={errors.languageLevel}
            />

            <CheckboxGroup
                legend="What kind of texts do you like?"
                required
                options={toOptions(options.materialTypes, TYPE_LABELS)}
                values={values.materialTypes}
                onChange={(value) => onChange('materialTypes', value)}
                error={errors.materialTypes}
            />

            <CheckboxGroup
                legend="Which topics interest you?"
                required
                searchable
                max={options.maxTopics}
                hint={`Choose up to ${options.maxTopics}.`}
                options={toOptions(options.topics)}
                values={values.topics}
                onChange={(value) => onChange('topics', value)}
                error={errors.topics}
            />

            <RadioGroup
                legend="How long should the text be?"
                name="desiredLength"
                required
                options={toOptions(options.desiredLengths, LENGTH_LABELS)}
                value={values.desiredLength}
                onChange={(value) => onChange('desiredLength', value)}
                error={errors.desiredLength}
            />

            <RadioGroup
                legend="Why do you want to read?"
                name="readingGoal"
                required
                options={toOptions(options.readingGoals, GOAL_LABELS)}
                value={values.readingGoal}
                onChange={(value) => onChange('readingGoal', value)}
                error={errors.readingGoal}
            />

            <div className="filter-actions">
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save profile'}
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
