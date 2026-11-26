import type { CSSProperties } from 'react';
import { BADGE_ICONS, currentBadge, percentToNext } from '../game/badges.ts';
import { useProgress } from '../game/ProgressContext.tsx';
import { useTranslation } from 'react-i18next';

// The feathers (XP) of the student in the menu. Opens the settings, where the badges are.
// The border fills up on the way to the next badge: a rough idea of how far there is to go,
// the exact numbers are in the settings.
export default function XpChip({ onOpen }: { onOpen: () => void }) {
    const { t } = useTranslation();
    const { progress } = useProgress();
    if (!progress) return null;
    const badge = currentBadge(progress);
    const percent = percentToNext(progress);
    const style = { '--xp-progress': `${percent}%` } as CSSProperties;
    return (
        <button
            type="button"
            className="xp-chip"
            style={style}
            aria-label={t(progress.nextBadge ? 'game.chipLabel' : 'game.chipLabelAll', {
                xp: progress.xp,
                percent,
            })}
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
