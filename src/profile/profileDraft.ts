import type {
    DesiredLength,
    LanguageLevel,
    MaterialType,
    ProfileInput,
    ReadingGoal,
    ReadingProfile,
} from '../types/api.ts';

// The form starts empty, so single choice answers can be '' until the student picks one.
export interface ProfileFormValues {
    languageLevel: LanguageLevel | '';
    materialTypes: MaterialType[];
    topics: string[];
    desiredLength: DesiredLength | '';
    readingGoal: ReadingGoal | '';
}

export type ProfileErrors = Partial<Record<keyof ProfileFormValues, string>>;

export const EMPTY_PROFILE: ProfileFormValues = {
    languageLevel: '',
    materialTypes: [],
    topics: [],
    desiredLength: '',
    readingGoal: '',
};

export function toFormValues(profile: ReadingProfile): ProfileFormValues {
    return {
        languageLevel: profile.languageLevel,
        materialTypes: [...profile.materialTypes],
        topics: [...profile.topics],
        desiredLength: profile.desiredLength,
        readingGoal: profile.readingGoal,
    };
}

// Keeps unsaved form input in localStorage so an accidental navigation does not lose it (FR1).
const keyFor = (userId: string) => `src_profile_draft_${userId}`;

export function loadDraft(userId: string): ProfileFormValues | null {
    try {
        const raw = localStorage.getItem(keyFor(userId));
        return raw
            ? { ...EMPTY_PROFILE, ...(JSON.parse(raw) as Partial<ProfileFormValues>) }
            : null;
    } catch {
        return null;
    }
}

export function saveDraft(userId: string, values: ProfileFormValues): void {
    try {
        localStorage.setItem(keyFor(userId), JSON.stringify(values));
    } catch {
        // Storage may be unavailable, the form still works without a draft.
    }
}

export function clearDraft(userId: string): void {
    try {
        localStorage.removeItem(keyFor(userId));
    } catch {
        // ignore
    }
}

const sameSet = (a: string[], b: string[]) =>
    a.length === b.length && a.every((item) => b.includes(item));

export function sameProfile(a: ProfileFormValues, b: ProfileFormValues): boolean {
    return (
        a.languageLevel === b.languageLevel &&
        a.desiredLength === b.desiredLength &&
        a.readingGoal === b.readingGoal &&
        sameSet(a.materialTypes, b.materialTypes) &&
        sameSet(a.topics, b.topics)
    );
}

export function validateProfile(values: ProfileFormValues, maxTopics: number): ProfileErrors {
    const errors: ProfileErrors = {};
    if (!values.languageLevel) errors.languageLevel = 'Kies je leesniveau';
    if (values.materialTypes.length === 0) errors.materialTypes = 'Kies minstens één soort tekst';
    if (values.topics.length === 0) errors.topics = 'Kies minstens één onderwerp';
    else if (values.topics.length > maxTopics) errors.topics = `Choose at most ${maxTopics} topics`;
    if (!values.desiredLength) errors.desiredLength = 'Kies hoe lang de tekst mag zijn';
    if (!values.readingGoal) errors.readingGoal = 'Kies waarom je wilt lezen';
    return errors;
}

// Only call this after validateProfile found no errors.
export function toProfileInput(values: ProfileFormValues): ProfileInput {
    if (!values.languageLevel || !values.desiredLength || !values.readingGoal) {
        throw new Error('Profile is incomplete');
    }
    return {
        languageLevel: values.languageLevel,
        materialTypes: values.materialTypes,
        topics: values.topics,
        desiredLength: values.desiredLength,
        readingGoal: values.readingGoal,
    };
}
