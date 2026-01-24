# 🗺️ Boby Platform Development Roadmap

> **Tech Lead:** AI Assistant  
> **Product Owner/UX:** Brand (User)  
> **Created:** January 24, 2026  
> **Beta Launch Target:** February 14, 2026  
> **Full Launch Target:** March 2026

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

### 0.3 @boby/auth (Authentication)
Shared authentication logic for all apps.

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
| Responsive header | ✅ Done |
| Mobile bottom nav | ✅ Done |
| Sidebar (desktop) | 🔄 TODO |
| Breadcrumbs | 🔄 TODO |

### 1.2 Pages

| Page | Route | Status | Features |
|------|-------|--------|----------|
| Dashboard | `/` | ✅ UI Done | Stats, shifts, quick actions |
| Jobs | `/jobs` | ✅ UI Done | Listings, filters, apply |
| Job Detail | `/jobs/:id` | 🔄 TODO | Full job info, map, apply |
| Earnings | `/earnings` | ✅ UI Done | Summary, history table |
| Profile | `/profile` | ✅ UI Done | Info, credentials |
| Settings | `/settings` | 🔄 TODO | Preferences, notifications |
| Notifications | `/notifications` | 🔄 TODO | Activity feed |

### 1.3 Features

| Feature | Priority | Status |
|---------|----------|--------|
| Login with existing credentials | P0 | 🔄 TODO |
| View available jobs | P0 | ✅ UI Done |
| Apply for jobs | P0 | 🔄 TODO |
| View earnings | P0 | ✅ UI Done |
| Update profile | P0 | 🔄 TODO |
| Upload credentials | P1 | 🔄 TODO |
| Push notifications | P2 | 🔄 TODO |

### 1.4 API Integration

| Endpoint | Method | Status |
|----------|--------|--------|
| GET /api/agent/profile | Read | 🔄 TODO |
| PUT /api/agent/profile | Update | 🔄 TODO |
| GET /api/jobs | List | 🔄 TODO |
| GET /api/jobs/:id | Detail | 🔄 TODO |
| POST /api/jobs/:id/apply | Action | 🔄 TODO |
| GET /api/agent/earnings | Read | 🔄 TODO |
| GET /api/agent/shifts | Read | 🔄 TODO |

### Phase 1 Checkpoint ✓
Before moving to Phase 2:
- [ ] Agent can log in with existing credentials
- [ ] All pages render with real data
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
| Jobs List | P1 | 🔄 TODO |
| Profile | P1 | 🔄 TODO |
| Settings | P2 | 🔄 TODO |

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
Migrate the existing membership-portal.html to React.

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
| Jobs/Applications | 9 | P1 |
| Earnings/Payments | 9 | P1 |
| Settings | 10 | P2 |
| Recruitment Tools | 10 | P2 |

### 5.3 Deployment
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
Complete platform with all portals running on new architecture.

### 7.1 Final Deliverables

| Deliverable | URL |
|-------------|-----|
| Agent Portal | agents.getboby.ai |
| Firm Portal | firms.getboby.ai |
| Member Portal | members.getboby.ai |
| Mobile App (iOS) | App Store |
| Mobile App (Android) | Play Store |
| API Gateway | api.getboby.ai |

### 7.2 Legacy Deprecation
- Sunset membership-portal.html
- Archive boby-kaksos-demo-1 repository
- Redirect old URLs to new

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
