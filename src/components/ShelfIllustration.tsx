// Decorative row of book spines on a shelf. Purely visual, hidden from screen readers.
const SPINES = [
    { x: 10, h: 96, w: 22, fill: '#e6d8b8' },
    { x: 34, h: 80, w: 18, fill: '#b4432b' },
    { x: 54, h: 104, w: 26, fill: '#1f6f8b' },
    { x: 82, h: 88, w: 20, fill: '#c58a00' },
    { x: 104, h: 100, w: 24, fill: '#7a2e5b' },
    { x: 130, h: 76, w: 18, fill: '#4f7a28' },
];

export default function ShelfIllustration({ className = '' }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 240 130"
            aria-hidden="true"
            focusable="false"
            role="presentation"
        >
            {SPINES.map((spine) => (
                <g key={spine.x}>
                    <rect
                        x={spine.x}
                        y={116 - spine.h}
                        width={spine.w}
                        height={spine.h}
                        rx="3"
                        fill={spine.fill}
                    />
                    <rect
                        x={spine.x + 4}
                        y={116 - spine.h + 12}
                        width={spine.w - 8}
                        height="3"
                        rx="1.5"
                        fill="#fffdf8"
                        opacity="0.6"
                    />
                    <rect
                        x={spine.x + 4}
                        y={116 - spine.h + 20}
                        width={spine.w - 8}
                        height="3"
                        rx="1.5"
                        fill="#fffdf8"
                        opacity="0.35"
                    />
                </g>
            ))}
            <path
                d="M154 116 L162 40 L186 44 L180 116 Z"
                fill="#b4432b"
                transform="translate(4 0)"
            />
            <rect x="196" y="52" width="24" height="64" rx="3" fill="#1f6f8b" />
            <rect x="0" y="116" width="240" height="8" rx="4" fill="#8a6a43" />
            <rect x="0" y="124" width="240" height="4" rx="2" fill="#6b5233" opacity="0.6" />
        </svg>
    );
}
