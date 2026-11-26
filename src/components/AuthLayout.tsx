import type { ReactNode } from 'react';
import BoSays from './BoSays.tsx';
import BrandMark from './BrandMark.tsx';
import type { MascotMood } from './Mascot.tsx';
import { useTranslation } from 'react-i18next';

export interface AuthBo {
    mood: MascotMood;
    text: string;
}

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    bo: AuthBo; // what Bo says, changes with what the visitor does in the form
    children: ReactNode;
}

const PERKS = [
    { key: 'advice', icon: 'bi-stars' },
    { key: 'feathers', icon: 'bi-feather' },
    { key: 'list', icon: 'bi-bookmarks' },
] as const;

// Shared frame for the login and register pages: Bo next to the form, reacting to what the
// visitor does. On small screens Bo sits above the form instead.
export default function AuthLayout({ title, subtitle, bo, children }: AuthLayoutProps) {
    const { t } = useTranslation();
    return (
        <section className="auth-shell card overflow-hidden border-0 shadow-lg mx-auto">
            <div className="row g-0">
                <div className="col-md-5 d-none d-md-flex flex-column auth-side p-4 p-lg-5">
                    <div className="d-flex align-items-center gap-2 fw-bold">
                        <BrandMark />
                        {t('app.name')}
                    </div>
                    <p className="tagline mt-4 mb-0">{t('auth.tagline')}</p>
                    <BoSays mood={bo.mood} size={140} live className="auth-bo my-4">
                        {bo.text}
                    </BoSays>
                    <ul className="auth-perks list-unstyled mt-auto mb-0">
                        {PERKS.map((perk) => (
                            <li key={perk.key}>
                                <i className={`bi ${perk.icon}`} aria-hidden="true" />
                                {t(`auth.perks.${perk.key}`)}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="col-md-7 p-4 p-lg-5">
                    <BoSays mood={bo.mood} size={72} live className="bo-says-sm mb-4 d-md-none">
                        {bo.text}
                    </BoSays>
                    <h1 className="h2 mb-1">{title}</h1>
                    <p className="text-body-secondary mb-4">{subtitle}</p>
                    {children}
                </div>
            </div>
        </section>
    );
}
