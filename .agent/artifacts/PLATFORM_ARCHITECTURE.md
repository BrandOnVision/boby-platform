# 🏗️ BOBY Platform Architecture

> **Created:** January 25, 2026  
> **Last Updated:** January 25, 2026  
> **Status:** Canonical Reference Document

---

## 🧅 Peeler First Protocol

**Core Principle:** Everyone is a Peeler (member) FIRST. Roles (Agent, Firm Owner, Manager) are just "hats" they wear. The identity lives in ONE place.

---

## 🌐 Subdomain Architecture

### Production URLs

| Subdomain | Type | Purpose | Priority | Status |
|-----------|------|---------|----------|--------|
| `getboby.ai` | Landing | Marketing site | P0 | ✅ Live |
| `api.getboby.ai` | Backend | Unified API | P0 | ✅ Live |
| `agents.getboby.ai` | Portal | Agent work: jobs, earnings, shifts | P0 | ✅ Live |
| `firms.getboby.ai` | Portal | Firm management: post jobs, agents | P0 | 🔜 Coming Soon |
| `members.getboby.ai` | Portal | Peeler home: identity hub | P1 | ⏳ Coming Soon |
| `admin.getboby.ai` | Portal | Platform administration | P1 | ⏳ Coming Soon |
| `filing-cabinet.getboby.ai` | Router | Universal entity router | P1 | ⏳ Coming Soon |
| `briefcase.getboby.ai` | Interface | Public chat with entity Kaksoses | P2 | ⏳ Coming Soon |
| `kaksos.getboby.ai` | Training | AI training, KMKY, Soul config | P2 | ⏳ Coming Soon |

### Staging URLs

| Subdomain | Purpose | Status |
|-----------|---------|--------|
| `staging-api.getboby.ai` | Staging API | ✅ Live |
| `staging-agents.getboby.ai` | Staging Agent Portal | ✅ Live |
| `staging-firms.getboby.ai` | Staging Firm Portal | 🔜 Coming Soon |
| `staging-members.getboby.ai` | Staging Member Portal | ⏳ Coming Soon |
| `staging-admin.getboby.ai` | Staging Admin Portal | ⏳ Coming Soon |
| `staging-filing-cabinet.getboby.ai` | Staging Filing Cabinet | ⏳ Coming Soon |
| `staging-briefcase.getboby.ai` | Staging Briefcase | ⏳ Coming Soon |
| `staging-kaksos.getboby.ai` | Staging Kaksos | ⏳ Coming Soon |

---

## 🗄️ Filing Cabinet = The Universal Router

The Filing Cabinet is the **universal routing system** for:
- Entities (Briefcases)
- AI Personalities (Kaksoses)
- Information (Wardrobe items)
- Memory (Hat/Belt-specific knowledge)

### Structure
```
FILING CABINET
├── DRAWER: BOBY (Company Entity)
│   └── BRIEFCASE: BOBY Kaksos
│       └── WARDROBE
│           ├── 🎩 HAT: CEO → Kaksos Memory: Leadership
│           ├── 🎩 HAT: Security Expert → Kaksos Memory: Security
│           ├── 🥋 BELT: Industry Compliance → Kaksos Memory: Regulations
│           └── 🥋 BELT: First Aid Training → Kaksos Memory: Medical
│
├── DRAWER: Brandon (Peeler Entity)
│   └── BRIEFCASE: Brandon's Kaksos
│       └── WARDROBE
│           ├── 🎩 HAT: Agent → Kaksos Memory: Agent work
│           ├── 🎩 HAT: Firm Owner → Kaksos Memory: Firm management
│           └── 🥋 BELT: RSA Certified → Kaksos Memory: RSA training
│
└── DRAWER: Firms
    └── BRIEFCASE: ACME Security
        └── WARDROBE
            ├── 🎩 HAT: Venue Specialist → Kaksos Memory: Venues
            └── 🥋 BELT: Licensed Class 1 → Kaksos Memory: Licensing
```

### URL Routes
```
filing-cabinet.getboby.ai/
  /[drawer]                              # Access a drawer
  /[drawer]/[briefcase]                  # Access an entity's briefcase
  /[drawer]/[briefcase]/wardrobe         # View their wardrobe
  /[drawer]/[briefcase]/wardrobe/[hat]   # Specific hat
  /[drawer]/[briefcase]/wardrobe/[belt]  # Specific belt
```

---

## 🎒 Briefcase = Entity Container with Kaksos Brain

Each **Briefcase** contains:
1. **TelePathCode** - The identity token
2. **Kaksos** - The AI brain for this entity
3. **Wardrobe** - The hats, belts, shoes, keys
4. **Memory Routing** - Connection to specialized knowledge

### URL Routes
```
briefcase.getboby.ai/
  /[entity]              # Chat with this entity's Kaksos
  /[entity]/profile      # View their identity  
  /[entity]/wardrobe     # View their hats/belts
  /[entity]/verify       # Verify their credentials
```

---

## 🤖 Kaksos "Team Meeting" Pattern

When someone talks to a Briefcase, the question is routed to the relevant Kaksos memories:

```
PUBLIC USER ASKS: "What security certifications do I need?"
                          │
                          ▼
                ┌─────────────────────┐
                │   BOBY BRIEFCASE    │
                │   Main Kaksos       │
                │   (Orchestrator)    │
                └─────────┬───────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 🎩 Security   │  │ 🥋 Compliance │  │ 🥋 First Aid  │
│    Expert     │  │   Knowledge   │  │   Training   │
│ Kaksos Memory │  │ Kaksos Memory │  │ Kaksos Memory│
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┴─────────────────┘
                         │
                         ▼
                ┌─────────────────────┐
                │   COMBINED ANSWER   │
                │   From all experts  │
                └─────────────────────┘
```

### URL Routes
```
kaksos.getboby.ai/
  /training                     # KMKY training sessions
  /training/[entity]            # Train a specific entity
  /training/[entity]/[hat]      # Train a specific hat's memory
  /soul/[entity]               # Soul architecture config
  /memory/[entity]             # Living memory viewer
```

---

## 🏠 Portal Architecture

### Member Portal = Identity Hub
```
members.getboby.ai/
├── /                        # Dashboard
├── /wardrobe               # Complete wardrobe
│   ├── /hats               # Your roles
│   ├── /belts              # Your certifications
│   ├── /shoes              # Your availability
│   └── /keys               # Your access grants
├── /briefcase              # Your portable identity
├── /filing-cabinet         # Your access drawers
├── /profile                # Edit profile
└── /settings               # Preferences
```

### Agent Portal = Work Context
```
agents.getboby.ai/
├── /                       # Dashboard
├── /jobs                   # Available jobs
├── /jobs/:slug            # Job detail
├── /applications          # My applications
├── /earnings              # Earnings & payments
├── /schedule              # Shift schedule
├── /profile               # Agent profile
├── /briefcase             # Quick identity view
└── /settings              # Agent settings
```

### Firm Portal = Work Context
```
firms.getboby.ai/
├── /                       # Dashboard
├── /jobs                   # All posted jobs
├── /jobs/new              # Post new job
├── /jobs/:id              # Job detail
├── /jobs/:id/applications # View applications
├── /agents                # Linked agents
├── /agents/:id            # Agent detail
├── /billing               # Billing & invoices
├── /filing-cabinet        # Firm's drawers
└── /settings              # Firm settings
```

### Admin Portal = Platform Control
```
admin.getboby.ai/
├── /                       # Dashboard
├── /users                  # All users
├── /firms                  # All firms
├── /jobs                   # All jobs
├── /invitations           # Invitation management
├── /billing               # Platform billing
├── /analytics             # Platform analytics
└── /settings              # Platform settings
```

---

## 📱 Mobile First Strategy

All portals are built **mobile-first** with PWA support:

| App Icon | Home Screen Name | Subdomain |
|----------|------------------|-----------|
| 🧅 | BOBY | members.getboby.ai |
| 🛡️ | BOBY Agent | agents.getboby.ai |
| 🏢 | BOBY Firm | firms.getboby.ai |
| ⚙️ | BOBY Admin | admin.getboby.ai |

Each can be "installed" as a separate app on the home screen.

---

## 🔗 Single Sign-On (SSO)

All portals share the same authentication:

```typescript
// @boby/auth package handles all portals
const { user, roles, canAccess } = useAuth();

// roles = ['member', 'agent', 'firm_owner']
// canAccess('firms.getboby.ai') → true/false
// canAccess('admin.getboby.ai') → true/false
```

---

## 📦 Shared Packages

| Package | Purpose | Used By |
|---------|---------|---------|
| `@boby/ui` | Design system components | All portals |
| `@boby/auth` | Authentication + identity | All portals |
| `@boby/api-client` | Type-safe API wrapper | All portals |
| `@boby/hooks` | Common React hooks | All portals |
| `@boby/config` | Shared configuration | All packages |

---

## 🗄️ Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| Frontend Hosting | Cloud Run | All portals |
| API Backend | Cloud Run | Unified API |
| Database | Cloud SQL PostgreSQL | All data |
| CDN/Proxy | Cloudflare | DNS, Workers, SSL |
| File Storage | Cloud Storage | Uploads, media |
| Email | Brevo | Transactional email |
| Payments | Stripe | Subscriptions, Connect |

---

## 📋 Database Tables (Key Entities)

| Table | Purpose |
|-------|---------|
| `peelers` | All users (Peeler First) |
| `partner_firms` | Security firms |
| `jobs` | Job postings |
| `job_enquiries` | Job applications |
| `commissions` | Earnings/payments |
| `peeler_wardrobe` | Hats, belts, shoes |
| `peeler_keys` | Special access grants |
| `boby_place_drawers` | Filing cabinet drawers |
| `boby_place_folders` | Filing cabinet folders |
| `tenders` | Tender postings |
| `tender_responses` | Tender applications |
| `provider_profiles` | Identity vault profiles |
