/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary Brand
                primary: {
                    DEFAULT: '#FFD952',  // BOBY Gold - Main brand color
                    dark: '#F2C94C',     // Hover states
                    light: '#FEF3C7',    // Light backgrounds
                },

                // Semantic Status
                success: {
                    DEFAULT: '#45BE5E',
                    light: '#D1FAE5',
                },
                warning: '#F2994A',
                danger: '#DC2626',
                info: '#28A2FF',

                // Neutral Palette
                text: {
                    primary: '#303030',    // Primary text - dark grey/black
                    secondary: '#505050',
                    muted: '#787878',
                },
                grey: {
                    100: '#FAFAFA',
                    200: '#F5F5F5',
                    300: '#E0E0E0',
                },

                // Trust Tier Colors (5-tier system)
                tier: {
                    1: '#FFD952',  // Gold Star - Center Circle / Highest trust
                    2: '#28A2FF',  // Blue Shield - Inner Circle
                    3: '#45BE5E',  // Green Tick - Mid Circle
                    4: '#F2994A',  // Amber - Outer Circle
                    5: '#A0A0A0',  // Grey - Public Circle
                },

                // Legacy Boby colors
                boby: {
                    gold: '#FFB800',
                    'gold-light': '#FFD052',
                    'gold-dark': '#E5A600',
                    navy: '#1a1a2e',
                    cream: '#FFF8E1',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
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
        },
    },
    plugins: [],
};
