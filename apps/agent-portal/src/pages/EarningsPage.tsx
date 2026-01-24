import { Card, CardContent, CardTitle } from '@boby/ui';

const earningsData = {
    thisWeek: '$840',
    thisMonth: '$2,480',
    pending: '$320',
    lifetime: '$18,450',
};

const recentPayments = [
    { id: 1, venue: 'The Grand Hotel', date: 'Jan 20', hours: 8, amount: '$360', status: 'Paid' },
    { id: 2, venue: 'Metro Club', date: 'Jan 18', hours: 7, amount: '$315', status: 'Paid' },
    { id: 3, venue: 'Riverside Events', date: 'Jan 15', hours: 6, amount: '$252', status: 'Paid' },
    { id: 4, venue: 'The Grand Hotel', date: 'Jan 22', hours: 8, amount: '$320', status: 'Pending' },
];

export function EarningsPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                    Earnings
                </h1>
                <p className="text-text-muted mt-1">
                    Track your income and payment history
                </p>
            </div>

            {/* Earnings overview - Clean cards with gold accent for primary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card variant="elevated" padding="md" className="bg-primary border-none">
                    <CardContent>
                        <p className="text-sm text-text-primary/70 mb-1">This Week</p>
                        <p className="text-3xl font-bold text-text-primary">{earningsData.thisWeek}</p>
                    </CardContent>
                </Card>
                <Card variant="elevated" padding="md">
                    <CardContent>
                        <p className="text-sm text-text-muted mb-1">This Month</p>
                        <p className="text-3xl font-bold text-text-primary">{earningsData.thisMonth}</p>
                    </CardContent>
                </Card>
                <Card variant="elevated" padding="md">
                    <CardContent>
                        <p className="text-sm text-text-muted mb-1">Pending</p>
                        <p className="text-3xl font-bold text-warning">{earningsData.pending}</p>
                    </CardContent>
                </Card>
                <Card variant="elevated" padding="md">
                    <CardContent>
                        <p className="text-sm text-text-muted mb-1">Lifetime</p>
                        <p className="text-3xl font-bold text-success">{earningsData.lifetime}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Payment history - Clean table, no icons */}
            <Card variant="default" padding="lg">
                <CardTitle className="mb-6">Payment History</CardTitle>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-grey-300">
                                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Venue</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Hours</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Amount</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-text-muted">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPayments.map((payment) => (
                                <tr key={payment.id} className="border-b border-grey-200 hover:bg-grey-100">
                                    <td className="py-4 px-4 font-medium text-text-primary">{payment.venue}</td>
                                    <td className="py-4 px-4 text-text-secondary">{payment.date}</td>
                                    <td className="py-4 px-4 text-text-secondary">{payment.hours}h</td>
                                    <td className="py-4 px-4 font-semibold text-text-primary">{payment.amount}</td>
                                    <td className="py-4 px-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${payment.status === 'Paid'
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-warning/10 text-warning'
                                                }`}
                                        >
                                            {payment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
