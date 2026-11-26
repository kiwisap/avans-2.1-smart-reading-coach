import { useTranslation } from 'react-i18next';

const MAX = 5;

// A rating as stars, read out as "4 van de 5 sterren".
export default function Stars({ rating, className = '' }: { rating: number; className?: string }) {
    const { t } = useTranslation();
    return (
        <span
            className={`stars ${className}`}
            role="img"
            aria-label={t('rating.stars', { count: rating, max: MAX })}
        >
            {Array.from({ length: MAX }, (_, index) => (
                <i
                    key={index}
                    className={`bi ${index < rating ? 'bi-star-fill' : 'bi-star'}`}
                    aria-hidden="true"
                />
            ))}
        </span>
    );
}
