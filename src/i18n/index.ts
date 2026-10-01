import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// The texts are not bundled: they are plain files in public/locales/<code>.json that the app
// loads at startup (and when the language changes). To add a language: put a file with the same
// keys as nl.json in public/locales, add its code to SUPPORTED_LANGUAGES and call
// i18n.changeLanguage('<code>') (for example from a language switch).
export const SUPPORTED_LANGUAGES = ['nl'] as const;
export const DEFAULT_LANGUAGE = 'nl';

async function loadLanguage(language: string): Promise<void> {
    if (i18n.hasResourceBundle(language, 'translation')) return;

    const response = await fetch(`${import.meta.env.BASE_URL}locales/${language}.json`);
    if (!response.ok) {
        throw new Error(`Cannot load texts for "${language}" (${response.status})`);
    }

    i18n.addResourceBundle(language, 'translation', await response.json(), true, true);
}

// Resolves when the texts of the active language are loaded. Render the app after this.
export const i18nReady: Promise<void> = i18n
    .use(initReactI18next)
    .init({
        resources: {},
        lng: DEFAULT_LANGUAGE,
        fallbackLng: DEFAULT_LANGUAGE,
        interpolation: { escapeValue: false }, // React already escapes rendered values
        returnNull: false,
    })
    .then(() => loadLanguage(DEFAULT_LANGUAGE));

// Load the texts first when the language is changed later, then switch.
const changeLanguage = i18n.changeLanguage.bind(i18n);
i18n.changeLanguage = async (language, callback) => {
    if (language) await loadLanguage(language);
    return changeLanguage(language, callback);
};

// Keep <html lang> in sync, for screen readers and spell checkers.
const syncHtmlLang = (language: string) => {
    document.documentElement.lang = language;
};
syncHtmlLang(i18n.language);
i18n.on('languageChanged', syncHtmlLang);

export default i18n;
