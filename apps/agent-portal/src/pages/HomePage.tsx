import { Button, Card, CardContent, CardTitle, CircleBadge } from '@boby/ui';

const stats = [
    { label: 'Active Jobs', value: '3', change: '+1 this week' },
    { label: 'Hours This Week', value: '24', change: '6 remaining' },
    { label: 'Earnings (MTD)', value: '$2,480', change: '+12% vs last month' },
    { label: 'Trust Score', value: '94', change: '↑ 2 points' },
];

const upcomingShifts = [
    { id: 1, venue: 'The Grand Hotel', date: 'Today', time: '6:00 PM - 2:00 AM', role: 'Door Security' },
    { id: 2, venue: 'Riverside Events', date: 'Tomorrow', time: '4:00 PM - 12:00 AM', role: 'Event Security' },
    { id: 3, venue: 'Metro Club', date: 'Sat, Jan 25', time: '9:00 PM - 4:00 AM', role: 'Crowd Control' },
];

export function HomePage() {
    return (
        <div className="page-container animate-fade-in">
            {/* Welcome section */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
                    Welcome back, <span className="text-gradient">Agent</span>
                </h1>
                <p className="text-gray-500 mt-1">
                    Here's what's happening with your shifts today.
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <Card key={stat.label} variant="elevated" padding="md">
                        <CardContent>
                            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-xs text-boby-success mt-1">{stat.change}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Upcoming shifts */}
            <Card variant="default" padding="lg" className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <CardTitle>Upcoming Shifts</CardTitle>
                    <Button variant="ghost" size="sm">
                        View All →
                    </Button>
                </div>
                <div className="space-y-4">
                    {upcomingShifts.map((shift) => (
                        <div
                            key={shift.id}
                            className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-boby-primary/10 flex items-center justify-center text-2xl">
                                    🏢
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{shift.venue}</p>
                                    <p className="text-sm text-gray-500">{shift.role}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-gray-900">{shift.date}</p>
                                <p className="text-sm text-gray-500">{shift.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Quick actions */}
            <div className="grid sm:grid-cols-2 gap-4">
                <Card variant="glass" padding="md" interactive>
                    <CardContent className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-boby-danger/10 flex items-center justify-center text-2xl">
                            🚨
                        </div>
                        <div>
                            <CardTitle>Panic Button</CardTitle>
                            <p className="text-sm text-gray-500">Request immediate assistance</p>
                        </div>
                    </CardContent>
                </Card>
                <Card variant="glass" padding="md" interactive>
                    <CardContent className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-boby-success/10 flex items-center justify-center text-2xl">
                            ✅
                        </div>
                        <div>
                            <CardTitle>Check In</CardTitle>
                            <p className="text-sm text-gray-500">Start your shift at current location</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
