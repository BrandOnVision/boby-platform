# Agent Portal Deployment Guide

> **Last Updated:** January 24, 2026  
> **Current Staging URL:** https://staging-agents.getboby.ai

---

## 🌐 Infrastructure Overview

| Component | Technology | Region |
|-----------|------------|--------|
| Application | React SPA (Vite) | - |
| Hosting | Google Cloud Run | australia-southeast1 |
| Custom Domain | Cloudflare Worker | Global Edge |
| Database | PostgreSQL (Cloud SQL) | australia-southeast1 |
| DNS | Cloudflare | - |

---

## ⚠️ CRITICAL: Australia Region Domain Mapping Limitation

**Cloud Run domain mappings are NOT available in `australia-southeast1`.**

When attempting to use `gcloud beta run domain-mappings create`, you will receive:
```
ERROR: Creating domain mappings is not allowed in australia-southeast1.
status: UNIMPLEMENTED
```

**Solution:** Use Cloudflare Worker as a reverse proxy (documented below).

---

## 🚀 Deployment URLs

### Staging Environment

| URL | Type | Purpose |
|-----|------|---------|
| `https://staging-agents.getboby.ai` | Custom Domain | Primary staging URL |
| `https://agent-portal-staging-oybrjgfxzq-ts.a.run.app` | Cloud Run Direct | Bypass Cloudflare (debugging) |
| `https://staging-agents-proxy.bobyassistantoffice.workers.dev` | Worker Direct | Test worker in isolation |

### Production Environment (Future)

| URL | Type | Purpose |
|-----|------|---------|
| `https://agents.getboby.ai` | Custom Domain | Production URL |
| TBD | Cloud Run Direct | Direct access |

---

## 📦 Deploying to Cloud Run

### Prerequisites

1. Google Cloud SDK installed
2. Authenticated: `gcloud auth login`
3. Project set: `gcloud config set project boby-ecosystem`

### Build and Deploy

From the `boby-platform` directory:

```bash
# Build and submit to Cloud Run
gcloud builds submit \
  --config=cloudbuild.staging.yaml \
  --substitutions=_SERVICE_NAME=agent-portal-staging

# Or using Docker directly:
cd apps/agent-portal
docker build -t gcr.io/boby-ecosystem/agent-portal-staging .
docker push gcr.io/boby-ecosystem/agent-portal-staging
gcloud run deploy agent-portal-staging \
  --image gcr.io/boby-ecosystem/agent-portal-staging \
  --region australia-southeast1 \
  --platform managed \
  --allow-unauthenticated
```

### Allow Public Access (if 403 Forbidden)

```bash
gcloud run services add-iam-policy-binding agent-portal-staging \
  --region australia-southeast1 \
  --member="allUsers" \
  --role="roles/run.invoker"
```

---

## 🔧 Cloudflare Worker Configuration

Since Cloud Run domain mappings don't work in australia-southeast1, we use a Cloudflare Worker to proxy custom domain traffic.

### Worker Code (`staging-agents-proxy`)

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetHost = 'agent-portal-staging-oybrjgfxzq-ts.a.run.app';
    
    // Rewrite to Cloud Run URL
    url.hostname = targetHost;
    url.protocol = 'https:';
    
    // Create new headers with correct Host
    const newHeaders = new Headers(request.headers);
    newHeaders.set('Host', targetHost);
    
    // Create new request
    const modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: newHeaders,
      body: request.body,
      redirect: 'follow'
    });
    
    return fetch(modifiedRequest);
  }
}
```

### Setting Up a New Custom Domain

1. **Create Worker**
   - Go to Cloudflare Dashboard → Workers & Pages
   - Create new Worker with the proxy code above
   - Deploy the worker

2. **Add Custom Domain**
   - Go to Worker Settings → Domains & Routes
   - Click "+ Add" → "Custom domain"
   - Enter the subdomain (e.g., `staging-agents.getboby.ai`)
   - Cloudflare will auto-configure DNS

3. **⚠️ Important: Do NOT use Routes + CNAME**
   - Using a Route with a separate CNAME causes `ERR_CONNECTION_CLOSED`
   - Always use "Custom Domain" feature which handles both DNS and routing

### Troubleshooting Worker Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Hello World!" on worker URL | Code not deployed | Click "Deploy" in editor |
| `ERR_CONNECTION_CLOSED` | Route + CNAME conflict | Delete CNAME, use Custom Domain instead |
| Preview works, live doesn't | Worker not saved | Click "Deploy", not just "Save" |
| 404 from Google | Host header wrong | Ensure `newHeaders.set('Host', targetHost)` is present |

---

## 🔄 Rollback Procedure

### Cloud Run Rollback

```bash
# List revisions
gcloud run revisions list --service agent-portal-staging --region australia-southeast1

# Rollback to specific revision
gcloud run services update-traffic agent-portal-staging \
  --to-revisions=agent-portal-staging-00005-abc=100 \
  --region australia-southeast1
```

### Worker Rollback

1. Go to Workers & Pages → staging-agents-proxy → Deployments
2. Find previous working deployment
3. Click "..." → "Rollback to this deployment"

---

## 🏗️ Production Deployment (Future)

When ready for production:

1. **Create production Cloud Run service:**
   ```bash
   gcloud run deploy agent-portal \
     --image gcr.io/boby-ecosystem/agent-portal:latest \
     --region australia-southeast1 \
     --platform managed \
     --allow-unauthenticated \
     --min-instances 1
   ```

2. **Create production Cloudflare Worker** (`agents-proxy`)
   - Same code as staging, but pointing to production Cloud Run URL
   - Add custom domain: `agents.getboby.ai`

3. **Update DNS** (if needed)
   - Delete any existing A/CNAME records for `agents`
   - Use Worker "Custom Domain" feature

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing locally
- [ ] Environment variables configured
- [ ] @boby/ui package built (`pnpm --filter @boby/ui build`)
- [ ] Dockerfile includes UI package build step

### Deployment
- [ ] `gcloud builds submit` successful
- [ ] Cloud Run service updated
- [ ] Check direct Cloud Run URL works

### Post-Deployment
- [ ] Verify custom domain works
- [ ] Test login functionality
- [ ] Check mobile responsiveness
- [ ] Monitor for errors in Cloud Run logs

---

## 🔐 Environment Variables

### Cloud Run (set via Console or gcloud)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://boby-unified-....run.app` |
| `NODE_ENV` | Environment | `production` |

### Local Development

See `apps/agent-portal/.env.example` for required variables.

---

## 📝 Related Documentation

- **BUILD_STATUS.md** - Current project status
- **DEVELOPMENT_ROADMAP.md** - Phase planning and standards
- **BRAND_STYLE_GUIDE.md** - Logo assets and design standards
