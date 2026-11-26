import type { ReactNode } from 'react';
import Mascot, { type MascotMood } from './Mascot.tsx';
import { useTranslation } from 'react-i18next';

interface BoSaysProps {
    children: ReactNode;
    mood?: MascotMood;
    size?: number;
    live?: boolean; // announce changes to screen readers (for messages that change)
    className?: string;
}

// Bo, the AI of the app, with a speech bubble. Used wherever Bo gives advice or explains something.
export default function BoSays({
    children,
    mood = 'wave',
    size = 88,
    live = false,
    className = '',
}: BoSaysProps) {
    const { t } = useTranslation();
    return (
        <div className={`bo-says ${className}`}>
            <Mascot mood={mood} size={size} />
            <div className="speech-bubble mb-0" aria-live={live ? 'polite' : undefined}>
                <span className="visually-hidden">{t('onboarding.mascotName')}: </span>
                {children}
            </div>
        </div>
    );
}
