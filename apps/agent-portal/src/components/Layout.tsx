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

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-grey-100">
            {/* Mobile Header - Only visible on mobile */}
            <header className="lg:hidden bg-white border-b border-grey-300 sticky top-0 z-50">
                <div className="flex items-center justify-between h-14 px-4">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <img
                            src="/logosq.png"
                            alt="Boby"
                            className="w-8 h-8 rounded"
                        />
                        <span className="font-bold text-text-primary">Agent Portal</span>
                    </div>

                    {/* Mobile Menu Toggle - Hamburger Icon */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="w-10 h-10 rounded-lg bg-grey-200 flex flex-col items-center justify-center gap-1"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            /* X close icon */
                            <div className="relative w-5 h-5">
                                <span className="absolute top-1/2 left-0 w-5 h-0.5 bg-text-primary transform -translate-y-1/2 rotate-45" />
                                <span className="absolute top-1/2 left-0 w-5 h-0.5 bg-text-primary transform -translate-y-1/2 -rotate-45" />
                            </div>
                        ) : (
                            /* Hamburger icon - 3 lines */
                            <>
                                <span className="w-5 h-0.5 bg-text-primary rounded-full" />
                                <span className="w-5 h-0.5 bg-text-primary rounded-full" />
                                <span className="w-5 h-0.5 bg-text-primary rounded-full" />
                            </>
                        )}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="absolute top-14 left-0 right-0 bg-white border-b border-grey-300 z-50 shadow-lg">
                        <nav className="p-4 space-y-1">
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        cn(
                                            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full',
                                            isActive
                                                ? 'bg-primary/20 text-text-primary'
                                                : 'text-text-secondary hover:bg-grey-200'
                                        )
                                    }
                                >
                                    <span className="w-8 h-8 rounded-lg bg-grey-200 flex items-center justify-center text-xs font-bold">
                                        {item.marker}
                                    </span>
                                    {item.name}
                                </NavLink>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 w-full"
                            >
                                <span className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center text-xs font-bold text-danger">
                                    SO
                                </span>
                                Sign Out
                            </button>
                        </nav>
                    </div>
                )}
            </header>

            {/* Desktop Sidebar - Hidden on mobile, visible on lg+ */}
            <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen bg-white border-r border-grey-300">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-grey-200">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logosq.png"
                            alt="Boby"
                            className="w-10 h-10 rounded-lg"
                        />
                        <span className="font-bold text-text-primary">Agent Portal</span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-4 space-y-1">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary/20 text-text-primary border-l-4 border-primary'
                                        : 'text-text-secondary hover:bg-grey-100 hover:text-text-primary'
                                )
                            }
                        >
                            <span className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                                'bg-grey-200 group-hover:bg-grey-300'
                            )}>
                                {item.marker}
                            </span>
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-grey-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-sm font-bold text-text-primary">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">
                                {displayName}
                            </p>
                            <p className="text-xs text-text-muted truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-sm font-medium text-danger bg-danger/10 rounded-lg hover:bg-danger/20 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area - Full width on mobile, flex-1 on desktop */}
            <main className="flex-1 min-h-screen overflow-x-hidden">
                {/* Full width container - no max-width constraints on mobile */}
                <div className="w-full">
                    <Outlet />
                </div>
            </main>

        </div>
    );
}
