import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import BrandMark from './BrandMark.tsx';
import ErrorBoundary from './ErrorBoundary.tsx';
import SettingsPanel from './SettingsPanel.tsx';
import XpChip from './XpChip.tsx';
import { useTranslation } from 'react-i18next';

interface NavItem {
    to: string;
    labelKey: 'catalog' | 'advice' | 'readingList' | 'students'; // key under "nav" in nl.json
    icon: string;
    end?: boolean;
}

const COMMON: NavItem[] = [{ to: '/', labelKey: 'catalog', icon: 'bi-collection', end: true }];

const STUDENT: NavItem[] = [
    { to: '/advice', labelKey: 'advice', icon: 'bi-stars' },
    { to: '/reading-list', labelKey: 'readingList', icon: 'bi-bookmarks' },
];

const TEACHER: NavItem[] = [{ to: '/students', labelKey: 'students', icon: 'bi-people' }];

export default function Layout() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [settingsKey, setSettingsKey] = useState(0); // a new key gives the panel fresh, empty forms

    const items = user ? [...COMMON, ...(user.role === 'student' ? STUDENT : TEACHER)] : [];
    const close = () => setOpen(false);

    function openSettings() {
        close();
        setSettingsKey((key) => key + 1);
        setSettingsOpen(true);
    }

    return (
        <div className="d-flex flex-column min-vh-100">
            <a href="#main" className="skip-link">
                {t('nav.skipLink')}
            </a>

            <header>
                <nav
                    className="navbar navbar-expand-lg site-nav sticky-top"
                    aria-label={t('nav.mainMenu')}
                >
                    <div className="container">
                        <Link to="/" className="navbar-brand" onClick={close}>
                            <BrandMark />
                            {t('app.name')}
                        </Link>
                        <button
                            type="button"
                            className="navbar-toggler"
                            aria-controls="main-menu"
                            aria-expanded={open}
                            aria-label={t('nav.toggleMenu')}
                            onClick={() => setOpen((current) => !current)}
                        >
                            <span className="navbar-toggler-icon" />
                        </button>

                        <div
                            id="main-menu"
                            className={`collapse navbar-collapse ${open ? 'show' : ''}`}
                        >
                            <ul className="navbar-nav me-auto gap-lg-1 mt-2 mt-lg-0">
                                {items.map((item) => (
                                    <li key={item.to} className="nav-item">
                                        <NavLink
                                            to={item.to}
                                            end={item.end}
                                            className="nav-link"
                                            onClick={close}
                                        >
                                            <i
                                                className={`bi ${item.icon} me-2`}
                                                aria-hidden="true"
                                            />
                                            {t(`nav.${item.labelKey}`)}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>

                            <div className="d-flex align-items-lg-center flex-column flex-lg-row gap-2 mt-3 mt-lg-0">
                                {user?.role === 'student' && <XpChip onOpen={openSettings} />}
                                {user ? (
                                    <button
                                        type="button"
                                        className="user-button"
                                        aria-haspopup="dialog"
                                        aria-expanded={settingsOpen}
                                        aria-label={t('settings.open', { name: user.name })}
                                        onClick={openSettings}
                                    >
                                        <span className="avatar" aria-hidden="true">
                                            {(user.firstName || user.name).charAt(0).toUpperCase()}
                                        </span>
                                        <span className="lh-sm text-start" aria-hidden="true">
                                            {user.name}
                                            <span className="d-block small text-body-secondary text-capitalize">
                                                {t(`roles.${user.role}`)}
                                            </span>
                                        </span>
                                        <i className="bi bi-gear ms-1" aria-hidden="true" />
                                    </button>
                                ) : (
                                    <>
                                        <NavLink
                                            to="/login"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={close}
                                        >
                                            {t('nav.login')}
                                        </NavLink>
                                        <NavLink
                                            to="/register"
                                            className="btn btn-primary btn-sm"
                                            onClick={close}
                                        >
                                            {t('nav.register')}
                                        </NavLink>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>
            </header>

            <main id="main" className="container py-4 py-lg-5 flex-grow-1" tabIndex={-1}>
                {/* The menu stays usable when a page breaks; going to another page resets it. */}
                <ErrorBoundary resetKey={pathname}>
                    <Outlet />
                </ErrorBoundary>
            </main>

            {user && (
                <SettingsPanel
                    key={settingsKey}
                    open={settingsOpen}
                    onClose={() => setSettingsOpen(false)}
                />
            )}

            <footer className="site-footer py-3 text-center small">
                {t('app.name')} · {t('app.subtitle')}
            </footer>
        </div>
    );
}
