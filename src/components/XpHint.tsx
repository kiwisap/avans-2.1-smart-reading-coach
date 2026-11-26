import { useTranslation } from 'react-i18next';

// "+10 XP" next to a button that earns XP. Hidden for screen readers, the button says it.
export default function XpHint({ xp }: { xp: number | undefined }) {
    const { t } = useTranslation();
    if (!xp) return null;
    return (
        <span className="xp-hint" aria-hidden="true">
            {t('game.gained', { xp })}
        </span>
    );
}
