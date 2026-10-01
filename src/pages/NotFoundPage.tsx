import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// Shown for every address that does not exist.
export default function NotFoundPage() {
    const { t } = useTranslation();
    return (
        <div className="text-center py-5">
            <i className="bi bi-compass display-3 text-body-secondary" aria-hidden="true" />
            <h1 className="h3 mt-3">{t('notFound.title')}</h1>
            <Link to="/">{t('notFound.back')}</Link>
        </div>
    );
}
