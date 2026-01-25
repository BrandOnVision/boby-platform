import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-grey-100 flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse", children: _jsx("span", { className: "text-xl font-bold text-text-primary", children: "B" }) }), _jsx("p", { className: "text-text-muted", children: "Loading..." })] }) }));
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
/**
 * PublicRoute - Accessible without authentication
 * Redirects to home if already authenticated
 */
function PublicRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return null;
    }
    if (isAuthenticated) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
/**
 * AppRoutes - Route definitions
 */
function AppRoutes() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(PublicRoute, { children: _jsx(LoginPage, {}) }) }), _jsxs(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(Layout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(HomePage, {}) }), _jsx(Route, { path: "jobs", element: _jsx(JobsPage, {}) }), _jsx(Route, { path: "jobs/:slug", element: _jsx(JobDetailPage, {}) }), _jsx(Route, { path: "applications", element: _jsx(MyApplicationsPage, {}) }), _jsx(Route, { path: "earnings", element: _jsx(EarningsPage, {}) }), _jsx(Route, { path: "profile", element: _jsx(ProfilePage, {}) }), _jsx(Route, { path: "settings", element: _jsx(SettingsPage, {}) })] })] }));
}
/**
 * App - Main application component
 */
function App() {
    return (_jsx(AuthProvider, { children: _jsx(AppRoutes, {}) }));
}
export default App;
//# sourceMappingURL=App.js.map