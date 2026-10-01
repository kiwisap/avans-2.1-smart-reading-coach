import { useEffect, useRef, type SubmitEventHandler } from 'react';
import { goalLabel, lengthLabel, typeLabel } from '../i18n/labels.ts';
import type { ProfileErrors, ProfileFormValues } from '../profile/profileDraft.ts';
import type { ProfileOptions } from '../types/api.ts';
import Button from './Button.tsx';
import CheckboxGroup from './CheckboxGroup.tsx';
import RadioGroup, { type ChoiceOption } from './RadioGroup.tsx';
import { useTranslation } from 'react-i18next';

const toOptions = <T extends string>(
    values: readonly T[],
    label: (value: string) => string = (value) => value,
): ChoiceOption<T>[] =>
    values
        .filter((value) => typeof value === 'string' && value !== '')
        .map((value) => ({ value, label: label(value) }));

interface ProfileFormProps {
    options: ProfileOptions;
    values: ProfileFormValues;
    errors: ProfileErrors;
    submitCount: number;
    submitting: boolean;
    onChange: <K extends keyof ProfileFormValues>(field: K, value: ProfileFormValues[K]) => void;
    onSubmit: SubmitEventHandler<HTMLFormElement>;
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
    const { t } = useTranslation();
    const summaryRef = useRef<HTMLDivElement>(null);
    const errorList = Object.entries(errors);

    // Move focus to the error summary after a failed submit, so keyboard and screen reader users notice it.
    useEffect(() => {
        if (submitCount > 0 && errorList.length > 0) summaryRef.current?.focus();
    }, [submitCount]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <form onSubmit={onSubmit} noValidate>
            <p className="text-body-secondary">{t('profile.form.requiredNote')}</p>

            {errorList.length > 0 && (
                <div className="alert alert-danger" role="alert" tabIndex={-1} ref={summaryRef}>
                    <p className="fw-semibold mb-1">{t('profile.form.fixFollowing')}</p>
                    <ul className="mb-0">
                        {errorList.map(([field, message]) => (
                            <li key={field}>{message}</li>
                        ))}
                    </ul>
                </div>
            )}

            <RadioGroup
                legend={t('profile.form.levelLegend')}
                name="languageLevel"
                required
                hint={t('profile.form.levelHint')}
                options={toOptions(options.languageLevels)}
                value={values.languageLevel}
                onChange={(value) => onChange('languageLevel', value)}
                error={errors.languageLevel}
            />

            <CheckboxGroup
                legend={t('profile.form.typesLegend')}
                required
                options={toOptions(options.materialTypes, typeLabel)}
                values={values.materialTypes}
                onChange={(value) => onChange('materialTypes', value)}
                error={errors.materialTypes}
            />

            <CheckboxGroup
                legend={t('profile.form.topicsLegend')}
                required
                searchable
                max={options.maxTopics}
                hint={t('profile.form.topicsHint', { max: options.maxTopics })}
                options={toOptions(options.topics)}
                values={values.topics}
                onChange={(value) => onChange('topics', value)}
                error={errors.topics}
            />

            <RadioGroup
                legend={t('profile.form.lengthLegend')}
                name="desiredLength"
                required
                options={toOptions(options.desiredLengths, lengthLabel)}
                value={values.desiredLength}
                onChange={(value) => onChange('desiredLength', value)}
                error={errors.desiredLength}
            />

            <RadioGroup
                legend={t('profile.form.goalLegend')}
                name="readingGoal"
                required
                options={toOptions(options.readingGoals, goalLabel)}
                value={values.readingGoal}
                onChange={(value) => onChange('readingGoal', value)}
                error={errors.readingGoal}
            />

            <div className="d-flex gap-2">
                <Button type="submit" icon="bi-check-lg" disabled={submitting}>
                    {submitting ? t('profile.form.saving') : t('profile.form.save')}
                </Button>
                {onCancel && (
                    <Button variant="secondary" onClick={onCancel}>
                        {t('profile.form.cancel')}
                    </Button>
                )}
            </div>
        </form>
    );
}
