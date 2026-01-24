import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '@boby/ui';

const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Jobs', href: '/jobs' },
    { name: 'Earnings', href: '/earnings' },
    { name: 'Profile', href: '/profile' },
];

export function Layout() {
    return (
        <div className="min-h-screen flex flex-col bg-grey-100">
            {/* Header */}
            <header className="bg-white border-b border-grey-300 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo - Text wordmark with gold accent */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                                <span className="text-xs font-bold text-text-primary">B</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg text-text-primary leading-tight">
                                    BOBY
                                </span>
                                <span className="text-xs text-text-muted leading-tight">
                                    Agent Portal
                                </span>
                            </div>
                        </div>

                        {/* Desktop Navigation - Text only, no icons */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    className={({ isActive }) =>
                                        cn(
                                            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                            isActive
                                                ? 'bg-primary/20 text-text-primary border-b-2 border-primary'
                                                : 'text-text-secondary hover:bg-grey-200 hover:text-text-primary'
                                        )
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </nav>

                        {/* User menu - 2-letter marker instead of icon */}
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-xs font-bold text-text-primary">AG</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation - Text only at bottom */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-grey-300 z-50">
                <div className="flex justify-around">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                cn(
                                    'flex flex-col items-center py-3 px-3 text-xs font-medium transition-colors flex-1',
                                    isActive
                                        ? 'text-text-primary border-t-2 border-primary bg-primary/10'
                                        : 'text-text-muted hover:text-text-primary'
                                )
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Main content */}
            <main className="flex-1 pb-20 md:pb-0">
                <Outlet />
            </main>
        </div>
    );
}
