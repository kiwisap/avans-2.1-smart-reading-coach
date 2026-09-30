import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import Button from './Button.tsx';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <>
            <header className="site-header">
                <Link to="/" className="brand">
                    Smart Reading Coach
                </Link>
                <nav aria-label="Main">
                    {user?.role === 'student' && <Link to="/profile">My profile</Link>}
                    {user?.role === 'student' && <Link to="/advice">Advice</Link>}
                    {user?.role === 'student' && <Link to="/reading-list">Reading list</Link>}
                    {user?.role === 'student' && <Link to="/teachers">My teachers</Link>}
                    {user && <Link to="/catalog">Catalog</Link>}
                    {user?.role === 'teacher' && <Link to="/students">Students</Link>}
                    {user ? (
                        <>
                            <span className="user-name">{user.name}</span>
                            <Button variant="secondary" onClick={handleLogout}>
                                Log out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Log in</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </nav>
            </header>
            <main className="container">
                <Outlet />
            </main>
        </>
    );
}
