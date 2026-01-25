/**
 * Agent Portal Dashboard - Home Page
 * 
 * Shows agent stats, upcoming shifts, and quick actions
 * Uses API hooks to fetch real data from the server
 * Brand-compliant: Gold accents, 2-letter markers, no emojis
 */

import { Button, Card, CardContent, CardTitle } from '@boby/ui';
import { useAuth } from '../context/AuthContext';
import { useJobs, useEarnings, formatCurrency } from '../hooks/useApi';

export function HomePage() {
    const { user } = useAuth();
    const { data: jobsData, isLoading: jobsLoading } = useJobs({ limit: 5 });
    const { data: earningsData, isLoading: earningsLoading } = useEarnings();

    // Build stats from API data
    const stats = [
        {
            label: 'Available Jobs',
            value: jobsLoading ? '...' : String(jobsData?.total || 0),
            change: 'Active listings'
        },
        {
            label: 'Hours This Week',
            value: '24', // TODO: Fetch from shifts API
            change: '6 remaining'
        },
        {
            label: 'Earnings (MTD)',
            value: earningsLoading ? '...' : formatCurrency(earningsData?.total_earned || 0),
            change: `${formatCurrency(earningsData?.this_week || 0)} this week`
        },
        {
            label: 'Trust Score',
            value: '94', // TODO: Fetch from profile
            change: '+2 points'
        },
    ];

    // Get display name from user
    const displayName = user?.firstName || user?.email?.split('@')[0] || 'Agent';

    // Mock shifts - TODO: Replace with API call
    const upcomingShifts = [
        { id: 1, venue: 'The Grand Hotel', date: 'Today', time: '6:00 PM - 2:00 AM', role: 'Door Security' },
        { id: 2, venue: 'Riverside Events', date: 'Tomorrow', time: '4:00 PM - 12:00 AM', role: 'Event Security' },
        { id: 3, venue: 'Metro Club', date: 'Sat, Jan 25', time: '9:00 PM - 4:00 AM', role: 'Crowd Control' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {/* Welcome section - Typography only */}
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                    Welcome back, <span className="text-primary-dark">{displayName}</span>
                </h1>
                <p className="text-text-muted mt-1">
                    Here's what's happening with your shifts today.
                </p>
            </div>

            {/* Stats grid - Clean cards, no icons */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => (
                    <Card key={stat.label} variant="elevated" padding="md">
                        <CardContent>
                            <p className="text-sm text-text-muted mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                            <p className="text-xs text-success mt-1">{stat.change}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Upcoming shifts - Typography only, 2-letter markers */}
            <Card variant="default" padding="lg" className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <CardTitle>Upcoming Shifts</CardTitle>
                    <Button variant="ghost" size="sm">
                        View All
                    </Button>
                </div>
                <div className="space-y-3">
                    {upcomingShifts.length === 0 ? (
                        <p className="text-text-muted text-center py-8">No upcoming shifts scheduled</p>
                    ) : (
                        upcomingShifts.map((shift) => (
                            <div
                                key={shift.id}
                                className="flex items-center justify-between p-4 rounded-lg bg-grey-100 hover:bg-grey-200 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {/* 2-letter marker instead of emoji */}
                                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                                        <span className="text-xs font-bold text-text-primary">VN</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-text-primary">{shift.venue}</p>
                                        <p className="text-sm text-text-muted">{shift.role}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-text-primary">{shift.date}</p>
                                    <p className="text-sm text-text-muted">{shift.time}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Quick actions - Text-based cards, no emoji icons */}
            <div className="grid sm:grid-cols-2 gap-4">
                <Card variant="default" padding="md" interactive className="border-2 border-danger/20 hover:border-danger/40">
                    <CardContent className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-danger/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-danger">SOS</span>
                        </div>
                        <div>
                            <CardTitle className="text-danger">Emergency Assistance</CardTitle>
                            <p className="text-sm text-text-muted">Request immediate support</p>
                        </div>
                    </CardContent>
                </Card>
                <Card variant="default" padding="md" interactive className="border-2 border-success/20 hover:border-success/40">
                    <CardContent className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-success">IN</span>
                        </div>
                        <div>
                            <CardTitle className="text-success">Check In</CardTitle>
                            <p className="text-sm text-text-muted">Start your shift at current location</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
