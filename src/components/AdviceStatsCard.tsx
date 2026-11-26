import { useEffect, useState } from 'react';
import { apiFetch, errorMessage } from '../api/client.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import type { AdviceStats } from '../types/api.ts';
import Alert from './Alert.tsx';
import Skeleton from './Skeleton.tsx';
import { useTranslation } from 'react-i18next';

const SOURCES = ['advice', 'catalog', 'teacher', 'unknown'] as const;
const MODELS = ['ai', 'rules'] as const;

// "Does the advice of Bo help?" for the teacher: what Bo showed, where the titles on the reading
// lists came from, what was read and how it was rated. Over the students the teacher follows.
export default function AdviceStatsCard({ reloadKey }: { reloadKey: number }) {
    const { t, i18n } = useTranslation();
    const { token } = useAuth();
    const [stats, setStats] = useState<AdviceStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        apiFetch<AdviceStats>('/students/advice-stats', { token })
            .then((data) => {
                if (!cancelled) setStats(data);
            })
            .catch((err: unknown) => {
                if (!cancelled) setError(errorMessage(err));
            });
        return () => {
            cancelled = true;
        };
    }, [token, reloadKey]);

    const percent = (part: number, whole: number) =>
        whole > 0
            ? (part / whole).toLocaleString(i18n.language, {
                  style: 'percent',
                  maximumFractionDigits: 0,
              })
            : t('stats.none');
    const stars = (value: number | null) =>
        value === null
            ? t('stats.none')
            : t('stats.stars', {
                  value: value.toLocaleString(i18n.language, { maximumFractionDigits: 1 }),
              });

    return (
        <section className="card shadow-sm mb-4 stats-card" aria-labelledby="advice-stats-title">
            <div className="card-body">
                <h2 id="advice-stats-title" className="h5 mb-1">
                    <i className="bi bi-graph-up-arrow me-2" aria-hidden="true" />
                    {t('stats.title')}
                </h2>
                <p className="small text-body-secondary">{t('stats.intro')}</p>

                {error && <Alert>{error}</Alert>}
                {!stats && !error && <Skeleton lines={3} label={t('stats.loading')} />}

                {stats && stats.shown === 0 && stats.added.advice.total === 0 && (
                    <p className="mb-0">{t('stats.empty')}</p>
                )}

                {stats && (stats.shown > 0 || stats.added.advice.total > 0) && (
                    <>
                        <dl className="stat-tiles">
                            <div>
                                <dt>{t('stats.shown')}</dt>
                                <dd>{stats.shown}</dd>
                            </div>
                            <div>
                                <dt>{t('stats.taken')}</dt>
                                <dd>
                                    {stats.added.advice.total}
                                    <span className="stat-sub">
                                        {t('stats.ofShown', {
                                            percent: percent(stats.added.advice.total, stats.shown),
                                        })}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt>{t('stats.readFromAdvice')}</dt>
                                <dd>
                                    {stats.added.advice.read}
                                    <span className="stat-sub">
                                        {t('stats.ofAdded', {
                                            percent: percent(
                                                stats.added.advice.read,
                                                stats.added.advice.total,
                                            ),
                                        })}
                                    </span>
                                </dd>
                            </div>
                            <div>
                                <dt>{t('stats.ratingAdvice')}</dt>
                                <dd>
                                    {stars(stats.added.advice.averageRating)}
                                    <span className="stat-sub">
                                        {t('stats.vsCatalog', {
                                            stars: stars(stats.added.catalog.averageRating),
                                        })}
                                    </span>
                                </dd>
                            </div>
                        </dl>

                        <div className="table-responsive">
                            <table className="table table-sm stats-table">
                                <caption>{t('stats.sourcesCaption')}</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">{t('stats.col.source')}</th>
                                        <th scope="col">{t('stats.col.onList')}</th>
                                        <th scope="col">{t('stats.col.read')}</th>
                                        <th scope="col">{t('stats.col.rated')}</th>
                                        <th scope="col">{t('stats.col.average')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {SOURCES.filter(
                                        (source) =>
                                            source !== 'unknown' || stats.added.unknown.total > 0,
                                    ).map((source) => {
                                        const row = stats.added[source];
                                        return (
                                            <tr key={source}>
                                                <th scope="row">{t(`stats.source.${source}`)}</th>
                                                <td>{row.total}</td>
                                                <td>{row.read}</td>
                                                <td>{row.rated}</td>
                                                <td>{stars(row.averageRating)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-sm stats-table">
                                <caption>{t('stats.modelsCaption')}</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">{t('stats.col.model')}</th>
                                        <th scope="col">{t('stats.col.shown')}</th>
                                        <th scope="col">{t('stats.col.added')}</th>
                                        <th scope="col">{t('stats.col.read')}</th>
                                        <th scope="col">{t('stats.col.average')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MODELS.map((model) => {
                                        const row = stats.bySource[model];
                                        return (
                                            <tr key={model}>
                                                <th scope="row">{t(`stats.model.${model}`)}</th>
                                                <td>{row.shown}</td>
                                                <td>
                                                    {row.added}{' '}
                                                    <span className="text-body-secondary">
                                                        ({percent(row.added, row.shown)})
                                                    </span>
                                                </td>
                                                <td>{row.read}</td>
                                                <td>{stars(row.averageRating)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {stats.catalogAlsoSuggested > 0 && (
                            <p className="small text-body-secondary mb-0">
                                {t('stats.alsoSuggested', { count: stats.catalogAlsoSuggested })}
                            </p>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
