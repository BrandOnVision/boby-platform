import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '@boby/ui';
const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Jobs', href: '/jobs' },
    { name: 'Earnings', href: '/earnings' },
    { name: 'Profile', href: '/profile' },
];
export function Layout() {
    return (_jsxs("div", { className: "min-h-screen flex flex-col bg-grey-100", children: [_jsx("header", { className: "bg-white border-b border-grey-300 sticky top-0 z-50", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex items-center justify-between h-16", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded bg-primary flex items-center justify-center", children: _jsx("span", { className: "text-xs font-bold text-text-primary", children: "B" }) }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "font-bold text-lg text-text-primary leading-tight", children: "BOBY" }), _jsx("span", { className: "text-xs text-text-muted leading-tight", children: "Agent Portal" })] })] }), _jsx("nav", { className: "hidden md:flex items-center gap-1", children: navigation.map((item) => (_jsx(NavLink, { to: item.href, className: ({ isActive }) => cn('px-4 py-2 rounded-lg text-sm font-medium transition-colors', isActive
                                        ? 'bg-primary/20 text-text-primary border-b-2 border-primary'
                                        : 'text-text-secondary hover:bg-grey-200 hover:text-text-primary'), children: item.name }, item.name))) }), _jsx("div", { className: "flex items-center gap-4", children: _jsx("div", { className: "w-8 h-8 rounded-full bg-primary flex items-center justify-center", children: _jsx("span", { className: "text-xs font-bold text-text-primary", children: "AG" }) }) })] }) }) }), _jsx("nav", { className: "md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-grey-300 z-50", children: _jsx("div", { className: "flex justify-around", children: navigation.map((item) => (_jsx(NavLink, { to: item.href, className: ({ isActive }) => cn('flex flex-col items-center py-3 px-3 text-xs font-medium transition-colors flex-1', isActive
                            ? 'text-text-primary border-t-2 border-primary bg-primary/10'
                            : 'text-text-muted hover:text-text-primary'), children: item.name }, item.name))) }) }), _jsx("main", { className: "flex-1 pb-20 md:pb-0", children: _jsx(Outlet, {}) })] }));
}
//# sourceMappingURL=Layout.js.map