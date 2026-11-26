import type { BadgeId, Progress } from '../types/api.ts';

// The look of each badge. Names and texts are in nl.json under game.badges.
export const BADGE_ICONS: Record<BadgeId, string> = {
    firstPage: 'bi-book',
    bookworm: 'bi-bug',
    readingKnight: 'bi-shield-check',
    storyHunter: 'bi-compass',
    pageBoss: 'bi-lightning-charge',
    legend: 'bi-trophy',
};

// The highest badge earned so far, or null.
export function currentBadge(progress: Progress): BadgeId | null {
    const earned = progress.badges.filter((badge) => badge.earnedAt !== null);
    return earned.at(-1)?.id ?? null;
}

// How far the student is between the last badge and the next one, from 0 to 100.
export function percentToNext(progress: Progress): number {
    if (!progress.nextBadge) return 100;
    const previous = progress.badges.filter((badge) => badge.xp <= progress.xp).at(-1)?.xp ?? 0;
    const span = progress.nextBadge.xp - previous;
    return span > 0 ? Math.round(((progress.xp - previous) / span) * 100) : 0;
}
