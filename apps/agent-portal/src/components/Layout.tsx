import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '@boby/ui';

const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Jobs', href: '/jobs', icon: '💼' },
    { name: 'Earnings', href: '/earnings', icon: '💰' },
    { name: 'Profile', href: '/profile', icon: '👤' },
];

export function Layout() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🛡️</span>
                            <span className="font-display font-bold text-xl text-boby-primary">
                                Boby
                            </span>
                            <span className="text-sm text-gray-500 hidden sm:inline">
                                Agent Portal
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    className={({ isActive }) =>
                                        cn(
                                            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                                            isActive
                                                ? 'bg-boby-primary/10 text-boby-primary'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        )
                                    }
                                >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.name}
                                </NavLink>
                            ))}
                        </nav>

                        {/* User menu placeholder */}
                        <div className="flex items-center gap-4">
                            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                🔔
                            </button>
                            <div className="w-8 h-8 rounded-full bg-boby-primary/20 flex items-center justify-center text-boby-primary font-medium">
                                A
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <div className="flex justify-around">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                cn(
                                    'flex flex-col items-center py-2 px-3 text-xs font-medium transition-colors',
                                    isActive
                                        ? 'text-boby-primary'
                                        : 'text-gray-500 hover:text-gray-900'
                                )
                            }
                        >
                            <span className="text-xl mb-1">{item.icon}</span>
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
