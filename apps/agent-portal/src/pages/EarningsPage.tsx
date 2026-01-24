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
        <div className="page-container animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
                    Earnings
                </h1>
                <p className="text-gray-500 mt-1">
                    Track your income and payment history
                </p>
            </div>

            {/* Earnings overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card variant="elevated" padding="md" className="bg-gradient-to-br from-boby-primary to-boby-secondary text-white">
                    <CardContent>
                        <p className="text-sm text-white/80 mb-1">This Week</p>
                        <p className="text-3xl font-bold">{earningsData.thisWeek}</p>
                    </CardContent>
                </Card>
                <Card variant="elevated" padding="md">
                    <CardContent>
                        <p className="text-sm text-gray-500 mb-1">This Month</p>
                        <p className="text-3xl font-bold text-gray-900">{earningsData.thisMonth}</p>
                    </CardContent>
                </Card>
                <Card variant="elevated" padding="md">
                    <CardContent>
                        <p className="text-sm text-gray-500 mb-1">Pending</p>
                        <p className="text-3xl font-bold text-boby-warning">{earningsData.pending}</p>
                    </CardContent>
                </Card>
                <Card variant="elevated" padding="md">
                    <CardContent>
                        <p className="text-sm text-gray-500 mb-1">Lifetime</p>
                        <p className="text-3xl font-bold text-boby-success">{earningsData.lifetime}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Payment history */}
            <Card variant="default" padding="lg">
                <CardTitle className="mb-6">Payment History</CardTitle>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Venue</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Hours</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPayments.map((payment) => (
                                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4 font-medium text-gray-900">{payment.venue}</td>
                                    <td className="py-4 px-4 text-gray-600">{payment.date}</td>
                                    <td className="py-4 px-4 text-gray-600">{payment.hours}h</td>
                                    <td className="py-4 px-4 font-semibold text-gray-900">{payment.amount}</td>
                                    <td className="py-4 px-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === 'Paid'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-amber-100 text-amber-800'
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
