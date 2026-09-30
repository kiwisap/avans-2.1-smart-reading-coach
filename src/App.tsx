import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute.tsx';
import Layout from './components/Layout.tsx';
import AdvicePage from './pages/AdvicePage.tsx';
import CatalogPage from './pages/CatalogPage.tsx';
import HomePage from './pages/HomePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import ReadingListPage from './pages/ReadingListPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import StudentDetailPage from './pages/StudentDetailPage.tsx';
import StudentsPage from './pages/StudentsPage.tsx';
import TeachersPage from './pages/TeachersPage.tsx';

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/catalog"
                    element={
                        <ProtectedRoute>
                            <CatalogPage />
                        </ProtectedRoute>
                    }
                />
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
                <Route
                    path="/teachers"
                    element={
                        <ProtectedRoute roles={['student']}>
                            <TeachersPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<p>Page not found.</p>} />
            </Route>
        </Routes>
    );
}
