import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import BrandMark from './BrandMark.tsx';

interface NavItem {
    to: string;
    label: string;
    icon: string;
    end?: boolean;
}

const ROLE_LABELS = { student: 'Leerling', teacher: 'Docent' } as const;

const COMMON: NavItem[] = [{ to: '/', label: 'Catalogus', icon: 'bi-collection', end: true }];

const STUDENT: NavItem[] = [
    { to: '/advice', label: 'Advies', icon: 'bi-stars' },
    { to: '/reading-list', label: 'Leeslijst', icon: 'bi-bookmarks' },
    { to: '/profile', label: 'Mijn profiel', icon: 'bi-person-lines-fill' },
    { to: '/teachers', label: 'Mijn docenten', icon: 'bi-mortarboard' },
];

const TEACHER: NavItem[] = [{ to: '/students', label: 'Leerlingen', icon: 'bi-people' }];

export default function Layout() {
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
                Ga naar de hoofdinhoud
            </a>

            <header>
                <nav className="navbar navbar-expand-lg site-nav sticky-top" aria-label="Hoofdmenu">
                    <div className="container">
                        <Link to="/" className="navbar-brand" onClick={close}>
                            <BrandMark />
                            Smart Reading Coach
                        </Link>
                        <button
                            type="button"
                            className="navbar-toggler"
                            aria-controls="main-menu"
                            aria-expanded={open}
                            aria-label="Menu in- of uitklappen"
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
                                            {item.label}
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
                                                    {ROLE_LABELS[user.role]}
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
                                            Uitloggen
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <NavLink
                                            to="/login"
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={close}
                                        >
                                            Inloggen
                                        </NavLink>
                                        <NavLink
                                            to="/register"
                                            className="btn btn-primary btn-sm"
                                            onClick={close}
                                        >
                                            Registreren
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
                Smart Reading Coach · Vrij lezen op maat
            </footer>
        </div>
    );
}
