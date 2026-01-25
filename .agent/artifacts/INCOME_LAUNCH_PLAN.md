# 💰 Income-Focused Launch Plan

> **Created:** January 25, 2026  
> **Goal:** Generate income to transition from shift work to full-time development

---

## 🎯 Revenue Streams

| Stream | Revenue | Source | Priority |
|--------|---------|--------|----------|
| **Firm Subscriptions** | $360/year per firm | Partner onboarding | P0 |
| **Agent Placements** | Commission on shifts worked | Agent earnings | P1 |
| **Boby Place** | $360+ per business | Business packages | P2 |
| **Training Courses** | $100-500 per course | Credential training | P2 |

---

## 📋 Minimum Viable Platform (MVP) for Income

### What's Needed to Start Earning

```
┌──────────────────────────────────────────────────────────────────────┐
│                    MINIMUM PLATFORM FOR INCOME                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ✅ agents.getboby.ai (DONE)                                          │
│      Agents can: Login, view jobs, apply, track earnings               │
│                                                                        │
│   🔜 firms.getboby.ai (NEXT)                                           │
│      Firms can: Login, post jobs, view applications, assign agents     │
│                                                                        │
│   ✅ api.getboby.ai (DONE)                                             │
│      Backend: Auth, jobs, applications, payments                       │
│                                                                        │
│   ✅ Stripe (EXISTS)                                                   │
│      Payments: Firm subscriptions, agent payouts                       │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

### The Complete Workflow for Revenue

```
FIRM                          BOBY                          AGENT
 │                              │                              │
 │ 1. Subscribe ($360/year) ────────────────────────────────►  │
 │                              │                              │
 │ 2. Post Job ─────────────► 3. Store ◄────────── 4. View    │
 │                              │                              │
 │                              │ ◄─────────────── 5. Apply   │
 │                              │                              │
 │ 6. View Applications ◄──────│                              │
 │                              │                              │
 │ 7. Assign Agent ────────────│─────────────────► 8. Notify  │
 │                              │                              │
 │                              │ ◄───────────────── 9. Work  │
 │                              │                              │
 │ 10. Pay Invoice ────────────│─────────────────► 11. Payout │
 │                              │                              │
 └──────────────────────────────┴──────────────────────────────┘
```

---

## 🗓️ Launch Timeline

### Week 1: Foundation Completion (Jan 26 - Feb 1)
| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Set up all DNS records with Coming Soon | All URLs accessible |
| 1 | Create @boby/ui package | Shared components |
| 2 | Create @boby/api-client package | Type-safe API wrapper |
| 3 | Create @boby/auth package | Unified auth |
| 4-5 | Refactor agent-portal to use packages | Prove pattern works |

### Week 2: Firm Portal Build (Feb 2 - Feb 8)
| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Scaffold firm-portal in monorepo | Base app structure |
| 2 | Firm login + dashboard | Working auth |
| 3 | Jobs list + post job form | Job management |
| 4 | View applications page | See agent applications |
| 5 | Assign agent + close job | Complete workflow |

### Week 3: Integration & Polish (Feb 9 - Feb 15)
| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Test complete workflow with real users | Bug fixes |
| 3 | Deploy firm-portal to production | firms.getboby.ai live |
| 4 | Polish UI, loading states, error handling | Professional feel |
| 5 | Documentation for test users | User guides |

### Week 4: Beta Launch (Feb 16 - Feb 22)
| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Onboard first paying firm | First revenue! 💰 |
| 2 | Onboard additional test agents | Active users |
| 3-5 | Monitor, fix issues, iterate | Stable platform |

---

## 👥 Current Test Users

| Type | Name/Company | Status | Revenue Potential |
|------|--------------|--------|-------------------|
| Firm | Test Firm #1 | ✅ Active testing | $360/year |
| Agent | Test Agent #1 | ✅ Active testing | Commission on shifts |
| Firm | Waiting Firm #2 | 🔜 Ready to join | $360/year |

**Immediate revenue potential:** $720/year from just 2 firms

---

## 📊 Revenue Projections

### Phase 1: Beta (Feb - Mar 2026)
| Metric | Target | Revenue |
|--------|--------|---------|
| Firms onboarded | 5 | $1,800/year |
| Agents active | 20 | Variable commission |
| Jobs posted | 50 | Platform activity |

### Phase 2: Growth (Apr - Jun 2026)
| Metric | Target | Revenue |
|--------|--------|---------|
| Firms subscribed | 25 | $9,000/year |
| Agents active | 100 | Commission income |
| Jobs completed | 200 | Proven workflow |

### Phase 3: Scale (Jul - Dec 2026)
| Metric | Target | Revenue |
|--------|--------|---------|
| Firms subscribed | 100 | $36,000/year |
| Agents active | 500 | Significant commission |
| Monthly revenue | $3,000+ | Full-time viable |

---

## ✅ MVP Checklist

### Already Done ✅
- [x] Agent login/auth
- [x] Jobs listing with search/filters
- [x] Job detail with apply
- [x] Applications tracking
- [x] Earnings page with chart/export
- [x] Profile page
- [x] Settings page
- [x] Production deployment (agents.getboby.ai)
- [x] Staging deployment
- [x] Stripe integration exists in backend

### Need for MVP 🔜
- [ ] Set up all Coming Soon pages
- [ ] Complete @boby/ui package
- [ ] Complete @boby/api-client package
- [ ] Build firm-portal login
- [ ] Build firm-portal dashboard
- [ ] Build post job form
- [ ] Build view applications page
- [ ] Build assign agent action
- [ ] Deploy to firms.getboby.ai
- [ ] Test complete workflow with real users
- [ ] Onboard first paying firm

---

## 🚀 Success Criteria

| Goal | Criteria | Status |
|------|----------|--------|
| **A: Prove Concept** | 1 firm and 1 agent complete full job cycle | ⏳ |
| **B: First Revenue** | First $360 firm subscription processed | ⏳ |
| **C: Relieve Shift Work** | Revenue covers 1 shift per week | ⏳ |
| **D: Full Time Dev** | Revenue covers living expenses | ⏳ |

---

## 📝 Next Actions

1. **TODAY:** Set up Coming Soon pages for all subdomains
2. **THIS WEEK:** Complete shared packages (@boby/ui, @boby/api-client, @boby/auth)
3. **NEXT WEEK:** Build firm-portal with job posting + application review
4. **WEEK AFTER:** Deploy, test with real users, onboard first paying firm
