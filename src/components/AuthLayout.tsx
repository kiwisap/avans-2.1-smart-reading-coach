import type { ReactNode } from 'react';
import BrandMark from './BrandMark.tsx';
import ShelfIllustration from './ShelfIllustration.tsx';
import { useTranslation } from 'react-i18next';

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    children: ReactNode;
}

// Shared frame for the login and register pages: a friendly panel next to the form.
export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
    const { t } = useTranslation();
    return (
        <section className="auth-shell card overflow-hidden border-0 shadow-lg mx-auto">
            <div className="row g-0">
                <div className="col-md-5 d-none d-md-flex flex-column justify-content-between auth-side p-4 p-lg-5">
                    <div className="d-flex align-items-center gap-2 fw-bold">
                        <BrandMark />
                        {t('app.name')}
                    </div>
                    <div className="my-5">
                        <p className="tagline mb-3">{t('auth.tagline')}</p>
                        <p className="mb-0 opacity-75">{t('auth.intro')}</p>
                    </div>
                    <ShelfIllustration className="w-100" />
                </div>
                <div className="col-md-7 p-4 p-lg-5">
                    <h1 className="h2 mb-1">{title}</h1>
                    <p className="text-body-secondary mb-4">{subtitle}</p>
                    {children}
                </div>
            </div>
        </section>
    );
}
