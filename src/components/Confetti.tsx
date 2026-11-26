import { useMemo } from 'react';

const COLORS = ['#b4432b', '#c58a00', '#1f6f8b', '#4f7a28', '#7a2e5b', '#1f4d3f'];

// A short burst of confetti, made with CSS only. Hidden for screen readers and switched off for
// people who prefer reduced motion (see .confetti in main.scss).
export default function Confetti({ pieces = 60 }: { pieces?: number }) {
    const items = useMemo(
        () =>
            Array.from({ length: pieces }, (_, index) => ({
                left: (index * 37) % 100,
                delay: ((index * 53) % 100) / 100,
                duration: 2.2 + ((index * 29) % 100) / 60,
                rotate: (index * 47) % 360,
                color: COLORS[index % COLORS.length],
                round: index % 3 === 0,
            })),
        [pieces],
    );

    return (
        <div className="confetti" aria-hidden="true">
            {items.map((item, index) => (
                <span
                    key={index}
                    className={item.round ? 'is-round' : ''}
                    style={{
                        left: `${item.left}%`,
                        backgroundColor: item.color,
                        animationDelay: `${item.delay}s`,
                        animationDuration: `${item.duration}s`,
                        transform: `rotate(${item.rotate}deg)`,
                    }}
                />
            ))}
        </div>
    );
}
