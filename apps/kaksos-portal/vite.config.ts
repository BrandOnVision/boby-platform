import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3003, // Different port than agent-portal (3001) and firm-portal (3002)
        host: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});
