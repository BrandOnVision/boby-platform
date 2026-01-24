/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                // Boby Brand Colors - extracted from existing platform
                boby: {
                    primary: '#2563eb',      // Blue - main brand color
                    secondary: '#1e40af',    // Darker blue
                    accent: '#3b82f6',       // Lighter blue
                    gold: '#f59e0b',         // Gold for premium/trust
                    success: '#10b981',      // Green for success states
                    warning: '#f59e0b',      // Amber for warnings
                    danger: '#ef4444',       // Red for danger/errors
                    dark: '#1f2937',         // Dark gray for backgrounds
                    light: '#f9fafb',        // Light gray for backgrounds
                },
                // Trust Circle Colors
                circle: {
                    center: '#8b5cf6',       // Purple - highest trust
                    inner: '#3b82f6',        // Blue
                    mid: '#10b981',          // Green
                    outer: '#f59e0b',        // Amber
                    public: '#6b7280',       // Gray - public
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
