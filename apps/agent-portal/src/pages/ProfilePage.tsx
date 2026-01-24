import { Button, Card, CardContent, CardTitle, Input, CircleBadge } from '@boby/ui';

export function ProfilePage() {
    return (
        <div className="page-container animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
                    Profile
                </h1>
                <p className="text-gray-500 mt-1">
                    Manage your account and credentials
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Profile card */}
                <Card variant="elevated" padding="lg" className="lg:col-span-1">
                    <CardContent className="text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-boby-primary to-boby-accent mx-auto mb-4 flex items-center justify-center text-white text-4xl">
                            👤
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Agent Name</h2>
                        <p className="text-gray-500 mb-4">agent@example.com</p>
                        <div className="flex justify-center gap-2 mb-4">
                            <CircleBadge level="inner" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            <div>
                                <p className="text-2xl font-bold text-gray-900">94</p>
                                <p className="text-sm text-gray-500">Trust Score</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">127</p>
                                <p className="text-sm text-gray-500">Jobs Done</p>
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

                {/* Credentials */}
                <Card variant="default" padding="lg" className="lg:col-span-3">
                    <CardTitle className="mb-6">Credentials & Certifications</CardTitle>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { name: 'Security Licence', status: 'Verified', icon: '🪪' },
                            { name: 'First Aid', status: 'Verified', icon: '🏥' },
                            { name: 'RSA', status: 'Verified', icon: '🍺' },
                            { name: 'Crowd Control', status: 'Pending', icon: '👥' },
                        ].map((cert) => (
                            <div
                                key={cert.name}
                                className="flex items-center gap-3 p-4 rounded-lg bg-gray-50"
                            >
                                <span className="text-2xl">{cert.icon}</span>
                                <div>
                                    <p className="font-medium text-gray-900">{cert.name}</p>
                                    <p
                                        className={`text-sm ${cert.status === 'Verified' ? 'text-boby-success' : 'text-boby-warning'
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
