# 🌐 DNS & Subdomain Setup Plan

> **Created:** January 25, 2026  
> **Purpose:** Configure all subdomains with "Coming Soon" pages for future builds

---

## 📋 Complete URL Inventory

### Production Subdomains

| # | Subdomain | Full URL | Worker Name | Cloud Run Service | Status |
|---|-----------|----------|-------------|-------------------|--------|
| 1 | `api` | api.getboby.ai | `api-proxy` | `boby-unified` | ✅ LIVE |
| 2 | `agents` | agents.getboby.ai | `agents-proxy` | `agent-portal` | ✅ LIVE |
| 3 | `firms` | firms.getboby.ai | `firms-proxy` | `firm-portal` | 🔜 Coming Soon |
| 4 | `members` | members.getboby.ai | `members-proxy` | `member-portal` | ⏳ Coming Soon |
| 5 | `admin` | admin.getboby.ai | `admin-proxy` | `admin-portal` | ⏳ Coming Soon |
| 6 | `filing-cabinet` | filing-cabinet.getboby.ai | `cabinet-proxy` | `filing-cabinet` | ⏳ Coming Soon |
| 7 | `briefcase` | briefcase.getboby.ai | `briefcase-proxy` | `briefcase` | ⏳ Coming Soon |
| 8 | `kaksos` | kaksos.getboby.ai | `kaksos-proxy` | `kaksos` | ⏳ Coming Soon |

### Staging Subdomains

| # | Subdomain | Full URL | Worker Name | Cloud Run Service | Status |
|---|-----------|----------|-------------|-------------------|--------|
| 1 | `staging-api` | staging-api.getboby.ai | `staging-api-proxy` | `boby-unified` | ✅ LIVE |
| 2 | `staging-agents` | staging-agents.getboby.ai | `staging-agents-proxy` | `agent-portal-staging` | ✅ LIVE |
| 3 | `staging-firms` | staging-firms.getboby.ai | `staging-firms-proxy` | `firm-portal-staging` | 🔜 Coming Soon |
| 4 | `staging-members` | staging-members.getboby.ai | `staging-members-proxy` | `member-portal-staging` | ⏳ Coming Soon |
| 5 | `staging-admin` | staging-admin.getboby.ai | `staging-admin-proxy` | `admin-portal-staging` | ⏳ Coming Soon |
| 6 | `staging-cabinet` | staging-filing-cabinet.getboby.ai | `staging-cabinet-proxy` | `filing-cabinet-staging` | ⏳ Coming Soon |
| 7 | `staging-briefcase` | staging-briefcase.getboby.ai | `staging-briefcase-proxy` | `briefcase-staging` | ⏳ Coming Soon |
| 8 | `staging-kaksos` | staging-kaksos.getboby.ai | `staging-kaksos-proxy` | `kaksos-staging` | ⏳ Coming Soon |

---

## 🚀 Cloudflare DNS Setup

### Step 1: Add DNS Records (All A Records with Proxy)

For each subdomain that needs "Coming Soon":

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | `firms` | `192.0.2.1` | Proxied ☁️ |
| A | `members` | `192.0.2.1` | Proxied ☁️ |
| A | `admin` | `192.0.2.1` | Proxied ☁️ |
| A | `filing-cabinet` | `192.0.2.1` | Proxied ☁️ |
| A | `briefcase` | `192.0.2.1` | Proxied ☁️ |
| A | `kaksos` | `192.0.2.1` | Proxied ☁️ |
| A | `staging-firms` | `192.0.2.1` | Proxied ☁️ |
| A | `staging-members` | `192.0.2.1` | Proxied ☁️ |
| A | `staging-admin` | `192.0.2.1` | Proxied ☁️ |
| A | `staging-cabinet` | `192.0.2.1` | Proxied ☁️ |
| A | `staging-briefcase` | `192.0.2.1` | Proxied ☁️ |
| A | `staging-kaksos` | `192.0.2.1` | Proxied ☁️ |

### Step 2: Create "Coming Soon" Worker

Create a single Cloudflare Worker that serves coming soon pages:

**Worker Name:** `coming-soon`

```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const host = url.hostname;
    
    // Extract app name from subdomain
    const appName = host.split('.')[0].replace('staging-', '');
    
    const appNames = {
      'firms': 'Firm Portal',
      'members': 'Member Portal', 
      'admin': 'Admin Portal',
      'filing-cabinet': 'Filing Cabinet',
      'briefcase': 'Briefcase',
      'kaksos': 'Kaksos AI'
    };
    
    const displayName = appNames[appName] || 'BOBY Platform';
    const isStaging = host.includes('staging');
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${displayName} - Coming Soon | BOBY</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #FFF8E1 0%, #FFFFFF 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 500px;
    }
    .logo {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #FFD052 0%, #FFBA08 100%);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 30px;
      font-size: 48px;
      font-weight: bold;
      color: white;
    }
    h1 {
      color: #1a1a2e;
      font-size: 2rem;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #666;
      font-size: 1.2rem;
      margin-bottom: 30px;
    }
    .badge {
      display: inline-block;
      background: #FFD052;
      color: #1a1a2e;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .staging-badge {
      background: #E3F2FD;
      color: #1565C0;
      margin-top: 15px;
    }
    .footer {
      margin-top: 40px;
      color: #999;
      font-size: 0.85rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">B</div>
    <h1>${displayName}</h1>
    <p class="subtitle">Coming Soon</p>
    <span class="badge">Building Something Great</span>
    ${isStaging ? '<p><span class="badge staging-badge">Staging Environment</span></p>' : ''}
    <p class="footer">© 2026 BOBY Security Intelligence Service</p>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}
```

### Step 3: Add Worker Routes

Add these routes to the `coming-soon` worker:

| Route | Worker |
|-------|--------|
| `firms.getboby.ai/*` | `coming-soon` |
| `members.getboby.ai/*` | `coming-soon` |
| `admin.getboby.ai/*` | `coming-soon` |
| `filing-cabinet.getboby.ai/*` | `coming-soon` |
| `briefcase.getboby.ai/*` | `coming-soon` |
| `kaksos.getboby.ai/*` | `coming-soon` |
| `staging-firms.getboby.ai/*` | `coming-soon` |
| `staging-members.getboby.ai/*` | `coming-soon` |
| `staging-admin.getboby.ai/*` | `coming-soon` |
| `staging-filing-cabinet.getboby.ai/*` | `coming-soon` |
| `staging-briefcase.getboby.ai/*` | `coming-soon` |
| `staging-kaksos.getboby.ai/*` | `coming-soon` |

---

## 🔄 When You Build Each Portal

When you're ready to deploy a portal:

1. **Deploy to Cloud Run** with service name (e.g., `firm-portal`)
2. **Create a new Worker** (e.g., `firms-proxy`) with the proxy code
3. **Update the route** from `coming-soon` to the new worker
4. **Remove** the route from `coming-soon` worker

Example for Firm Portal:
```javascript
// firms-proxy Worker
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = "https://firm-portal-oybrjgfxzq-ts.a.run.app" + url.pathname + url.search;
    
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow'
    });
    
    modifiedRequest.headers.set('Host', 'firm-portal-oybrjgfxzq-ts.a.run.app');
    
    return fetch(modifiedRequest);
  }
}
```

---

## 📊 Summary Checklist

### Cloudflare DNS Records to Add
- [ ] `firms` A record → 192.0.2.1 (Proxied)
- [ ] `members` A record → 192.0.2.1 (Proxied)
- [ ] `admin` A record → 192.0.2.1 (Proxied)
- [ ] `filing-cabinet` A record → 192.0.2.1 (Proxied)
- [ ] `briefcase` A record → 192.0.2.1 (Proxied)
- [ ] `kaksos` A record → 192.0.2.1 (Proxied)
- [ ] `staging-firms` A record → 192.0.2.1 (Proxied)
- [ ] `staging-members` A record → 192.0.2.1 (Proxied)
- [ ] `staging-admin` A record → 192.0.2.1 (Proxied)
- [ ] `staging-filing-cabinet` A record → 192.0.2.1 (Proxied)
- [ ] `staging-briefcase` A record → 192.0.2.1 (Proxied)
- [ ] `staging-kaksos` A record → 192.0.2.1 (Proxied)

### Cloudflare Workers to Create
- [ ] `coming-soon` Worker with coming soon HTML
- [ ] Add all 12 routes to `coming-soon` worker

---

## 🎯 Result

After setup, all URLs will show a beautiful "Coming Soon" page:
- https://firms.getboby.ai → "Firm Portal - Coming Soon"
- https://members.getboby.ai → "Member Portal - Coming Soon"
- https://admin.getboby.ai → "Admin Portal - Coming Soon"
- https://filing-cabinet.getboby.ai → "Filing Cabinet - Coming Soon"
- https://briefcase.getboby.ai → "Briefcase - Coming Soon"
- https://kaksos.getboby.ai → "Kaksos AI - Coming Soon"
