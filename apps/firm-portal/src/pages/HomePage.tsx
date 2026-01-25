/**
 * Firm Portal Dashboard (Home Page)
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Button, Skeleton } from '@boby/ui';
import { useAuth } from '../context/AuthContext';
import { firmApi } from '../lib/api';

interface DashboardStats {
    totalJobs: number;
    activeJobs: number;
    pendingApplications: number;
    totalAgents: number;
}

export default function HomePage() {
    const { user, firm, firmId } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            if (!firmId) {
                setIsLoading(false);
                return;
            }

            try {
                const data = await firmApi.getStats(firmId);
                setStats(data);
            } catch (error) {
                console.error('Failed to load stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadStats();
    }, [firmId]);

    const statCards = [
        {
            label: 'Active Jobs',
            value: stats?.activeJobs ?? 0,
            icon: '💼',
            color: 'bg-green-50 text-green-700',
            link: '/jobs?status=active',
        },
        {
            label: 'Pending Applications',
            value: stats?.pendingApplications ?? 0,
            icon: '📋',
            color: 'bg-amber-50 text-amber-700',
            link: '/applications',
        },
        {
            label: 'Linked Agents',
            value: stats?.totalAgents ?? 0,
            icon: '👥',
            color: 'bg-blue-50 text-blue-700',
            link: '/agents',
        },
        {
            label: 'Total Jobs Posted',
            value: stats?.totalJobs ?? 0,
            icon: '📊',
            color: 'bg-purple-50 text-purple-700',
            link: '/jobs',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user?.firstName || 'Partner'}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {firm ? (
                            <>Managing <span className="font-medium text-amber-600">{firm.name}</span></>
                        ) : (
                            `Here's what's happening today`
                        )}
                    </p>
                </div>
                <Link to="/jobs/new">
                    <Button>
                        ➕ Post New Job
                    </Button>
                </Link>
            </div>

            {/* Firm Status Banner */}
            {firm && (
                <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white text-xl font-bold">
                                    {firm.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{firm.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        {firm.masterLicenceNumber && (
                                            <span>Licence: {firm.masterLicenceNumber} • </span>
                                        )}
                                        <span className={
                                            firm.subscriptionStatus === 'active'
                                                ? 'text-green-600'
                                                : 'text-amber-600'
                                        }>
                                            {firm.subscriptionStatus === 'active' ? '✓ Active' : '⏳ ' + firm.subscriptionStatus}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <Link to="/settings">
                                <Button variant="outline" size="sm">
                                    ⚙️ Settings
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <Link key={stat.label} to={stat.link}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardContent className="p-4">
                                {isLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton height="2rem" width="60%" />
                                        <Skeleton height="1rem" width="80%" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-2xl">{stat.icon}</span>
                                            <span className={`text-2xl font-bold ${stat.color.split(' ')[1]}`}>
                                                {stat.value}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{stat.label}</p>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link to="/jobs/new">
                            <div className="p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors cursor-pointer">
                                <span className="text-2xl mb-2 block">📝</span>
                                <h3 className="font-medium text-gray-900">Post a Job</h3>
                                <p className="text-sm text-gray-500">Find security personnel</p>
                            </div>
                        </Link>
                        <Link to="/applications">
                            <div className="p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors cursor-pointer">
                                <span className="text-2xl mb-2 block">👀</span>
                                <h3 className="font-medium text-gray-900">Review Applications</h3>
                                <p className="text-sm text-gray-500">
                                    {stats?.pendingApplications || 0} pending
                                </p>
                            </div>
                        </Link>
                        <Link to="/agents">
                            <div className="p-4 border border-gray-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors cursor-pointer">
                                <span className="text-2xl mb-2 block">🤝</span>
                                <h3 className="font-medium text-gray-900">Manage Agents</h3>
                                <p className="text-sm text-gray-500">View linked agents</p>
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* No Firm Warning */}
            {!firmId && !isLoading && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <span className="text-3xl">⚠️</span>
                            <div>
                                <h3 className="font-semibold text-amber-800">
                                    No Firm Linked
                                </h3>
                                <p className="text-amber-700 mt-1">
                                    Your account is not linked to a firm yet. If you've recently
                                    registered, please complete the onboarding process or contact
                                    support to finish your firm setup.
                                </p>
                                <div className="mt-4 flex gap-3">
                                    <a
                                        href="https://getboby.ai/partner"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button size="sm">
                                            Become a Partner
                                        </Button>
                                    </a>
                                    <a href="mailto:support@getboby.ai">
                                        <Button variant="outline" size="sm">
                                            Contact Support
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
