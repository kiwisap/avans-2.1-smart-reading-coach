import { GOAL_LABELS, LENGTH_LABELS, TYPE_LABELS } from '../constants/labels.ts';
import type { ReadingProfile } from '../types/api.ts';

export default function ProfileSummary({ profile }: { profile: ReadingProfile }) {
    return (
        <dl className="summary">
            <dt>Reading level</dt>
            <dd>{profile.languageLevel}</dd>
            <dt>Kinds of texts</dt>
            <dd>{profile.materialTypes.map((type) => TYPE_LABELS[type] ?? type).join(', ')}</dd>
            <dt>Topics</dt>
            <dd>{profile.topics.join(', ')}</dd>
            <dt>Length</dt>
            <dd>{LENGTH_LABELS[profile.desiredLength]}</dd>
            <dt>Reason for reading</dt>
            <dd>{GOAL_LABELS[profile.readingGoal]}</dd>
        </dl>
    );
}
