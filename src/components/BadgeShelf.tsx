import { BADGE_ICONS, percentToNext } from '../game/badges.ts';
import type { Progress } from '../types/api.ts';
import { useTranslation } from 'react-i18next';

interface BadgeShelfProps {
    progress: Progress;
    // For the teacher: the same shelf, about someone else.
    studentName?: string;
}

// XP, the way to the next badge, and all badges: earned ones in color, the rest locked.
export default function BadgeShelf({ progress, studentName }: BadgeShelfProps) {
    const { t, i18n } = useTranslation();
    const percent = percentToNext(progress);
    const next = progress.nextBadge;
    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long' });

    return (
        <div className="badge-shelf">
            {!studentName && <p className="small mb-2">{t('game.intro')}</p>}
            <p className="xp-total mb-1">
                <i className="bi bi-feather me-1" aria-hidden="true" />
                {t('game.xp', { xp: progress.xp })}
            </p>
            <p className="small text-body-secondary mb-2">
                {next
                    ? t(studentName ? 'game.toNextOther' : 'game.toNext', {
                          xp: next.xp - progress.xp,
                          name: t(`game.badges.${next.id}.name`),
                          student: studentName,
                      })
                    : t(studentName ? 'game.allEarnedOther' : 'game.allEarned', {
                          student: studentName,
                      })}
            </p>
            <div
                className="progress xp-progress mb-3"
                role="progressbar"
                aria-label={t('game.progressLabel')}
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div className="progress-bar" style={{ width: `${percent}%` }} />
            </div>
            <ul className="badge-grid list-unstyled mb-0" aria-label={t('game.badgesLabel')}>
                {progress.badges.map((badge) => {
                    const earned = badge.earnedAt !== null;
                    const name = t(`game.badges.${badge.id}.name`);
                    return (
                        <li key={badge.id} className={`game-badge ${earned ? 'is-earned' : ''}`}>
                            <span className="game-badge-icon" aria-hidden="true">
                                <i className={`bi ${earned ? BADGE_ICONS[badge.id] : 'bi-lock'}`} />
                            </span>
                            <span className="game-badge-name">{name}</span>
                            <span className="game-badge-meta">
                                {badge.earnedAt
                                    ? t('game.earnedOn', { date: formatDate(badge.earnedAt) })
                                    : t('game.locked', { xp: badge.xp })}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
