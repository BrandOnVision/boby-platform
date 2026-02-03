import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import ConversationsPage from './pages/ConversationsPage';
import PlantSeedsPage from './pages/PlantSeedsPage';
import NurturePage from './pages/NurturePage';
import WatchGrowPage from './pages/WatchGrowPage';
import SeedsLibraryPage from './pages/SeedsLibraryPage';
import CircleManagementPage from './pages/CircleManagementPage';

/**
 * Protected Route Wrapper
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
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
 * Main App Component
 */
function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <SettingsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/conversations"
                element={
                    <ProtectedRoute>
                        <ConversationsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/plant-seeds"
                element={
                    <ProtectedRoute>
                        <PlantSeedsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/nurture"
                element={
                    <ProtectedRoute>
                        <NurturePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/circles"
                element={
                    <ProtectedRoute>
                        <CircleManagementPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/watch-grow"
                element={
                    <ProtectedRoute>
                        <WatchGrowPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/seeds-library"
                element={
                    <ProtectedRoute>
                        <SeedsLibraryPage />
                    </ProtectedRoute>
                }
            />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
