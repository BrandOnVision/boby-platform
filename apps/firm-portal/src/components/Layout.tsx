/**
 * Firm Portal Layout Component
 * 
 * Provides consistent sidebar navigation matching BOBY brand standards
 * Same pattern as agent-portal for consistency
 */

import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Navigation items for firm portal
const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊', marker: 'DA' },
    { path: '/jobs', label: 'Jobs', icon: '💼', marker: 'JO' },
    { path: '/jobs/new', label: 'Post Job', icon: '➕', marker: 'PJ' },
    { path: '/applications', label: 'Applications', icon: '📋', marker: 'AP' },
    { path: '/agents', label: 'Agents', icon: '👥', marker: 'AG' },
    { path: '/settings', label: 'Settings', icon: '⚙️', marker: 'SE' },
];

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, firm, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-40 flex items-center px-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 mr-3"
                    aria-label="Open menu"
                >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <img src="/Bobylogo.png" alt="BOBY" className="h-8" />
                <span className="ml-2 text-sm font-medium text-gray-600">Firm Portal</span>
            </header>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
                    transform transition-transform duration-300 ease-in-out
                    lg:translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <img src="/Bobylogo.png" alt="BOBY" className="h-10" />
                </div>

                {/* Firm Badge */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3 px-2 py-2 bg-amber-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                            🏢
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {firm?.name || 'Your Firm'}
                            </p>
                            <p className="text-xs text-amber-600">Firm Portal</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/' && location.pathname.startsWith(item.path));

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={closeSidebar}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                                    transition-colors duration-150
                                    ${isActive
                                        ? 'bg-amber-50 text-amber-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                `}
                            >
                                {/* 2-Letter Marker */}
                                <span className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                                    ${isActive
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-gray-100 text-gray-500'
                                    }
                                `}>
                                    {item.marker}
                                </span>
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <span>🚪</span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
                <div className="p-4 lg:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
