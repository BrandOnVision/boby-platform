/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
        '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // Boby Brand Colors
                boby: {
                    primary: '#2563eb',
                    secondary: '#1e40af',
                    accent: '#3b82f6',
                    gold: '#f59e0b',
                    success: '#10b981',
                    warning: '#f59e0b',
                    danger: '#ef4444',
                    dark: '#1f2937',
                    light: '#f9fafb',
                },
                // Trust Circle Colors
                circle: {
                    center: '#8b5cf6',
                    inner: '#3b82f6',
                    mid: '#10b981',
                    outer: '#f59e0b',
                    public: '#6b7280',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            boxShadow: {
                'boby': '0 4px 14px 0 rgba(37, 99, 235, 0.15)',
                'boby-lg': '0 10px 40px 0 rgba(37, 99, 235, 0.2)',
            },
        },
    },
    plugins: [],
};
