import { BADGE_ICONS, currentBadge } from '../game/badges.ts';
import { useProgress } from '../game/ProgressContext.tsx';
import { useTranslation } from 'react-i18next';

// The feathers (XP) of the student in the menu. Opens the settings, where the badges are.
export default function XpChip({ onOpen }: { onOpen: () => void }) {
    const { t } = useTranslation();
    const { progress } = useProgress();
    if (!progress) return null;
    const badge = currentBadge(progress);
    return (
        <button
            type="button"
            className="xp-chip"
            aria-label={t('game.chipLabel', { xp: progress.xp })}
            onClick={onOpen}
        >
            <i className={`bi ${badge ? BADGE_ICONS[badge] : 'bi-feather'}`} aria-hidden="true" />
            {/* The key restarts the little pop animation whenever the XP changes. */}
            <span key={progress.xp} className="xp-chip-value" aria-hidden="true">
                {t('game.xp', { xp: progress.xp })}
            </span>
        </button>
    );
}
