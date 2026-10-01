import { goalLabel, lengthLabel, typeLabel } from '../i18n/labels.ts';
import type { ReadingProfile } from '../types/api.ts';
import { useTranslation } from 'react-i18next';

const pill = 'badge rounded-pill bg-primary-subtle text-primary-emphasis fw-medium';

export default function ProfileSummary({ profile }: { profile: ReadingProfile }) {
    const { t } = useTranslation();
    return (
        <div className="card shadow-sm mb-4">
            <div className="card-body">
                <dl className="row mb-0">
                    <dt className="col-sm-4 mb-2">{t('profile.summary.level')}</dt>
                    <dd className="col-sm-8 mb-3">
                        <span className={pill}>{profile.languageLevel}</span>
                    </dd>
                    <dt className="col-sm-4 mb-2">{t('profile.summary.types')}</dt>
                    <dd className="col-sm-8 mb-3 d-flex flex-wrap gap-1">
                        {profile.materialTypes.map((type) => (
                            <span key={type} className={pill}>
                                {typeLabel(type)}
                            </span>
                        ))}
                    </dd>
                    <dt className="col-sm-4 mb-2">{t('profile.summary.topics')}</dt>
                    <dd className="col-sm-8 mb-3 d-flex flex-wrap gap-1">
                        {profile.topics.map((topic) => (
                            <span key={topic} className={pill}>
                                {topic}
                            </span>
                        ))}
                    </dd>
                    <dt className="col-sm-4 mb-2">{t('profile.summary.length')}</dt>
                    <dd className="col-sm-8 mb-3">{lengthLabel(profile.desiredLength)}</dd>
                    <dt className="col-sm-4">{t('profile.summary.goal')}</dt>
                    <dd className="col-sm-8 mb-0">{goalLabel(profile.readingGoal)}</dd>
                </dl>
            </div>
        </div>
    );
}
