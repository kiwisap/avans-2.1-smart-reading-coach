import { useEffect, useMemo, useRef, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import { useProgress } from '../game/ProgressContext.tsx';
import Alert from '../components/Alert.tsx';
import BrandMark from '../components/BrandMark.tsx';
import Button from '../components/Button.tsx';
import ChoiceCard from '../components/ChoiceCard.tsx';
import Confetti from '../components/Confetti.tsx';
import Mascot, { type MascotMood } from '../components/Mascot.tsx';
import QuestProgress from '../components/QuestProgress.tsx';
import Skeleton from '../components/Skeleton.tsx';
import { DEFAULT_TYPE_STYLE, TYPE_STYLES } from '../constants/typeStyles.ts';
import { typeLabel } from '../i18n/labels.ts';
import {
    EMPTY_PROFILE,
    clearDraft,
    loadDraft,
    saveDraft,
    toFormValues,
    toProfileInput,
    validateProfile,
    type ProfileFormValues,
} from '../profile/profileDraft.ts';
import type {
    DesiredLength,
    LanguageLevel,
    MaterialType,
    ProfileOptions,
    ReadingGoal,
    ReadingProfile,
} from '../types/api.ts';
import { useTranslation } from 'react-i18next';

// The questions in order. Each one fills one field of the reading profile.
const QUESTIONS = [
    'languageLevel',
    'materialTypes',
    'topics',
    'desiredLength',
    'readingGoal',
] as const;
type Question = (typeof QUESTIONS)[number];

// Five questions of 10 feathers: the same 50 the server gives for a saved reading profile.
const XP_PER_QUESTION = 10;
const MAX_XP = QUESTIONS.length * XP_PER_QUESTION;
const INTRO = 0;
const DONE = QUESTIONS.length + 1;

const LEVEL_ICONS: Record<LanguageLevel, string> = {
    '2F': 'bi-feather',
    '3F': 'bi-bicycle',
    '3F+': 'bi-rocket-takeoff',
};
const LENGTH_ICONS: Record<DesiredLength, string> = {
    short: 'bi-lightning-charge',
    medium: 'bi-cup-hot',
    long: 'bi-book',
};
const GOAL_ICONS: Record<ReadingGoal, string> = {
    enjoyment: 'bi-emoji-laughing',
    learn: 'bi-lightbulb',
    language: 'bi-chat-quote',
    work: 'bi-briefcase',
};
const CHEERS = [
    'onboarding.cheers.a',
    'onboarding.cheers.b',
    'onboarding.cheers.c',
    'onboarding.cheers.d',
] as const;

// Step by step reading profile right after registering, as a small game with Bo the book owl.
// Students can skip it at any moment; the answers are kept as a draft, like on the profile page.
export default function OnboardingPage() {
    const { t } = useTranslation();
    const { token, user } = useAuth();
    const { refresh: refreshProgress } = useProgress();
    const navigate = useNavigate();
    const userId = user?.id ?? '';
    const firstName = (user?.name ?? '').trim().split(/\s+/)[0] ?? '';

    const [options, setOptions] = useState<ProfileOptions | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [values, setValues] = useState<ProfileFormValues>(EMPTY_PROFILE);
    const [editing, setEditing] = useState(false); // the student already had a profile
    const [step, setStep] = useState(INTRO);
    const [bubble, setBubble] = useState<string | null>(null); // a reaction instead of the default text
    const [mood, setMood] = useState<MascotMood>('wave');
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [gained, setGained] = useState(0); // raised on every earned XP, restarts the "+20 XP" pop
    const [topicQuery, setTopicQuery] = useState('');
    const cheerIndex = useRef(0);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const firstRender = useRef(true);

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            apiFetch<ProfileOptions>('/profile/options', { token }),
            apiFetch<{ profile: ReadingProfile | null }>('/profile/me', { token }),
        ])
            .then(([loadedOptions, { profile }]) => {
                if (cancelled) return;
                setOptions(loadedOptions);
                setEditing(profile !== null);
                setValues(loadDraft(userId) ?? (profile ? toFormValues(profile) : EMPTY_PROFILE));
            })
            .catch((err: unknown) => {
                if (!cancelled) setLoadError(errorMessage(err));
            });
        return () => {
            cancelled = true;
        };
    }, [token, userId]);

    // Keep the answers, so a refresh or "later" does not lose them.
    useEffect(() => {
        if (options && step !== DONE) saveDraft(userId, values);
    }, [options, values, userId, step]);

    // Move focus to the new question, so keyboard and screen reader users start at the top.
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        headingRef.current?.focus();
    }, [step]);

    const question: Question | null =
        step >= 1 && step <= QUESTIONS.length ? (QUESTIONS[step - 1] ?? null) : null;
    const xp = step === DONE ? MAX_XP : Math.max(0, step - 1) * XP_PER_QUESTION;

    const visibleTopics = useMemo(() => {
        if (!options) return [];
        const query = topicQuery.trim().toLowerCase();
        const chosen = options.topics.filter((topic) => values.topics.includes(topic));
        const others = options.topics.filter(
            (topic) => !values.topics.includes(topic) && topic.toLowerCase().includes(query),
        );
        return [...chosen, ...others];
    }, [options, topicQuery, values.topics]);

    function cheer() {
        const key = CHEERS[cheerIndex.current % CHEERS.length] ?? CHEERS[0];
        cheerIndex.current += 1;
        setBubble(t(key));
        setMood('happy');
        setFieldError(null);
    }

    function update<K extends keyof ProfileFormValues>(field: K, value: ProfileFormValues[K]) {
        setValues((current) => ({ ...current, [field]: value }));
        cheer();
    }

    function toggle(field: 'materialTypes' | 'topics', value: string) {
        const current = values[field] as string[];
        const next = current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value];
        if (field === 'topics' && options && next.length === options.maxTopics) {
            setValues((all) => ({ ...all, topics: next }));
            setBubble(t('onboarding.topics.full', { max: options.maxTopics }));
            setMood('happy');
            setFieldError(null);
            return;
        }
        update(field, next as ProfileFormValues[typeof field]);
    }

    function goTo(next: number) {
        setBubble(null);
        setFieldError(null);
        setMood(next === DONE ? 'party' : next === INTRO ? 'wave' : 'think');
        setStep(next);
    }

    async function save() {
        setSaving(true);
        setSaveError(null);
        try {
            await apiFetch<{ profile: ReadingProfile }>('/profile/me', {
                method: 'PUT',
                token,
                body: toProfileInput(values),
            });
            clearDraft(userId);
            void refreshProgress(); // the first save earns XP
            setGained((count) => count + 1);
            goTo(DONE);
        } catch (err) {
            setSaveError(errorMessage(err));
            setMood('think');
        } finally {
            setSaving(false);
        }
    }

    function handleNext(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!options) return;
        if (step === INTRO) {
            goTo(1);
            return;
        }
        if (!question) return;

        const error = validateProfile(values, options.maxTopics)[question];
        if (error) {
            setFieldError(error);
            setBubble(t('onboarding.needAnswer'));
            setMood('think');
            return;
        }
        if (step === QUESTIONS.length) {
            void save();
            return;
        }
        setGained((count) => count + 1);
        goTo(step + 1);
    }

    function skip() {
        // Stopping while editing throws the changes away; skipping as a new student keeps the draft.
        if (editing) clearDraft(userId);
        navigate('/', { replace: true });
    }

    const defaultBubble = (() => {
        switch (question) {
            case 'languageLevel':
                return t('onboarding.level.bubble');
            case 'materialTypes':
                return t('onboarding.types.bubble');
            case 'topics':
                return t('onboarding.topics.bubble', { max: options?.maxTopics ?? 5 });
            case 'desiredLength':
                return t('onboarding.length.bubble');
            case 'readingGoal':
                return t('onboarding.goal.bubble');
            default:
                if (step === DONE) return t('onboarding.done.bubble');
                return editing ? t('onboarding.intro.editBubble') : t('onboarding.intro.bubble');
        }
    })();

    const titles: Record<Question, string> = {
        languageLevel: t('onboarding.level.question'),
        materialTypes: t('onboarding.types.question'),
        topics: t('onboarding.topics.question'),
        desiredLength: t('onboarding.length.question'),
        readingGoal: t('onboarding.goal.question'),
    };
    const title = question
        ? titles[question]
        : step === DONE
          ? t('onboarding.done.title')
          : editing
            ? t('onboarding.intro.editTitle', { name: firstName })
            : t('onboarding.intro.title', { name: firstName });

    function renderQuestion() {
        if (!options || !question) return null;
        const onRadio =
            <K extends 'languageLevel' | 'desiredLength' | 'readingGoal'>(field: K) =>
            (event: ChangeEvent<HTMLInputElement>) =>
                update(field, event.target.value as ProfileFormValues[K]);

        switch (question) {
            case 'languageLevel':
                return (
                    <>
                        <div className="choice-grid is-stacked">
                            {options.languageLevels.map((level) => (
                                <ChoiceCard
                                    key={level}
                                    type="radio"
                                    name="languageLevel"
                                    value={level}
                                    checked={values.languageLevel === level}
                                    onChange={onRadio('languageLevel')}
                                    icon={LEVEL_ICONS[level]}
                                    title={t(`onboarding.level.options.${level}.title`)}
                                    description={t(`onboarding.level.options.${level}.text`)}
                                />
                            ))}
                        </div>
                        <p className="small text-body-secondary mt-3 mb-0">
                            <i className="bi bi-info-circle me-1" aria-hidden="true" />
                            {t('onboarding.level.hint')}
                        </p>
                    </>
                );
            case 'materialTypes':
                return (
                    <div className="choice-grid">
                        {options.materialTypes.map((type: MaterialType) => (
                            <ChoiceCard
                                key={type}
                                type="checkbox"
                                name="materialTypes"
                                value={type}
                                checked={values.materialTypes.includes(type)}
                                onChange={() => toggle('materialTypes', type)}
                                icon={(TYPE_STYLES[type] ?? DEFAULT_TYPE_STYLE).icon}
                                title={typeLabel(type)}
                                description={t(`onboarding.types.options.${type}`)}
                            />
                        ))}
                    </div>
                );
            case 'topics': {
                const atLimit = values.topics.length >= options.maxTopics;
                return (
                    <>
                        <div className="d-flex flex-wrap gap-2 align-items-end mb-3">
                            <div className="flex-grow-1">
                                <label
                                    htmlFor="topic-search"
                                    className="form-label small fw-semibold"
                                >
                                    {t('onboarding.topics.search')}
                                </label>
                                <input
                                    id="topic-search"
                                    type="search"
                                    className="form-control"
                                    placeholder={t('onboarding.topics.searchPlaceholder')}
                                    value={topicQuery}
                                    onChange={(event) => setTopicQuery(event.target.value)}
                                />
                            </div>
                            <p className="topic-slots mb-1" aria-live="polite">
                                <span className="visually-hidden">
                                    {t('onboarding.topics.chosen', {
                                        count: values.topics.length,
                                        max: options.maxTopics,
                                    })}
                                </span>
                                {Array.from({ length: options.maxTopics }, (_, index) => (
                                    <i
                                        key={index}
                                        aria-hidden="true"
                                        className={`bi ${index < values.topics.length ? 'bi-star-fill is-filled' : 'bi-star'}`}
                                    />
                                ))}
                            </p>
                        </div>
                        <div className="topic-cloud">
                            {visibleTopics.map((topic) => {
                                const checked = values.topics.includes(topic);
                                return (
                                    <ChoiceCard
                                        key={topic}
                                        compact
                                        type="checkbox"
                                        name="topics"
                                        value={topic}
                                        checked={checked}
                                        disabled={!checked && atLimit}
                                        onChange={() => toggle('topics', topic)}
                                        title={topic}
                                    />
                                );
                            })}
                            {visibleTopics.length === 0 && (
                                <p className="text-body-secondary mb-0">
                                    {t('onboarding.topics.none')}
                                </p>
                            )}
                        </div>
                    </>
                );
            }
            case 'desiredLength':
                return (
                    <div className="choice-grid is-stacked">
                        {options.desiredLengths.map((length) => (
                            <ChoiceCard
                                key={length}
                                type="radio"
                                name="desiredLength"
                                value={length}
                                checked={values.desiredLength === length}
                                onChange={onRadio('desiredLength')}
                                icon={LENGTH_ICONS[length]}
                                title={t(`onboarding.length.options.${length}.title`)}
                                description={t(`onboarding.length.options.${length}.text`)}
                            />
                        ))}
                    </div>
                );
            case 'readingGoal':
                return (
                    <div className="choice-grid">
                        {options.readingGoals.map((goal) => (
                            <ChoiceCard
                                key={goal}
                                type="radio"
                                name="readingGoal"
                                value={goal}
                                checked={values.readingGoal === goal}
                                onChange={onRadio('readingGoal')}
                                icon={GOAL_ICONS[goal]}
                                title={t(`onboarding.goal.options.${goal}.title`)}
                                description={t(`onboarding.goal.options.${goal}.text`)}
                            />
                        ))}
                    </div>
                );
        }
    }

    return (
        <div className="onboarding d-flex flex-column min-vh-100">
            <header className="onboarding-header container d-flex align-items-center justify-content-between py-3">
                <span className="d-flex align-items-center gap-2 fw-bold">
                    <BrandMark />
                    <span className="d-none d-sm-inline">{t('app.name')}</span>
                </span>
                {step !== DONE && (
                    <button
                        type="button"
                        className="btn btn-link onboarding-skip text-nowrap"
                        onClick={skip}
                    >
                        {editing ? t('onboarding.stop') : t('onboarding.skip')}
                        <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
                    </button>
                )}
            </header>

            <main id="main" className="container flex-grow-1 pb-5" tabIndex={-1}>
                <div className="onboarding-stage mx-auto">
                    <QuestProgress current={step} total={QUESTIONS.length} xp={xp} maxXp={MAX_XP} />

                    <div className="mascot-row">
                        <div className="mascot-wrap">
                            <Mascot mood={mood} size={112} />
                            {gained > 0 && step !== INTRO && (
                                <span key={gained} className="xp-pop" aria-hidden="true">
                                    {t('game.gained', { xp: XP_PER_QUESTION })}
                                </span>
                            )}
                        </div>
                        <p className="speech-bubble mb-0" aria-live="polite">
                            <span className="visually-hidden">{t('onboarding.mascotName')}: </span>
                            {bubble ?? defaultBubble}
                        </p>
                    </div>

                    {loadError && <Alert>{loadError}</Alert>}
                    {!options && !loadError && <Skeleton lines={4} label={t('profile.loading')} />}

                    {options && step !== DONE && (
                        <form
                            className="quest-card card shadow-sm"
                            onSubmit={handleNext}
                            noValidate
                        >
                            <div className="card-body p-4 p-lg-5">
                                <h1
                                    id="quest-question"
                                    ref={headingRef}
                                    tabIndex={-1}
                                    className="quest-title"
                                >
                                    {title}
                                </h1>

                                {step === INTRO && (
                                    <ul className="quest-intro list-unstyled mb-0">
                                        <li>
                                            <i className="bi bi-stopwatch" aria-hidden="true" />
                                            {t('onboarding.intro.time')}
                                        </li>
                                        <li>
                                            <i className="bi bi-feather" aria-hidden="true" />
                                            {t('onboarding.intro.rewards')}
                                        </li>
                                        <li>
                                            <i className="bi bi-arrow-repeat" aria-hidden="true" />
                                            {t('onboarding.intro.change')}
                                        </li>
                                    </ul>
                                )}

                                {question && (
                                    <fieldset
                                        aria-labelledby="quest-question"
                                        aria-describedby={fieldError ? 'quest-error' : undefined}
                                        aria-invalid={fieldError ? 'true' : undefined}
                                    >
                                        {renderQuestion()}
                                    </fieldset>
                                )}

                                {fieldError && (
                                    <p
                                        id="quest-error"
                                        className="quest-error mt-3 mb-0"
                                        role="alert"
                                    >
                                        <i
                                            className="bi bi-exclamation-circle-fill me-1"
                                            aria-hidden="true"
                                        />
                                        {fieldError}
                                    </p>
                                )}
                                {saveError && (
                                    <div className="mt-3">
                                        <Alert>{saveError}</Alert>
                                    </div>
                                )}
                            </div>
                            <div className="card-footer d-flex justify-content-between align-items-center gap-2 p-3 px-lg-5">
                                {step > INTRO ? (
                                    <Button
                                        variant="secondary"
                                        icon="bi-arrow-left"
                                        onClick={() => goTo(step - 1)}
                                    >
                                        {t('onboarding.back')}
                                    </Button>
                                ) : (
                                    <span />
                                )}
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="btn-accent"
                                    disabled={saving}
                                >
                                    {step === INTRO
                                        ? t('onboarding.intro.start')
                                        : step === QUESTIONS.length
                                          ? saving
                                              ? t('onboarding.saving')
                                              : t('onboarding.finish')
                                          : t('onboarding.next')}
                                    <i
                                        className={`bi ${step === QUESTIONS.length ? 'bi-trophy' : 'bi-arrow-right'} ms-2`}
                                        aria-hidden="true"
                                    />
                                </Button>
                            </div>
                        </form>
                    )}

                    {step === DONE && (
                        <section className="quest-card card shadow-sm text-center">
                            <Confetti />
                            <div className="card-body p-4 p-lg-5">
                                <div className="quest-badge mx-auto mb-3" aria-hidden="true">
                                    <i className="bi bi-award-fill" />
                                </div>
                                <h1 ref={headingRef} tabIndex={-1} className="quest-title">
                                    {title}
                                </h1>
                                {/* Feathers and the first badge only come with the first save. */}
                                {!editing && (
                                    <>
                                        <p className="fs-5 mb-1">{t('onboarding.done.badge')}</p>
                                        <p className="text-body-secondary">
                                            {t('onboarding.done.xpTotal', { xp: MAX_XP })}
                                        </p>
                                    </>
                                )}
                                <div className="d-flex flex-column flex-sm-row justify-content-center gap-2 mt-4">
                                    <Button
                                        size="lg"
                                        className="btn-accent"
                                        icon="bi-stars"
                                        onClick={() => navigate('/advice', { replace: true })}
                                    >
                                        {t('onboarding.done.advice')}
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="secondary"
                                        onClick={() => navigate('/', { replace: true })}
                                    >
                                        {t('onboarding.done.catalog')}
                                    </Button>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
