/**
 * Kaksos Portal - Sidebar Navigation
 * Main navigation component with user profile
 * Mobile responsive with drawer behavior
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Navigation item type
interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
    external?: boolean;
    disabled?: boolean;
}

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

// Navigation items matching the spec
const NAV_ITEMS: NavItem[] = [
    {
        label: 'Conversations',
        path: '/conversations',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        ),
    },
    {
        label: 'Circle Management',
        path: '/circles',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        label: 'Plant Seeds',
        path: '/plant-seeds',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
    },
    {
        label: 'Nurture',
        path: '/nurture',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
    },
    {
        label: 'Watch Grow',
        path: '/watch-grow',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
    },
    {
        label: 'Seeds Library',
        path: '/seeds-library',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
        ),
    },
    {
        label: 'Settings',
        path: '/settings',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

// External links
const EXTERNAL_LINKS: NavItem[] = [
    {
        label: 'Membership Portal',
        path: 'https://getboby.ai/membership-portal.html',
        external: true,
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
];

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const { user, logout } = useAuth();

    // Get user initials for avatar
    const initials = user
        ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase()
        : '?';

    // Handle nav item click (closes sidebar on mobile)
    const handleNavClick = () => {
        if (onClose) onClose();
    };

    return (
        <aside
            className={`
                w-[280px] md:w-64 bg-white border-r border-gray-200 flex flex-col h-screen
                fixed md:relative top-0 left-0 z-50
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
        >
            {/* Logo Section - with close button on mobile */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                <NavLink to="/" className="flex items-center gap-3" onClick={handleNavClick}>
                    <img
                        src="/Bobylogo.png"
                        alt="BOBY"
                        className="h-8"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                    <span className="font-semibold text-gray-800">Kaksos Portal</span>
                </NavLink>
                {/* Close button - mobile only */}
                <button
                    onClick={onClose}
                    className="md:hidden p-2 -mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close menu"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
                <ul className="space-y-1 px-3">
                    {/* Dashboard Link */}
                    <li>
                        <NavLink
                            to="/"
                            end
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-primary text-gray-800'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                }`
                            }
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            <span>Overview</span>
                        </NavLink>
                    </li>

                    {/* Divider */}
                    <li className="pt-4 pb-2">
                        <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Growing Your Kaksos
                        </span>
                    </li>

                    {/* Main Navigation Items */}
                    {NAV_ITEMS.map((item) => (
                        <li key={item.path}>
                            {item.disabled ? (
                                <div
                                    className="flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
                                    title="Coming soon"
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                    <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                                        Soon
                                    </span>
                                </div>
                            ) : (
                                <NavLink
                                    to={item.path}
                                    onClick={handleNavClick}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? 'bg-primary text-gray-800'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                        }`
                                    }
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </NavLink>
                            )}
                        </li>
                    ))}

                    {/* External Links Divider */}
                    <li className="pt-4 pb-2">
                        <span className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Portals
                        </span>
                    </li>

                    {/* External Links */}
                    {EXTERNAL_LINKS.map((item) => (
                        <li key={item.path}>
                            <a
                                href={item.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleNavClick}
                                className="flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                            >
                                {item.icon}
                                <span>{item.label}</span>
                                <svg className="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Profile Section */}
            <div className="border-t border-gray-200 p-4">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-800">{initials}</span>
                    </div>
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                        </p>
                    </div>
                    {/* Logout Button */}
                    <button
                        onClick={logout}
                        className="p-2.5 md:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sign out"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    );
}
