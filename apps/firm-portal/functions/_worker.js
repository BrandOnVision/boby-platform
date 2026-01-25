/**
 * Cloudflare Worker entry point for Firm Portal
 * Serves the SPA and handles all routes
 */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Handle API proxy (if needed in future)
        if (url.pathname.startsWith('/api/')) {
            // Proxy to API server
            const apiUrl = 'https://api.getboby.ai' + url.pathname + url.search;
            return fetch(apiUrl, {
                method: request.method,
                headers: request.headers,
                body: request.body,
            });
        }

        // For SPA: Return index.html for all non-asset routes
        // Assets are served automatically by Cloudflare Pages/Workers
        try {
            // Try to get the asset
            const response = await env.ASSETS.fetch(request);

            // If not found and not an asset, return index.html
            if (response.status === 404) {
                const isAsset = url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
                if (!isAsset) {
                    const indexPath = new URL('/index.html', request.url);
                    return env.ASSETS.fetch(new Request(indexPath));
                }
            }

            return response;
        } catch (e) {
            // Fallback to index.html for SPA routing
            const indexPath = new URL('/index.html', request.url);
            return env.ASSETS.fetch(new Request(indexPath));
        }
    },
};
