import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import BrandMark from './BrandMark.tsx';
import { useTranslation } from 'react-i18next';

interface NavItem {
    to: string;
    labelKey: 'catalog' | 'advice' | 'readingList' | 'profile' | 'teachers' | 'students'; // key under "nav" in nl.json
    icon: string;
    end?: boolean;
}

const COMMON: NavItem[] = [{ to: '/', labelKey: 'catalog', icon: 'bi-collection', end: true }];

const STUDENT: NavItem[] = [
    { to: '/advice', labelKey: 'advice', icon: 'bi-stars' },
    { to: '/reading-list', labelKey: 'readingList', icon: 'bi-bookmarks' },
    { to: '/profile', labelKey: 'profile', icon: 'bi-person-lines-fill' },
    { to: '/teachers', labelKey: 'teachers', icon: 'bi-mortarboard' },
];

const TEACHER: NavItem[] = [{ to: '/students', labelKey: 'students', icon: 'bi-people' }];

export default function Layout() {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const items = user ? [...COMMON, ...(user.role === 'student' ? STUDENT : TEACHER)] : [];
    const close = () => setOpen(false);

    function handleLogout() {
        close();
        logout();
        navigate('/login');
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
                                {user ? (
                                    <>
                                        <span className="d-flex align-items-center gap-2">
                                            <span className="avatar" aria-hidden="true">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                            <span className="lh-sm">
                                                {user.name}
                                                <span className="d-block small text-body-secondary text-capitalize">
                                                    {t(`roles.${user.role}`)}
                                                </span>
                                            </span>
                                        </span>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={handleLogout}
                                        >
                                            <i
                                                className="bi bi-box-arrow-right me-1"
                                                aria-hidden="true"
                                            />
                                            {t('nav.logout')}
                                        </button>
                                    </>
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
                <Outlet />
            </main>

            <footer className="site-footer py-3 text-center small">
                {t('app.name')} · {t('app.subtitle')}
            </footer>
        </div>
    );
}
