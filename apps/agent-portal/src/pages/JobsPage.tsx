import { Button, Card, CardContent, CardTitle, CircleBadge } from '@boby/ui';

const availableJobs = [
    {
        id: 1,
        title: 'Door Security',
        venue: 'Skyline Rooftop Bar',
        location: 'Brisbane CBD',
        date: 'Fri, Jan 31',
        time: '8:00 PM - 4:00 AM',
        pay: '$45/hr',
        circle: 'inner' as const,
    },
    {
        id: 2,
        title: 'Event Security',
        venue: 'Convention Centre',
        location: 'South Bank',
        date: 'Sat, Feb 1',
        time: '2:00 PM - 10:00 PM',
        pay: '$42/hr',
        circle: 'mid' as const,
    },
    {
        id: 3,
        title: 'Corporate Security',
        venue: 'Tech Corp HQ',
        location: 'Fortitude Valley',
        date: 'Mon, Feb 3',
        time: '7:00 AM - 3:00 PM',
        pay: '$48/hr',
        circle: 'center' as const,
    },
];

export function JobsPage() {
    return (
        <div className="page-container animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
                        Available Jobs
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Browse and apply for security positions
                    </p>
                </div>
                <Button variant="outline" size="sm">
                    🗺️ Map View
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <Button variant="primary" size="sm">All Jobs</Button>
                <Button variant="ghost" size="sm">Door Security</Button>
                <Button variant="ghost" size="sm">Events</Button>
                <Button variant="ghost" size="sm">Corporate</Button>
                <Button variant="ghost" size="sm">Crowd Control</Button>
            </div>

            {/* Job listings */}
            <div className="space-y-4">
                {availableJobs.map((job) => (
                    <Card key={job.id} variant="default" padding="none" className="overflow-hidden">
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-boby-primary to-boby-accent flex items-center justify-center text-white text-2xl shrink-0">
                                        🏢
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900">{job.title}</h3>
                                            <CircleBadge level={job.circle} size="sm" />
                                        </div>
                                        <p className="text-gray-600">{job.venue}</p>
                                        <p className="text-sm text-gray-500">{job.location}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:items-end gap-2">
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">{job.date}</p>
                                        <p className="text-sm text-gray-500">{job.time}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-boby-success">{job.pay}</span>
                                        <Button variant="primary" size="sm">Apply</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
