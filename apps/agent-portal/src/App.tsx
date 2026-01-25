import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { EarningsPage } from './pages/EarningsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';
import { LoginPage } from './pages/LoginPage';

/**
 * ProtectedRoute - Requires authentication
 * Redirects to login if not authenticated
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();



    if (isLoading) {

        return (
            <div className="min-h-screen bg-grey-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-xl font-bold text-text-primary">B</span>
                    </div>
                    <p className="text-text-muted">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {

        return <Navigate to="/login" replace />;
    }


    return <>{children}</>;
}

/**
 * PublicRoute - Accessible without authentication
 * Redirects to home if already authenticated
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

/**
 * AppRoutes - Route definitions
 */
function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />

            {/* Protected Routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<HomePage />} />
                <Route path="jobs" element={<JobsPage />} />
                <Route path="jobs/:slug" element={<JobDetailPage />} />
                <Route path="applications" element={<MyApplicationsPage />} />
                <Route path="earnings" element={<EarningsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
            </Route>
        </Routes>
    );
}

/**
 * App - Main application component
 */
function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;
