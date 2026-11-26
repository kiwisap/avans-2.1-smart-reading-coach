import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute.tsx';
import Layout from './components/Layout.tsx';
import AdvicePage from './pages/AdvicePage.tsx';
import CatalogPage from './pages/CatalogPage.tsx';
import CheckEmailPage from './pages/CheckEmailPage.tsx';
import ConfirmEmailPage from './pages/ConfirmEmailPage.tsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import OnboardingPage from './pages/OnboardingPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import ReadingListPage from './pages/ReadingListPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import ResetPasswordPage from './pages/ResetPasswordPage.tsx';
import StudentDetailPage from './pages/StudentDetailPage.tsx';
import StudentsPage from './pages/StudentsPage.tsx';
import VerifyEmailPage from './pages/VerifyEmailPage.tsx';

// The old /catalog address forwards to the home page and keeps the filters in the query.
function CatalogRedirect() {
    const { search } = useLocation();
    return <Navigate to={{ pathname: '/', search }} replace />;
}

export default function App() {
    return (
        <Routes>
            {/* Right after registering: the reading profile as a game, without the menu of the app. */}
            <Route
                path="/welcome"
                element={
                    <ProtectedRoute roles={['student']}>
                        <OnboardingPage />
                    </ProtectedRoute>
                }
            />
            <Route element={<Layout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* The links in the mails, and the pages around them: no login needed. */}
                <Route path="/check-email" element={<CheckEmailPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/confirm-email" element={<ConfirmEmailPage />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <CatalogPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="/catalog" element={<CatalogRedirect />} />
                <Route
                    path="/reading-list"
                    element={
                        <ProtectedRoute roles={['student']}>
                            <ReadingListPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/advice"
                    element={
                        <ProtectedRoute roles={['student']}>
                            <AdvicePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute roles={['student']}>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/students"
                    element={
                        <ProtectedRoute roles={['teacher']}>
                            <StudentsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/students/:studentId"
                    element={
                        <ProtectedRoute roles={['teacher']}>
                            <StudentDetailPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}
