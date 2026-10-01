import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { Role } from '../types/api.ts';
import { useAuth } from './AuthContext.tsx';
import { useTranslation } from 'react-i18next';

interface ProtectedRouteProps {
    roles?: Role[];
    children: ReactNode;
}

// Usage: <ProtectedRoute roles={['teacher']}>...</ProtectedRoute>
// Not logged in: go to the login page. Wrong role: go home with a clear message.
export default function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
    const { t } = useTranslation();
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="text-center py-5" role="status">
                <div className="spinner-border text-primary" aria-hidden="true" />
                <span className="visually-hidden">{t('common.loading')}</span>
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: `${location.pathname}${location.search}` }}
            />
        );
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace state={{ notice: t('errors.noAccess') }} />;
    }

    return children;
}
