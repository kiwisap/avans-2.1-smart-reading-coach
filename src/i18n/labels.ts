import i18n from './index.ts';

// Labels for values that come from the API (a type such as "online-artikel", a length such as
// "short"). An unknown value is shown as it is, so a new type in the backend never breaks the UI.
type LabelGroup = 'types' | 'lengths' | 'goals';

function label(group: LabelGroup, value: string): string {
    const key = `${group}.${value}`;
    return i18n.exists(key) ? (i18n.t as (k: string) => string)(key) : value;
}

export const typeLabel = (value: string) => label('types', value);
export const lengthLabel = (value: string) => label('lengths', value);
export const goalLabel = (value: string) => label('goals', value);
