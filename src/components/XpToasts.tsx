import { BADGE_ICONS } from '../game/badges.ts';
import type { BadgeId } from '../types/api.ts';
import Confetti from './Confetti.tsx';
import { useTranslation } from 'react-i18next';

export interface XpToast {
    id: number;
    xp: number;
    badges: BadgeId[]; // badges earned with this action
}

interface XpToastsProps {
    toasts: XpToast[];
    onDismiss: (id: number) => void;
}

// "+15 XP" in the corner of the screen after an action, with confetti for a new badge.
// The region is always there, so screen readers announce every new message.
export default function XpToasts({ toasts, onDismiss }: XpToastsProps) {
    const { t } = useTranslation();
    const celebrate = toasts.some((toast) => toast.badges.length > 0);
    return (
        <>
            {celebrate && (
                <div className="xp-confetti">
                    <Confetti pieces={50} />
                </div>
            )}
            <div className="xp-toasts" role="status" aria-live="polite">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`xp-toast ${toast.badges.length > 0 ? 'has-badge' : ''}`}
                    >
                        <div className="flex-grow-1">
                            <p className="xp-toast-gain mb-0">
                                <i
                                    className="bi bi-lightning-charge-fill me-1"
                                    aria-hidden="true"
                                />
                                {t('game.gained', { xp: toast.xp })}
                            </p>
                            {toast.badges.map((badge) => (
                                <p key={badge} className="xp-toast-badge mb-0">
                                    <i
                                        className={`bi ${BADGE_ICONS[badge]} me-2`}
                                        aria-hidden="true"
                                    />
                                    {t('game.newBadge', { name: t(`game.badges.${badge}.name`) })}
                                </p>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="btn-close btn-close-sm"
                            aria-label={t('game.close')}
                            onClick={() => onDismiss(toast.id)}
                        />
                    </div>
                ))}
            </div>
        </>
    );
}
