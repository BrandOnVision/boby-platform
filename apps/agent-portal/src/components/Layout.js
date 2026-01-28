import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Agent Portal Layout Component
 *
 * Sidebar layout matching existing membership portal pattern
 * Mobile-first: Full-width content on mobile, sidebar on desktop
 * Brand-compliant: Gold accents, 2-letter markers, no emojis
 */
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@boby/ui';
import { useAuth } from '../context/AuthContext';
const navigation = [
    { name: 'Dashboard', href: '/', marker: 'DB' },
    { name: 'Jobs', href: '/jobs', marker: 'JB' },
    { name: 'Applications', href: '/applications', marker: 'AP' },
    { name: 'Earnings', href: '/earnings', marker: 'EA' },
    { name: 'Recruit', href: '/recruit', marker: 'RP' },
    { name: 'Profile', href: '/profile', marker: 'PR' },
    { name: 'Settings', href: '/settings', marker: 'ST' },
];
export function Layout() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // Get initials for avatar
    const initials = user
        ? `${(user.firstName?.[0] || user.email?.[0] || 'A').toUpperCase()}${(user.lastName?.[0] || 'G').toUpperCase()}`
        : 'AG';
    // Get display name
    const displayName = user
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0] || 'Agent'
        : 'Agent';
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (_jsxs("div", { className: "min-h-screen flex flex-col lg:flex-row bg-grey-100", children: [_jsxs("header", { className: "lg:hidden bg-white border-b border-grey-300 sticky top-0 z-50", children: [_jsxs("div", { className: "flex items-center justify-between h-14 px-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("img", { src: "/logosq.png", alt: "Boby", className: "w-8 h-8 rounded" }), _jsx("span", { className: "font-bold text-text-primary", children: "Agent Portal" })] }), _jsx("button", { onClick: () => setMobileMenuOpen(!mobileMenuOpen), className: "w-10 h-10 rounded-lg bg-grey-200 flex flex-col items-center justify-center gap-1", "aria-label": "Toggle menu", children: mobileMenuOpen ? (
                                /* X close icon */
                                _jsxs("div", { className: "relative w-5 h-5", children: [_jsx("span", { className: "absolute top-1/2 left-0 w-5 h-0.5 bg-text-primary transform -translate-y-1/2 rotate-45" }), _jsx("span", { className: "absolute top-1/2 left-0 w-5 h-0.5 bg-text-primary transform -translate-y-1/2 -rotate-45" })] })) : (
                                /* Hamburger icon - 3 lines */
                                _jsxs(_Fragment, { children: [_jsx("span", { className: "w-5 h-0.5 bg-text-primary rounded-full" }), _jsx("span", { className: "w-5 h-0.5 bg-text-primary rounded-full" }), _jsx("span", { className: "w-5 h-0.5 bg-text-primary rounded-full" })] })) })] }), mobileMenuOpen && (_jsx("div", { className: "absolute top-14 left-0 right-0 bg-white border-b border-grey-300 z-50 shadow-lg", children: _jsxs("nav", { className: "p-4 space-y-1", children: [navigation.map((item) => (_jsxs(NavLink, { to: item.href, onClick: () => setMobileMenuOpen(false), className: ({ isActive }) => cn('flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full', isActive
                                        ? 'bg-primary/20 text-text-primary'
                                        : 'text-text-secondary hover:bg-grey-200'), children: [_jsx("span", { className: "w-8 h-8 rounded-lg bg-grey-200 flex items-center justify-center text-xs font-bold", children: item.marker }), item.name] }, item.name))), _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 w-full", children: [_jsx("span", { className: "w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center text-xs font-bold text-danger", children: "SO" }), "Sign Out"] })] }) }))] }), _jsxs("aside", { className: "hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen bg-white border-r border-grey-300", children: [_jsx("div", { className: "p-4 border-b border-grey-200", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: "/logosq.png", alt: "Boby", className: "w-10 h-10 rounded-lg" }), _jsx("span", { className: "font-bold text-text-primary", children: "Agent Portal" })] }) }), _jsx("nav", { className: "flex-1 p-4 space-y-1", children: navigation.map((item) => (_jsxs(NavLink, { to: item.href, className: ({ isActive }) => cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors', isActive
                                ? 'bg-primary/20 text-text-primary border-l-4 border-primary'
                                : 'text-text-secondary hover:bg-grey-100 hover:text-text-primary'), children: [_jsx("span", { className: cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold', 'bg-grey-200 group-hover:bg-grey-300'), children: item.marker }), item.name] }, item.name))) }), _jsxs("div", { className: "p-4 border-t border-grey-200", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-primary flex items-center justify-center", children: _jsx("span", { className: "text-sm font-bold text-text-primary", children: initials }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-text-primary truncate", children: displayName }), _jsx("p", { className: "text-xs text-text-muted truncate", children: user?.email })] })] }), _jsx("button", { onClick: handleLogout, className: "w-full px-3 py-2 text-sm font-medium text-danger bg-danger/10 rounded-lg hover:bg-danger/20 transition-colors", children: "Sign Out" })] })] }), _jsx("main", { className: "flex-1 min-h-screen overflow-x-hidden", children: _jsx("div", { className: "w-full", children: _jsx(Outlet, {}) }) })] }));
}
//# sourceMappingURL=Layout.js.map