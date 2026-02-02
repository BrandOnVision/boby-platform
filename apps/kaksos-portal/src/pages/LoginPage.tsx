/**
 * Kaksos Portal - Login Page
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, useToast } from '@boby/ui';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { addToast } = useToast();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Please enter your email and password',
            });
            return;
        }

        setIsLoading(true);

        try {
            await login(email.trim(), password);

            addToast({
                type: 'success',
                title: 'Welcome back!',
                message: 'You have been logged in successfully.',
            });

            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            addToast({
                type: 'error',
                title: 'Login Failed',
                message: error instanceof Error ? error.message : 'Invalid credentials',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-amber-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img
                        src="/Bobylogo.png"
                        alt="BOBY"
                        className="h-16 mx-auto mb-4"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                    <h1 className="text-xl font-semibold text-gray-800">Kaksos Portal</h1>
                    <p className="text-gray-500 text-sm">AI Twin Management</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                            disabled={isLoading}
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 mb-3">
                            Manage your AI Twin and digital consciousness.
                        </p>
                        <a
                            href="https://getboby.ai/kaksos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                        >
                            Learn about Kaksos →
                        </a>
                    </div>
                </div>

                {/* Other Portal Links */}
                <div className="mt-6 text-center space-y-2">
                    <p className="text-sm text-gray-500">
                        Looking for another portal?{' '}
                        <a
                            href="https://agents.getboby.ai"
                            className="text-amber-600 hover:underline font-medium"
                        >
                            Agents
                        </a>
                        {' | '}
                        <a
                            href="https://firms.getboby.ai"
                            className="text-amber-600 hover:underline font-medium"
                        >
                            Firms
                        </a>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-8">
                    © {new Date().getFullYear()} BOBY Security Intelligence Service
                </p>
            </div>
        </div>
    );
}
