/**
 * Firm Portal - Agents Page
 * View agents linked to the firm
 */

import { Card, CardContent, EmptyState } from '@boby/ui';

export default function AgentsPage() {
    // Placeholder - would load linked agents from API

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Agents</h1>
                <p className="text-gray-500">Security personnel linked to your firm</p>
            </div>

            {/* Coming Soon */}
            <Card>
                <CardContent className="p-8">
                    <EmptyState
                        icon="👥"
                        title="Agent Management Coming Soon"
                        description="View and manage security agents who have worked with your firm. This feature is under development."
                    />
                </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">🔗 Linked Agents</h3>
                        <p className="text-sm text-gray-600">
                            Agents who have completed jobs with your firm will appear here.
                            You can view their profiles, ratings, and past performance.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">⭐ Trusted Network</h3>
                        <p className="text-sm text-gray-600">
                            Build your trusted network by saving agents you've worked well with.
                            They'll get priority notifications for your job posts.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
