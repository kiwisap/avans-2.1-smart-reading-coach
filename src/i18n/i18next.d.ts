import 'i18next';
import type nl from '../../public/locales/nl.json';

// Makes t('...') type safe: an unknown key is a compile error, so missing texts are caught early.
declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: { translation: typeof nl };
    }
}
