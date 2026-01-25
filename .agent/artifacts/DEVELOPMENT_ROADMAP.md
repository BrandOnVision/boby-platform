# 🗺️ Boby Platform Development Roadmap

> **Tech Lead:** AI Assistant  
> **Product Owner/UX:** Brand (User)  
> **Created:** January 24, 2026  
> **Last Updated:** January 24, 2026  
> **Beta Launch Target:** February 14, 2026  
> **Full Launch Target:** March 2026

---

## 📋 Session Progress Log

### January 24, 2026 - Agent Portal Foundation Complete

**Major Accomplishments:**
- ✅ **Authentication Flow** - Full JWT auth via `/api/membership/login`, protected routes, logout
- ✅ **Sidebar Layout** - Desktop sidebar with 2-letter markers, mobile slide-out navigation
- ✅ **Brand Standards** - White/crisp styling (NOT dark), invitation-only protocol on login
- ✅ **PostgreSQL Integration** - Cloud SQL Auth Proxy configured, all pages use production PostgreSQL
- ✅ **All Core Pages** - Login, Dashboard, Jobs, Earnings, Profile fully functional with real API data
- ✅ **MeMe Identity Vault** - Profile integrates with peelers table (single source of truth)
- ✅ **Staging Deployment** - Live at `staging-agents.getboby.ai` via Cloud Run + Cloudflare Worker

**Deployment Infrastructure:**

| URL | Status |
|-----|--------|
| `https://staging-agents.getboby.ai` | ✅ **LIVE** (Custom Domain) |
| `https://agent-portal-staging-oybrjgfxzq-ts.a.run.app` | ✅ Working (Direct) |

**Critical Standards Established:**
- 🚫 NO SQLite - Ever, not even for local development
- 🚫 NO Header Tabs - Sidebar pattern only for all portals
- 🚫 NO Dark Backgrounds - White/crisp brand identity
- 🚫 NO Bottom Nav on Mobile - Slide-out sidebar only
- ✅ PostgreSQL ONLY with Cloud SQL Auth Proxy for local dev
- ✅ Peeler First Protocol - Single identity across all portals
- ✅ Cloudflare Worker for custom domains (australia-southeast1 doesn't support Cloud Run domain mappings)

**Remaining for Phase 1:**
- [ ] Job application flow
- [ ] Job detail page (`/jobs/:id`)
- [ ] Credentials/Belts display
- [ ] Settings page
- [x] ~~Staging deployment~~ ✅ COMPLETED

---

## 📐 Architecture Philosophy

### Build WIDE, Not HIGH

```
❌ WRONG: Building High (Vertical)         ✅ RIGHT: Building Wide (Horizontal)
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│         Agent Portal            │       │  Shared Foundation (Packages)   │
│  ┌───────────────────────────┐  │       ├─────────────────────────────────┤
│  │ Auth + API + UI + State   │  │       │ @boby/ui │ @boby/auth │ @boby/  │
│  │ All tightly coupled       │  │       │          │            │ api     │
│  │ Hard to reuse             │  │       ├──────────┴────────────┴─────────┤
│  │ Duplicated in next app    │  │       │     Apps Built on Foundation    │
│  └───────────────────────────┘  │       │ Agent │ Firm │ Member │ Mobile  │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

### Core Principles

1. **Foundation First** - Build packages before apps
2. **Reusable by Design** - Every component serves multiple apps
3. **Type-Safe Contracts** - TypeScript interfaces define boundaries
4. **Offline-Ready** - Mobile-first, sync-second architecture
5. **Brand Consistent** - One design system, enforced everywhere
6. **Identity-Centric** - Wardrobe/Filing Cabinet/Briefcase are core infrastructure

---

## 🎨 Critical Development Standards

### Layout Pattern: Sidebar (NOT Header Tabs)

**ALL portals MUST use the sidebar navigation pattern** to maintain consistency with the existing membership portal:

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  ┌─────────┐  ┌────────────────────────────────────────┐ │
│  │ SIDEBAR │  │                                        │ │
│  │         │  │           MAIN CONTENT                 │ │
│  │ Logo    │  │                                        │ │
│  │ Nav     │  │   Full width on mobile                 │ │
│  │ User    │  │   Flexible grid on desktop             │ │
│  │         │  │                                        │ │
│  └─────────┘  └────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Implementation Requirements:**
- Desktop (lg+): Fixed sidebar on left, content on right
- Tablet (md): Collapsible sidebar with hamburger menu
- Mobile: Hidden sidebar, bottom navigation bar + hamburger for full menu

### Mobile-First Responsiveness

**EVERY component and page MUST be built mobile-first:**

1. **Full-Width by Default** - Content uses 100% of available screen width
2. **No Side Gutters on Mobile** - Remove excessive padding that wastes screen space
3. **Bottom Navigation** - Fixed bottom nav for primary routes on mobile
4. **Touch-Friendly** - All interactive elements minimum 44px touch target
5. **Safe Area Insets** - Account for notches and home indicators
6. **Overflow Handling** - Tables/wide content use horizontal scroll with visible indicators

```css
/* Standard responsive breakpoints */
/* Mobile first, then scale up */
@screen sm { /* 640px+ */ }
@screen md { /* 768px+ */ }
@screen lg { /* 1024px - Sidebar appears */ }
@screen xl { /* 1280px+ */ }
```

### 🚨 MANDATORY: Official Logo Assets

**ALL new apps MUST include official logo assets from DAY ONE - no placeholders.**

| Asset | Filename | Purpose |
|-------|----------|---------|
| **logosq.png** | Square badge icon | Favicon, app icons, mobile headers |
| **Bobylogo.png** | Full horizontal logo | Desktop headers, login pages, splash screens |

**When scaffolding ANY new app:**

1. Copy `logosq.png` and `Bobylogo.png` to `/public/` immediately
2. Set favicon in `index.html` before writing any code:
   ```html
   <link rel="icon" type="image/png" href="/logosq.png" />
   ```
3. Use actual logo images in components - no CSS "B" letter substitutes

**See BRAND_STYLE_GUIDE.md for complete sizing and usage standards.**

### Invitation-Only Protocol

**BOBY uses an invitation-only access model** - there is NO public registration:

| Portal | Who Can Invite | Requirements |
|--------|---------------|--------------|
| **Firm Portal** | BOBY Admin Only | Must be approved security firm |
| **Agent Portal** | Firms or Team Leaders | Must have valid invitation code |
| **Member Portal** | Self-registration via TelePathCode scan | Public limited access |

**Login Page Copy:**
- ❌ WRONG: "Don't have an account? Join BOBY"
- ✅ RIGHT: "Have an invitation? Activate Account"
- ✅ INCLUDE: "BOBY Special Agents are by invitation only"

### Peeler First Protocol

**ALL users are Peelers first** - unified identity across all portals:

1. Single Sign-On across all Boby applications
2. Credentials stored in MeMe Identity Vault
3. Roles (Hats) determine portal access level
4. TelePathCode is the universal identity token

### Database Standard: PostgreSQL ONLY

**⚠️ CRITICAL: ALL development MUST use PostgreSQL** - NO SQLite, even for local development.

**Why This Matters:**
The Boby platform previously suffered significant migration pain when moving from SQLite to PostgreSQL. Different SQL dialects, type systems, and behaviors caused bugs that only appeared in production. This is now a **hard rule**.

| Issue | SQLite | PostgreSQL | Result |
|-------|--------|------------|--------|
| UUID Handling | TEXT | Native UUID | Casting errors |
| Type System | Dynamic | Strict | Hidden bugs |
| Date Functions | `datetime('now')` | `NOW()` | Query failures |
| JSON Operations | `json_extract()` | `->`, `->>` | Syntax errors |
| Concurrency | File locks | MVCC | Deadlocks |

**Development Database Options:**
1. **Direct Cloud SQL** - Connect to staging/production PostgreSQL (recommended)
2. **Docker PostgreSQL** - `docker run -p 5432:5432 postgres`
3. **Local PostgreSQL** - Native installation

**Environment Variables Required:**
```bash
DATABASE_URL=postgresql://user:pass@host:5432/boby_db
```

**Verification Checklist:**
- [ ] Server startup shows `✓ Database: Connected (PostgreSQL)` NOT `(SQLite)`
- [ ] All queries use PostgreSQL syntax
- [ ] UUID columns use `uuid` type, not `text`
- [ ] Date operations use `NOW()`, `CURRENT_TIMESTAMP`

---

## 🗄️ Identity Infrastructure Overview

These core identity systems are already designed in the database schema. The new platform will fully realize them in the UI.

### The Three Pillars

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PEELER (The Person)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   👔 WARDROBE                 📋 BRIEFCASE               🗄️ FILING CABINET  │
│   What they carry             Portable identity          Access control     │
│   ├── Hats (Roles)            ├── TelePathCode           ├── Drawers        │
│   ├── Belts (Certs)           ├── Credentials            │   (Public,       │
│   ├── Shoes (Mobility)        └── Trust Score            │    Members,      │
│   └── Keys (Access)                                      │    Staff, etc.)  │
│                                                          └── Folders        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Database Tables (Already Exist)

| Table | Purpose | Status |
|-------|---------|--------|
| `peeler_wardrobe` | Hats, Belts, Shoes | ✅ Schema exists |
| `peeler_keys` | Special access grants | ✅ Schema exists |
| `boby_place_drawers` | Major access segments | ✅ Schema exists |
| `boby_place_folders` | Granular permissions | ✅ Schema exists |

### UI Components Needed

| Component | Package | Phase |
|-----------|---------|-------|
| WardrobeDisplay | @boby/ui | Phase 0 |
| BriefcaseCard | @boby/ui | Phase 0 |
| DrawerNav | @boby/ui | Phase 5 |
| FolderGrid | @boby/ui | Phase 5 |
| HatBadge | @boby/ui | Phase 1 |
| BeltBadge | @boby/ui | Phase 1 |
| KeyStatus | @boby/ui | Phase 5 |

### Hooks Needed

| Hook | Package | Purpose |
|------|---------|--------|
| `useWardrobe` | @boby/auth | Get user's hats/belts/shoes/keys |
| `useAccess` | @boby/auth | Check drawer/folder permissions |
| `useBriefcase` | @boby/auth | Get portable identity info |

---

## 🎯 Phase Overview

| Phase | Name | Duration | Focus | Deliverable |
|-------|------|----------|-------|-------------|
| **0** | Foundation | Week 1 | Core packages | Shared infrastructure |
| **1** | Agent Portal | Week 2 | First app | agents.getboby.ai |
| **2** | Mobile Foundation | Week 3 | React Native | Panic Button app |
| **3** | Beta Polish | Week 4 | Integration | Feb 14 Beta Launch |
| **4** | Firm Portal | Week 5-6 | Second app | firms.getboby.ai |
| **5** | Member Portal | Week 7-10 | Migration | members.getboby.ai |
| **6** | API Gateway | Week 11-12 | Backend | Unified API layer |
| **7** | Full Launch | Week 13+ | Production | Complete platform |

---

## 📦 Phase 0: Foundation (Week 1)

### Goal
Build the shared packages that ALL apps will depend on. No app-specific code yet.

### 0.1 @boby/config ✅ COMPLETE
- [x] Tailwind configuration with brand colors
- [x] TypeScript base configuration
- [x] TypeScript React configuration

### 0.2 @boby/ui (Design System)
Current: 4 components | Target: 15 components

| Component | Priority | Status | Notes |
|-----------|----------|--------|-------|
| Button | P0 | ✅ Done | Gold primary, no icons |
| Card | P0 | ✅ Done | 4 variants |
| Input | P0 | ✅ Done | Labels, validation |
| CircleBadge | P0 | ✅ Done | 5-tier trust |
| **Marker** | P0 | 🔄 TODO | 2-letter abbreviation badges |
| **Select** | P0 | 🔄 TODO | Dropdown with brand styling |
| **Modal** | P0 | 🔄 TODO | Branded dialogs (Anti-Confirm) |
| **Toast** | P0 | 🔄 TODO | Notification system |
| **Table** | P1 | 🔄 TODO | Data tables with sorting |
| **Tabs** | P1 | 🔄 TODO | Tab navigation component |
| **Avatar** | P1 | 🔄 TODO | User/entity display |
| **Badge** | P1 | 🔄 TODO | Status indicators |
| **Skeleton** | P1 | 🔄 TODO | Loading states |
| **EmptyState** | P2 | 🔄 TODO | No data displays |
| **ErrorBoundary** | P2 | 🔄 TODO | Error handling |

### 0.3 @boby/auth (Authentication + Identity)
Shared authentication AND identity infrastructure for all apps.

#### Core Auth
| Task | Priority | Status |
|------|----------|--------|
| AuthProvider context | P0 | 🔄 TODO |
| useAuth hook | P0 | 🔄 TODO |
| useUser hook | P0 | 🔄 TODO |
| Token storage (secure) | P0 | 🔄 TODO |
| Session persistence | P0 | 🔄 TODO |
| SSO with existing system | P1 | 🔄 TODO |
| Refresh token logic | P1 | 🔄 TODO |
| Logout/cleanup | P1 | 🔄 TODO |

#### 👔 Wardrobe Hooks
| Hook | Priority | Status | Description |
|------|----------|--------|-------------|
| `useWardrobe` | P1 | 🔄 TODO | Get user's hats, belts, shoes, keys |
| `useHats` | P1 | 🔄 TODO | User's roles (Agent, Manager, etc.) |
| `useBelts` | P1 | 🔄 TODO | User's certifications (RSA, First Aid) |
| `useKeys` | P2 | 🔄 TODO | Special access grants |

#### 🗄️ Filing Cabinet Hooks
| Hook | Priority | Status | Description |
|------|----------|--------|-------------|
| `useAccess` | P1 | 🔄 TODO | Check drawer/folder permissions |
| `useDrawers` | P2 | 🔄 TODO | List available drawers for a place |
| `useFolders` | P2 | 🔄 TODO | List folders within a drawer |

#### 📋 Briefcase Hooks
| Hook | Priority | Status | Description |
|------|----------|--------|-------------|
| `useBriefcase` | P1 | 🔄 TODO | Get portable identity package |
| `useTelePathCode` | P1 | 🔄 TODO | Scannable identity code |

### 0.4 @boby/api-client (API Layer)
Type-safe API client for all backend calls.

| Task | Priority | Status |
|------|----------|--------|
| Base HTTP client (fetch wrapper) | P0 | 🔄 TODO |
| Request/response interceptors | P0 | 🔄 TODO |
| Error handling patterns | P0 | 🔄 TODO |
| TypeScript types for all entities | P0 | 🔄 TODO |
| Agent API endpoints | P1 | 🔄 TODO |
| Jobs API endpoints | P1 | 🔄 TODO |
| Auth API endpoints | P1 | 🔄 TODO |

### 0.5 @boby/hooks (Shared Hooks)
Common React hooks used across apps.

| Hook | Purpose | Status |
|------|---------|--------|
| useLocalStorage | Persistent state | 🔄 TODO |
| useDebounce | Input debouncing | 🔄 TODO |
| useMediaQuery | Responsive logic | 🔄 TODO |
| useOnlineStatus | Network detection | 🔄 TODO |

### Phase 0 Checkpoint ✓
Before moving to Phase 1:
- [ ] All P0 @boby/ui components complete
- [ ] @boby/auth AuthProvider working
- [ ] @boby/api-client base client working
- [ ] Brand style guide enforced in all components
- [ ] Tech Lead approval
- [ ] UX approval on component look/feel

---

## 🧑‍💼 Phase 1: Agent Portal (Week 2)

### Goal
Complete the Agent Portal as the FIRST production app using the foundation.

### 1.1 Layout & Navigation
| Task | Status |
|------|--------|
| Sidebar (desktop) | ✅ Done (Jan 24) |
| Mobile bottom nav | ✅ Done (Jan 24) |
| Mobile hamburger menu | ✅ Done (Jan 24) |
| User section with logout | ✅ Done (Jan 24) |
| White/crisp brand styling | ✅ Done (Jan 24) |
| Breadcrumbs | 🔄 TODO |

### 1.2 Pages

| Page | Route | Status | Features |
|------|-------|--------|----------|
| Login | `/login` | ✅ Done (Jan 24) | JWT auth, invitation-only copy |
| Dashboard | `/` | ✅ Done (Jan 24) | Stats, shifts, quick actions |
| Jobs | `/jobs` | ✅ Done (Jan 24) | Real PostgreSQL data, filters |
| Job Detail | `/jobs/:id` | 🔄 TODO | Full job info, map, apply |
| Earnings | `/earnings` | ✅ Done (Jan 24) | Summary cards, payment history |
| Profile | `/profile` | ✅ Done (Jan 24) | Agent ID, credentials display |
| **Credentials** | `/credentials` | 🔄 TODO | **Belts display (RSA, First Aid)** |
| Settings | `/settings` | 🔄 TODO | Preferences, notifications |
| Notifications | `/notifications` | 🔄 TODO | Activity feed |

### 1.3 Wardrobe Integration (Agent Portal)

| Feature | Description | Status |
|---------|-------------|--------|
| Display Belts on Profile | Show certifications (RSA, First Aid, Crowd Control) | 🔄 TODO |
| Display Hat on Dashboard | Show current role (Security Agent, etc.) | 🔄 TODO |
| Credential Upload | Add new Belts to wardrobe | 🔄 TODO |
| Trust Score from Briefcase | Show portable trust rating | 🔄 TODO |

### 1.3 Features

| Feature | Priority | Status |
|---------|----------|--------|
| Login with existing credentials | P0 | ✅ Done (Jan 24) - JWT auth via /api/membership/login |
| Protected routes redirect to login | P0 | ✅ Done (Jan 24) - ProtectedRoute component |
| Logout functionality | P0 | ✅ Done (Jan 24) - Clears token, redirects |
| View available jobs | P0 | ✅ Done (Jan 24) - Real PostgreSQL data |
| Apply for jobs | P0 | 🔄 TODO |
| View earnings | P0 | ✅ Done (Jan 24) - Summary cards, payment history |
| View profile | P0 | ✅ Done (Jan 24) - Agent ID, credentials display |
| Update profile | P0 | 🔄 TODO - API connected, UI needs form |
| Upload credentials | P1 | 🔄 TODO |
| Push notifications | P2 | 🔄 TODO |

### 1.4 API Integration

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| POST /api/membership/login | Auth | ✅ Done | JWT token returned |
| GET /api/membership/verify | Auth | ✅ Done | Session validation |
| PUT /api/membership/profile | Update | ✅ Done | MeMe Identity Vault |
| GET /api/jobs | List | ✅ Done | PostgreSQL, filters work |
| GET /api/jobs/:id | Detail | 🔄 TODO | |
| POST /api/jobs/:id/apply | Action | 🔄 TODO | |
| GET /api/commissions/agent/:id | Read | ✅ Done | Earnings API |
| GET /api/agent/shifts | Read | 🔄 TODO | |

### Phase 1 Checkpoint ✓
Before moving to Phase 2:
- [x] Agent can log in with existing credentials ✅ (Jan 24)
- [x] All pages render with real data ✅ (Jan 24 - PostgreSQL connected)
- [ ] Job application flow complete
- [ ] Deployed to staging (staging-agents.getboby.ai)
- [ ] Tech Lead approval
- [ ] UX approval on complete flows

---

## 📱 Phase 2: Mobile Foundation (Week 3)

### Goal
Build the React Native mobile app with Panic Button as the flagship feature.

### 2.1 Project Setup

| Task | Status |
|------|--------|
| Initialize Expo project | 🔄 TODO |
| Configure for iOS + Android | 🔄 TODO |
| Set up React Navigation | 🔄 TODO |
| Create mobile-specific @boby/ui exports | 🔄 TODO |

### 2.2 Shared Code Strategy

```
packages/ui/
├── src/
│   ├── components/          # Web components
│   └── native/              # React Native components
│       ├── Button.native.tsx
│       ├── Card.native.tsx
│       └── ...
```

### 2.3 Mobile Screens

| Screen | Priority | Status |
|--------|----------|--------|
| Login | P0 | 🔄 TODO |
| Dashboard | P0 | 🔄 TODO |
| **Panic Button** | P0 | 🔄 TODO |
| **Briefcase** | P0 | 🔄 TODO |
| Jobs List | P1 | 🔄 TODO |
| Profile | P1 | 🔄 TODO |
| Settings | P2 | 🔄 TODO |

### 2.4 Briefcase Screen (Mobile Identity)

The Briefcase is the **portable identity** screen - critical for mobile.

| Feature | Description | Status |
|---------|-------------|--------|
| TelePathCode QR | Scannable identity code | 🔄 TODO |
| Verified Credentials | Digital wallet of Belts | 🔄 TODO |
| Trust Score Display | Portable reputation | 🔄 TODO |
| Share Identity | NFC/QR share to venues | 🔄 TODO |
| Offline Mode | Cached credentials work offline | 🔄 TODO |

### 2.4 Panic Button Feature (CRITICAL)

| Requirement | Status |
|-------------|--------|
| Large, accessible emergency button | 🔄 TODO |
| One-tap activation | 🔄 TODO |
| GPS location capture | 🔄 TODO |
| Send alert to control room | 🔄 TODO |
| Audio recording option | 🔄 TODO |
| Works offline (queues for sync) | 🔄 TODO |
| Haptic feedback | 🔄 TODO |
| Silent mode option | 🔄 TODO |

### Phase 2 Checkpoint ✓
Before moving to Phase 3:
- [ ] App runs on iOS simulator
- [ ] App runs on Android emulator
- [ ] Login works with existing credentials
- [ ] Panic Button fully functional
- [ ] TestFlight build ready (iOS)
- [ ] Internal testing APK ready (Android)
- [ ] Tech Lead approval
- [ ] UX approval on mobile experience

---

## 🎉 Phase 3: Beta Polish (Week 4)

### Goal
Integration, testing, and preparation for Feb 14 Beta Launch.

### 3.1 Agent Portal Polish

| Task | Status |
|------|--------|
| Error handling on all API calls | 🔄 TODO |
| Loading states everywhere | 🔄 TODO |
| Empty states (no data) | 🔄 TODO |
| Form validation messages | 🔄 TODO |
| Mobile responsiveness audit | 🔄 TODO |

### 3.2 Deployment

| Environment | URL | Status |
|-------------|-----|--------|
| Agent Portal Production | agents.getboby.ai | 🔄 TODO |
| iOS TestFlight | App Store Connect | 🔄 TODO |
| Android Internal | Play Console | 🔄 TODO |

### 3.3 Documentation

| Document | Status |
|----------|--------|
| User guide for agents | 🔄 TODO |
| Known issues list | 🔄 TODO |
| Feedback collection mechanism | 🔄 TODO |

### 🚀 BETA LAUNCH: February 14, 2026

**Deliverables:**
- ✅ agents.getboby.ai live
- ✅ iOS TestFlight available
- ✅ Android internal testing APK
- ✅ Panic Button fully functional
- ✅ SSO with existing membership

---

## 🏢 Phase 4: Firm Portal (Week 5-6)

### Goal
Build the Security Firm Portal for corporate partners.

### 4.1 Structure
```
apps/firm-portal/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx      # Firm overview
│   │   ├── Agents.tsx         # Manage agents
│   │   ├── Jobs.tsx           # Post/manage jobs
│   │   ├── Billing.tsx        # Invoices, payments
│   │   └── Settings.tsx       # Firm settings
```

### 4.2 Key Features

| Feature | Priority |
|---------|----------|
| Firm dashboard with metrics | P0 |
| View/manage linked agents | P0 |
| Post new jobs | P0 |
| View job applications | P0 |
| Approve/assign agents to jobs | P0 |
| Billing & invoices | P1 |
| Agent performance reports | P1 |

### 4.3 Deployment
- URL: firms.getboby.ai

---

## 👥 Phase 5: Member Portal Migration (Week 7-10)

### Goal
Migrate the existing membership-portal.html to React, including FULL Filing Cabinet implementation.

### 5.1 Strategy
1. Create feature parity first
2. Migrate section by section
3. Keep legacy running until complete
4. Switch DNS when ready

### 5.2 Migration Order

| Section | Week | Priority |
|---------|------|----------|
| Authentication/Login | 7 | P0 |
| Dashboard/Home | 7 | P0 |
| Profile Management | 8 | P0 |
| MeMe Identity Hub | 8 | P0 |
| **Wardrobe Management** | 8 | P0 |
| Jobs/Applications | 9 | P1 |
| Earnings/Payments | 9 | P1 |
| **Filing Cabinet UI** | 9 | P1 |
| Settings | 10 | P2 |
| Recruitment Tools | 10 | P2 |

### 5.3 Filing Cabinet Full Implementation

| Feature | Description | Status |
|---------|-------------|--------|
| Drawer Navigation | Visual drawer selector | 🔄 TODO |
| Folder Grid | Browse folders within drawer | 🔄 TODO |
| Access Visualization | Show what user can/can't access | 🔄 TODO |
| Key Management | View/request special access keys | 🔄 TODO |
| Circle → Folder Migration | Map legacy circles to folders | 🔄 TODO |

### 5.4 Wardrobe Full Implementation

| Feature | Description | Status |
|---------|-------------|--------|
| Hat Selector | Switch active roles | 🔄 TODO |
| Belt Gallery | View all certifications | 🔄 TODO |
| Belt Upload | Add new certifications | 🔄 TODO |
| Shoes Configuration | Set mobility/availability | 🔄 TODO |
| Key Ring | View all access grants | 🔄 TODO |

### 5.5 Deployment
- URL: members.getboby.ai (replaces existing)

---

## 🔌 Phase 6: API Gateway (Week 11-12)

### Goal
Refactor the monolithic server.js into clean microservices.

### 6.1 Service Extraction

| Service | Endpoints | Priority |
|---------|-----------|----------|
| auth-service | /api/auth/* | P0 |
| agent-service | /api/agent/* | P0 |
| jobs-service | /api/jobs/* | P0 |
| payments-service | /api/payments/* | P1 |
| kaksos-service | /api/kaksos/* | P1 |
| notification-service | /api/notifications/* | P2 |

### 6.2 Infrastructure

| Task | Status |
|------|--------|
| API Gateway (Cloud Run) | 🔄 TODO |
| Service-to-service auth | 🔄 TODO |
| Rate limiting | 🔄 TODO |
| Logging/monitoring | 🔄 TODO |

---

## 🚀 Phase 7: Full Launch (Week 13+)

### Goal
Complete platform with all portals running on new architecture, including Kaksos migration.

### 7.1 Final Deliverables

| Deliverable | URL |
|-------------|-----|
| Agent Portal | agents.getboby.ai |
| Firm Portal | firms.getboby.ai |
| Member Portal | members.getboby.ai |
| **Kaksos Portal** | kaksos.getboby.ai |
| Mobile App (iOS) | App Store |
| Mobile App (Android) | Play Store |
| API Gateway | api.getboby.ai |

### 7.2 Kaksos Dashboard Migration

The Kaksos Dashboard is the most complex migration due to AI integration.

| Feature | Description | Status |
|---------|-------------|--------|
| Know Me Know You (KMKY) | Dialogue training system | 🔄 Phase 7 |
| Living Memory | Memory-NAC architecture | 🔄 Phase 7 |
| Watch Grow | Training data visualization | 🔄 Phase 7 |
| Test Kaksos | AI conversation testing | 🔄 Phase 7 |
| Soul Architecture | AI personality engine | 🔄 Phase 7 |

### 7.3 Legacy Deprecation
- Sunset membership-portal.html
- Sunset kaksos-dashboard.html
- Archive boby-kaksos-demo-1 repository
- Redirect old URLs to new

### 7.4 Identity Infrastructure Complete

By Phase 7, all identity systems are fully realized:

| System | Status |
|--------|--------|
| Wardrobe (Hats/Belts/Shoes/Keys) | ✅ Full UI across all portals |
| Filing Cabinet (Drawers/Folders) | ✅ Full access control UI |
| Briefcase (Portable ID) | ✅ Mobile + Web display |
| TelePathCode | ✅ Scannable identity everywhere |

---

## 📋 Working Process

### Daily Development Flow

```
1. Check BUILD_STATUS.md for current state
2. Review BRAND_STYLE_GUIDE.md before any UI work
3. Work on current phase tasks
4. Test locally
5. Commit with descriptive message
6. Update BUILD_STATUS.md
7. Request UX review for visual changes
```

### Checkpoint Reviews

At each phase checkpoint:
1. **Tech Lead** (AI): Verify architecture, code quality, tests
2. **UX Lead** (Brand): Verify brand compliance, usability
3. **Both**: Sign off before moving to next phase

### Communication

| When | What |
|------|------|
| Start of session | Read BUILD_STATUS.md |
| UI changes | Request UX review |
| Phase complete | Full checkpoint review |
| End of session | Update BUILD_STATUS.md |

---

## 🔧 Technical Standards

### Code Quality
- TypeScript strict mode everywhere
- No `any` types (use `unknown` if needed)
- Props interfaces for all components
- JSDoc comments on public APIs

### Testing Strategy
- Unit tests for @boby/ui components
- Integration tests for auth flows
- E2E tests for critical paths (login, panic button)

### Performance
- Bundle size monitoring
- Lazy loading for routes
- Image optimization
- Service worker for offline (mobile)

### Security
- HTTPS everywhere
- Secure token storage
- Input sanitization
- CORS configuration

---

## 📊 Success Metrics

### Beta Launch (Feb 14)
- [ ] 0 critical bugs
- [ ] <3s page load time
- [ ] 100% brand compliance
- [ ] Panic button <500ms response

### Full Launch
- [ ] All legacy features migrated
- [ ] 95% uptime
- [ ] <2s page load time
- [ ] App Store approval (iOS/Android)

---

## 🗂️ Reference Documents

| Document | Location |
|----------|----------|
| Build Status | `boby-platform/.agent/artifacts/BUILD_STATUS.md` |
| Brand Guide | `boby-platform/.agent/artifacts/BRAND_STYLE_GUIDE.md` |
| Foundation Blueprint | `boby-kaksos-demo-1/.agent/artifacts/FOUNDATION_BLUEPRINT.md` |
| Platform Plan | `boby-kaksos-demo-1/.agent/artifacts/PLATFORM_RESTRUCTURE_PLAN.md` |

---

## ✍️ Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tech Lead | AI Assistant | Jan 24, 2026 | ✅ Approved |
| UX Lead | Brand | | _pending_ |

---

*This roadmap is a living document. Updates will be tracked in BUILD_STATUS.md.*
