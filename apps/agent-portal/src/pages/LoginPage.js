import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const from = location.state?.from || '/';
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Email and password are required');
            return;
        }
        try {
            await login(email, password);
            navigate(from, { replace: true });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-grey-100 flex flex-col items-center justify-center p-4", children: [_jsxs("div", { className: "mb-8 text-center", children: [_jsx("div", { className: "w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4", children: _jsx("span", { className: "text-2xl font-bold text-text-primary", children: "B" }) }), _jsx("h1", { className: "text-2xl font-bold text-text-primary", children: "Agent Portal" }), _jsx("p", { className: "text-text-muted mt-1", children: "Sign in to your account" })] }), _jsxs(Card, { variant: "elevated", className: "w-full max-w-md p-6 bg-white", children: [_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx("div", { className: "bg-danger/10 border border-danger/30 rounded-lg p-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-6 h-6 bg-danger/20 rounded text-xs font-bold text-danger flex items-center justify-center", children: "ER" }), _jsx("span", { className: "text-danger text-sm", children: error })] }) })), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-text-secondary mb-1", children: "Email Address" }), _jsx(Input, { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "agent@example.com", autoComplete: "email" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-text-secondary mb-1", children: "Password" }), _jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Enter your password", autoComplete: "current-password" })] }), _jsx(Button, { type: "submit", variant: "primary", className: "w-full", disabled: isLoading, children: isLoading ? 'Signing in...' : 'Sign In' })] }), _jsxs("div", { className: "mt-6 pt-6 border-t border-grey-200", children: [_jsxs("p", { className: "text-center text-sm text-text-muted", children: ["Have an invitation?", ' ', _jsx("a", { href: "https://getboby.ai/invitation", className: "text-primary-dark hover:text-primary font-medium", children: "Activate Account" })] }), _jsx("p", { className: "text-center text-xs text-text-muted mt-2", children: "BOBY Special Agents are by invitation only" })] })] }), _jsx("p", { className: "mt-8 text-xs text-text-muted", children: "Protected by BOBY Sovereign Identity" })] }));
}
//# sourceMappingURL=LoginPage.js.map