import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import nl from '../locales/nl.json';

// To add a language: create src/locales/<code>.json with the same keys as nl.json, add it to
// `resources` below and call i18n.changeLanguage('<code>') (for example from a language switch).
export const resources = {
    nl: { translation: nl },
} as const;

export const DEFAULT_LANGUAGE = 'nl';

void i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false }, // React already escapes rendered values
    returnNull: false,
});

// Keep <html lang> in sync, for screen readers and spell checkers.
const syncHtmlLang = (language: string) => {
    document.documentElement.lang = language;
};
syncHtmlLang(i18n.language);
i18n.on('languageChanged', syncHtmlLang);

export default i18n;
