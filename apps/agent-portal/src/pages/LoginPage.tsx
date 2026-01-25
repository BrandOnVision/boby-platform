/**
 * Login Page
 * 
 * Agent Portal login with brand-compliant styling
 * Uses 2-letter markers, gold accents, no emojis
 * White and crisp design per brand standards
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '@boby/ui';

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Get redirect path from location state or default to home
    const from = (location.state as { from?: string })?.from || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Email and password are required');
            return;
        }

        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
    };

    return (
        <div className="min-h-screen bg-grey-100 flex flex-col items-center justify-center p-4">
            {/* Logo */}
            <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-text-primary">B</span>
                </div>
                <h1 className="text-2xl font-bold text-text-primary">Agent Portal</h1>
                <p className="text-text-muted mt-1">Sign in to your account</p>
            </div>

            {/* Login Card */}
            <Card variant="elevated" className="w-full max-w-md p-6 bg-white">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-danger/10 border border-danger/30 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-danger/20 rounded text-xs font-bold text-danger flex items-center justify-center">
                                    ER
                                </span>
                                <span className="text-danger text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                            Email Address
                        </label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="agent@example.com"
                            autoComplete="email"
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                            Password
                        </label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                {/* Footer Links - Invitation Only Protocol */}
                <div className="mt-6 pt-6 border-t border-grey-200">
                    <p className="text-center text-sm text-text-muted">
                        Have an invitation?{' '}
                        <a href="https://getboby.ai/invitation" className="text-primary-dark hover:text-primary font-medium">
                            Activate Account
                        </a>
                    </p>
                    <p className="text-center text-xs text-text-muted mt-2">
                        BOBY Special Agents are by invitation only
                    </p>
                </div>
            </Card>

            {/* Footer */}
            <p className="mt-8 text-xs text-text-muted">
                Protected by BOBY Sovereign Identity
            </p>
        </div>
    );
}

