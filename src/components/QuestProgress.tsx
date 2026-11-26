import { useTranslation } from 'react-i18next';

interface QuestProgressProps {
    current: number; // 1 based number of the question, 0 on the intro
    total: number;
    xp: number;
    maxXp: number;
}

// Progress through the onboarding as a game: one star per answered question and an XP bar.
export default function QuestProgress({ current, total, xp, maxXp }: QuestProgressProps) {
    const { t } = useTranslation();
    const percentage = Math.round((xp / maxXp) * 100);

    return (
        <div className="quest-progress">
            <div className="d-flex justify-content-between align-items-center mb-1 small fw-semibold">
                <span>
                    {current > 0
                        ? t('onboarding.progress', { current: Math.min(current, total), total })
                        : t('onboarding.progressStart')}
                </span>
                <span className="quest-xp">
                    <i className="bi bi-feather me-1" aria-hidden="true" />
                    {t('onboarding.xp', { xp })}
                </span>
            </div>
            <div
                className="quest-bar"
                role="progressbar"
                aria-label={t('onboarding.progressLabel')}
                aria-valuemin={0}
                aria-valuemax={maxXp}
                aria-valuenow={xp}
                aria-valuetext={t('onboarding.xpOf', { xp, max: maxXp })}
            >
                <div className="quest-bar-fill" style={{ width: `${percentage}%` }} />
                <ol className="quest-stars" aria-hidden="true">
                    {Array.from({ length: total }, (_, index) => (
                        <li key={index} className={index < xp / (maxXp / total) ? 'is-earned' : ''}>
                            <i className="bi bi-star-fill" />
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
