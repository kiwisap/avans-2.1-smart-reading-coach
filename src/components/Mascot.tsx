// Bo, the book owl: the mascot of the onboarding. An original drawing in the colours of the app.
// The mood changes the eyes and wings, so Bo reacts to what the student does.
export type MascotMood = 'wave' | 'think' | 'happy' | 'party';

interface MascotProps {
    mood?: MascotMood;
    size?: number;
    className?: string;
}

const FOREST = '#1f4d3f';
const FOREST_LIGHT = '#2f6b58';
const PAPER = '#fffdf8';
const BELLY = '#f3ecdb';
const TERRACOTTA = '#b4432b';
const OCHRE = '#c58a00';
const INK = '#1f2a24';

function Eyes({ mood }: { mood: MascotMood }) {
    if (mood === 'happy' || mood === 'party') {
        // Closed, smiling eyes
        return (
            <g fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round">
                <path d="M38 50 q8 -9 16 0" />
                <path d="M66 50 q8 -9 16 0" />
            </g>
        );
    }
    const look = mood === 'think' ? { x: 3, y: -4 } : { x: 0, y: 1 };
    return (
        <g>
            <circle cx="46" cy="50" r="12" fill={PAPER} />
            <circle cx="74" cy="50" r="12" fill={PAPER} />
            <circle cx={46 + look.x} cy={50 + look.y} r="5.5" fill={INK} />
            <circle cx={74 + look.x} cy={50 + look.y} r="5.5" fill={INK} />
            <circle cx={48 + look.x} cy={48 + look.y} r="1.8" fill={PAPER} />
            <circle cx={76 + look.x} cy={48 + look.y} r="1.8" fill={PAPER} />
        </g>
    );
}

function Wings({ mood }: { mood: MascotMood }) {
    if (mood === 'party') {
        // Both wings up
        return (
            <g fill={FOREST_LIGHT}>
                <path d="M24 70 q-16 -14 -10 -34 q10 12 18 26 z" />
                <path d="M96 70 q16 -14 10 -34 q-10 12 -18 26 z" />
            </g>
        );
    }
    if (mood === 'wave') {
        // Right wing waves
        return (
            <g fill={FOREST_LIGHT}>
                <path d="M24 66 q-8 16 2 30 q6 -14 4 -28 z" />
                <path className="mascot-wave" d="M96 68 q18 -8 20 -28 q-14 6 -22 20 z" />
            </g>
        );
    }
    return (
        <g fill={FOREST_LIGHT}>
            <path d="M24 66 q-8 16 2 30 q6 -14 4 -28 z" />
            <path d="M96 66 q8 16 -2 30 q-6 -14 -4 -28 z" />
        </g>
    );
}

export default function Mascot({ mood = 'wave', size = 120, className = '' }: MascotProps) {
    return (
        <svg
            className={`mascot mascot-${mood} ${className}`}
            width={size}
            height={size}
            viewBox="0 0 120 120"
            aria-hidden="true"
            focusable="false"
        >
            {/* Shadow */}
            <ellipse cx="60" cy="114" rx="30" ry="4" fill={INK} opacity="0.12" />

            <g className="mascot-body">
                {/* Ear tufts */}
                <path d="M30 30 l6 -16 l10 14 z" fill={FOREST} />
                <path d="M90 30 l-6 -16 l-10 14 z" fill={FOREST} />

                {/* Body */}
                <ellipse cx="60" cy="68" rx="38" ry="42" fill={FOREST} />
                <ellipse cx="60" cy="80" rx="25" ry="26" fill={BELLY} />
                <path
                    d="M48 74 q4 4 8 0 M58 82 q4 4 8 0 M50 90 q4 4 8 0 M62 96 q4 4 8 0"
                    fill="none"
                    stroke="#d9cdb2"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                <Wings mood={mood} />
                <Eyes mood={mood} />

                {/* Beak */}
                <path d="M55 60 l5 8 l5 -8 z" fill={OCHRE} />

                {/* Book in the claws */}
                <g transform="translate(40 92)">
                    <rect width="40" height="16" rx="2" fill={TERRACOTTA} />
                    <rect x="19" width="2" height="16" fill="#8f3422" />
                    <rect x="3" y="3" width="13" height="2" rx="1" fill={PAPER} opacity="0.7" />
                    <rect x="24" y="3" width="13" height="2" rx="1" fill={PAPER} opacity="0.7" />
                </g>

                {/* Feet */}
                <g fill={OCHRE}>
                    <ellipse cx="48" cy="110" rx="6" ry="3" />
                    <ellipse cx="72" cy="110" rx="6" ry="3" />
                </g>
            </g>

            {mood === 'party' && (
                <g>
                    {/* Party hat and sparkles */}
                    <path d="M50 22 l10 -20 l10 20 z" fill={TERRACOTTA} />
                    <circle cx="60" cy="2" r="3" fill={OCHRE} />
                    <path d="M8 24 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3 z" fill={OCHRE} />
                    <path d="M108 14 l2 4 l4 2 l-4 2 l-2 4 l-2 -4 l-4 -2 l4 -2 z" fill={OCHRE} />
                </g>
            )}
            {mood === 'think' && (
                <g fill={OCHRE}>
                    <circle cx="100" cy="20" r="3" />
                    <circle cx="108" cy="10" r="4.5" />
                </g>
            )}
        </svg>
    );
}
