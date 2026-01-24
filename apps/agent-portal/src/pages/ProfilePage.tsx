import { Button, Card, CardContent, CardTitle, Input, CircleBadge } from '@boby/ui';

export function ProfilePage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                    Profile
                </h1>
                <p className="text-text-muted mt-1">
                    Manage your account and credentials
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Profile card - 2-letter marker instead of emoji */}
                <Card variant="elevated" padding="lg" className="lg:col-span-1">
                    <CardContent className="text-center">
                        <div className="w-24 h-24 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center">
                            <span className="text-2xl font-bold text-text-primary">AG</span>
                        </div>
                        <h2 className="text-xl font-bold text-text-primary">Agent Name</h2>
                        <p className="text-text-muted mb-4">agent@example.com</p>
                        <div className="flex justify-center gap-2 mb-4">
                            <CircleBadge level="inner" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-grey-200">
                            <div>
                                <p className="text-2xl font-bold text-text-primary">94</p>
                                <p className="text-sm text-text-muted">Trust Score</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text-primary">127</p>
                                <p className="text-sm text-text-muted">Jobs Done</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Details form */}
                <Card variant="default" padding="lg" className="lg:col-span-2">
                    <CardTitle className="mb-6">Personal Information</CardTitle>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input label="First Name" defaultValue="Agent" />
                        <Input label="Last Name" defaultValue="Name" />
                        <Input label="Email" type="email" defaultValue="agent@example.com" />
                        <Input label="Phone" type="tel" defaultValue="+61 400 000 000" />
                        <Input label="Security Licence #" defaultValue="QLD-12345678" className="sm:col-span-2" />
                    </div>
                    <div className="flex justify-end mt-6">
                        <Button variant="primary">Save Changes</Button>
                    </div>
                </Card>

                {/* Credentials - Typography only, no emoji icons */}
                <Card variant="default" padding="lg" className="lg:col-span-3">
                    <CardTitle className="mb-6">Credentials & Certifications</CardTitle>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { name: 'Security Licence', status: 'Verified', marker: 'SL' },
                            { name: 'First Aid', status: 'Verified', marker: 'FA' },
                            { name: 'RSA', status: 'Verified', marker: 'RS' },
                            { name: 'Crowd Control', status: 'Pending', marker: 'CC' },
                        ].map((cert) => (
                            <div
                                key={cert.name}
                                className="flex items-center gap-3 p-4 rounded-lg bg-grey-100"
                            >
                                {/* 2-letter marker */}
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cert.status === 'Verified' ? 'bg-success/20' : 'bg-warning/20'
                                    }`}>
                                    <span className={`text-xs font-bold ${cert.status === 'Verified' ? 'text-success' : 'text-warning'
                                        }`}>
                                        {cert.marker}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary">{cert.name}</p>
                                    <p
                                        className={`text-sm ${cert.status === 'Verified' ? 'text-success' : 'text-warning'
                                            }`}
                                    >
                                        {cert.status}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
