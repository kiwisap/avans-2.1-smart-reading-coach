import type { ReactNode } from 'react';
import BrandMark from './BrandMark.tsx';
import ShelfIllustration from './ShelfIllustration.tsx';

interface AuthLayoutProps {
    title: string;
    subtitle: string;
    children: ReactNode;
}

// Shared frame for the login and register pages: a friendly panel next to the form.
export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
    return (
        <section className="auth-shell card overflow-hidden border-0 shadow-lg mx-auto">
            <div className="row g-0">
                <div className="col-md-5 d-none d-md-flex flex-column justify-content-between auth-side p-4 p-lg-5">
                    <div className="d-flex align-items-center gap-2 fw-bold">
                        <BrandMark />
                        Smart Reading Coach
                    </div>
                    <div className="my-5">
                        <p className="tagline mb-3">
                            Lees wat bij je past. Groei in je eigen tempo.
                        </p>
                        <p className="mb-0 opacity-75">
                            Maak je leesprofiel, krijg advies dat past bij jouw niveau en houd bij
                            wat je hebt gelezen.
                        </p>
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
