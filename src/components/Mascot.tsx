import boCheer from '../assets/mascot/bo-cheer.webp';
import boRead from '../assets/mascot/bo-read.webp';
import boThink from '../assets/mascot/bo-think.webp';
import boWave from '../assets/mascot/bo-wave.webp';

// Bo, the book owl: the mascot of the app. Each mood is its own drawing,
// so Bo reacts to what the student does.
export type MascotMood = 'wave' | 'think' | 'happy' | 'party';

interface MascotProps {
    mood?: MascotMood;
    size?: number;
    className?: string;
}

const IMAGES: Record<MascotMood, string> = {
    wave: boWave,
    think: boThink,
    happy: boRead,
    party: boCheer,
};

// Load all moods up front, so switching mood does not flash an empty image.
if (typeof window !== 'undefined') {
    for (const src of Object.values(IMAGES)) {
        const image = new Image();
        image.src = src;
    }
}

export default function Mascot({ mood = 'wave', size = 120, className = '' }: MascotProps) {
    return (
        <span
            className={`mascot mascot-${mood} ${className}`}
            style={{ width: size, height: size }}
            aria-hidden="true"
        >
            {/* The key restarts the hop animation whenever the mood changes */}
            <img
                key={mood}
                className="mascot-body"
                src={IMAGES[mood]}
                width={size}
                height={size}
                alt=""
                draggable={false}
                decoding="async"
            />
        </span>
    );
}
