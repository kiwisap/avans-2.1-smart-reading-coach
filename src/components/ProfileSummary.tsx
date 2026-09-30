import { GOAL_LABELS, LENGTH_LABELS, TYPE_LABELS } from '../constants/labels.ts';
import type { ReadingProfile } from '../types/api.ts';

const pill = 'badge rounded-pill bg-primary-subtle text-primary-emphasis fw-medium';

export default function ProfileSummary({ profile }: { profile: ReadingProfile }) {
    return (
        <div className="card shadow-sm mb-4">
            <div className="card-body">
                <dl className="row mb-0">
                    <dt className="col-sm-4 mb-2">Leesniveau</dt>
                    <dd className="col-sm-8 mb-3">
                        <span className={pill}>{profile.languageLevel}</span>
                    </dd>
                    <dt className="col-sm-4 mb-2">Soorten teksten</dt>
                    <dd className="col-sm-8 mb-3 d-flex flex-wrap gap-1">
                        {profile.materialTypes.map((type) => (
                            <span key={type} className={pill}>
                                {TYPE_LABELS[type] ?? type}
                            </span>
                        ))}
                    </dd>
                    <dt className="col-sm-4 mb-2">Onderwerpen</dt>
                    <dd className="col-sm-8 mb-3 d-flex flex-wrap gap-1">
                        {profile.topics.map((topic) => (
                            <span key={topic} className={pill}>
                                {topic}
                            </span>
                        ))}
                    </dd>
                    <dt className="col-sm-4 mb-2">Lengte</dt>
                    <dd className="col-sm-8 mb-3">{LENGTH_LABELS[profile.desiredLength]}</dd>
                    <dt className="col-sm-4">Reden om te lezen</dt>
                    <dd className="col-sm-8 mb-0">{GOAL_LABELS[profile.readingGoal]}</dd>
                </dl>
            </div>
        </div>
    );
}
