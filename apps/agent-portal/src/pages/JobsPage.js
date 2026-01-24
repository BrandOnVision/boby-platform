import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Card, CardContent, CircleBadge } from '@boby/ui';
const availableJobs = [
    {
        id: 1,
        title: 'Door Security',
        venue: 'Skyline Rooftop Bar',
        location: 'Brisbane CBD',
        date: 'Fri, Jan 31',
        time: '8:00 PM - 4:00 AM',
        pay: '$45/hr',
        circle: 'inner',
    },
    {
        id: 2,
        title: 'Event Security',
        venue: 'Convention Centre',
        location: 'South Bank',
        date: 'Sat, Feb 1',
        time: '2:00 PM - 10:00 PM',
        pay: '$42/hr',
        circle: 'mid',
    },
    {
        id: 3,
        title: 'Corporate Security',
        venue: 'Tech Corp HQ',
        location: 'Fortitude Valley',
        date: 'Mon, Feb 3',
        time: '7:00 AM - 3:00 PM',
        pay: '$48/hr',
        circle: 'center',
    },
];
export function JobsPage() {
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl sm:text-3xl font-bold text-text-primary", children: "Available Jobs" }), _jsx("p", { className: "text-text-muted mt-1", children: "Browse and apply for security positions" })] }), _jsx(Button, { variant: "outline", size: "sm", children: "Map View" })] }), _jsxs("div", { className: "flex gap-2 mb-6 overflow-x-auto pb-2", children: [_jsx(Button, { variant: "primary", size: "sm", children: "All Jobs" }), _jsx(Button, { variant: "ghost", size: "sm", children: "Door Security" }), _jsx(Button, { variant: "ghost", size: "sm", children: "Events" }), _jsx(Button, { variant: "ghost", size: "sm", children: "Corporate" }), _jsx(Button, { variant: "ghost", size: "sm", children: "Crowd Control" })] }), _jsx("div", { className: "space-y-4", children: availableJobs.map((job) => (_jsx(Card, { variant: "default", padding: "none", className: "overflow-hidden", children: _jsx(CardContent, { className: "p-4 sm:p-6", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-start gap-4", children: [_jsx("div", { className: "w-12 h-12 rounded-lg bg-primary flex items-center justify-center shrink-0", children: _jsx("span", { className: "text-sm font-bold text-text-primary", children: "JB" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h3", { className: "font-semibold text-text-primary", children: job.title }), _jsx(CircleBadge, { level: job.circle, size: "sm" })] }), _jsx("p", { className: "text-text-secondary", children: job.venue }), _jsx("p", { className: "text-sm text-text-muted", children: job.location })] })] }), _jsxs("div", { className: "flex flex-col sm:items-end gap-2", children: [_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-semibold text-text-primary", children: job.date }), _jsx("p", { className: "text-sm text-text-muted", children: job.time })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "text-lg font-bold text-success", children: job.pay }), _jsx(Button, { variant: "primary", size: "sm", children: "Apply" })] })] })] }) }) }, job.id))) })] }));
}
//# sourceMappingURL=JobsPage.js.map