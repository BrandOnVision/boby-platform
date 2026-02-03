/**
 * Kaksos Portal - Dashboard Layout
 * Provides the sidebar + main content area structure
 * Mobile responsive with hamburger menu
 */

import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { user } = useAuth();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Close sidebar on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSidebarOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [sidebarOpen]);

    // Get user initials for mobile header
    const initials = user
        ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
        : '?';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row max-w-full overflow-x-hidden">
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                    <img
                        src="/Bobylogo.png"
                        alt="BOBY"
                        className="h-6"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                    Kaksos Portal
                </span>
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-800">{initials}</span>
                </div>
            </header>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className="flex-1 max-w-full overflow-x-hidden pt-14 md:pt-0">
                {children}
            </main>
        </div>
    );
}
