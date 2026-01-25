# Boby Brand Style Guide for React Platform

> **MANDATORY:** All co-pilots and developers MUST follow these standards.
> Deviation from brand style is NOT acceptable.

---

## 🚨 CRITICAL RULES

### 1. NO EMOJIS OR ICONS
- ❌ **BANNED**: 🛡️ 🏠 💼 💰 👤 🔔 🏢 🚨 ✅ 📦 ✨ 💬 etc.
- ✅ **USE INSTEAD**: Text labels, 2-letter markers, or typography-only design

### 2. PRIMARY BRAND COLOR IS GOLD
- ❌ **WRONG**: Blue (#2563eb) as primary
- ✅ **CORRECT**: Gold (#FFD952) as primary

### 3. CLEAN TYPOGRAPHY-ONLY DESIGN
- List items, cards, buttons should rely on typography, not icons
- Visual purity and minimalism is core to the brand

---

## Color Palette (CANONICAL)

```css
:root {
  /* Core Brand */
  --primary: #FFD952;           /* BOBY Gold - Main brand color */
  --primary-dark: #F2C94C;      /* Hover states */
  --primary-light: #FEF3C7;     /* Backgrounds */
  
  /* Semantic Status */
  --success: #45BE5E;
  --success-light: #D1FAE5;
  --warning: #F2994A;
  --danger: #DC2626;
  --teal: #1EFFBC;
  --teal-dark: #0D9488;
  
  /* Neutral Palette */
  --text-primary: #303030;      /* Primary text */
  --text-secondary: #505050;
  --text-muted: #787878;
  --white: #FFFFFF;
  --grey-100: #FAFAFA;
  --grey-200: #F5F5F5;
  --grey-300: #E0E0E0;
  
  /* Trust Tier Colors */
  --tier-1-gold: #FFD952;       /* Center Circle - Highest trust */
  --tier-2-blue: #28A2FF;       /* Inner Circle */
  --tier-3-green: #45BE5E;      /* Mid Circle */
  --tier-4-amber: #F2994A;      /* Outer Circle */
  --tier-5-grey: #A0A0A0;       /* Public Circle */
}
```

---

## 2-Letter Markers (Instead of Icons)

Use bold 2-letter abbreviations inside styled containers:

| Marker | Meaning | Use Case |
|--------|---------|----------|
| **AG** | Agent | Agent/User profiles |
| **JB** | Job | Job listings |
| **EA** | Earnings | Earnings/Financial |
| **PR** | Profile | Profile sections |
| **SH** | Shift | Shift/Schedule items |
| **VN** | Venue | Venue/Location |
| **TR** | Trust | Trust indicators |

### Implementation

```tsx
// Marker component - 40px rounded square with gold background
<div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
  <span className="text-sm font-bold text-text-primary">AG</span>
</div>
```

---

## Button Standards

- **Primary CTA**: Gold background (#FFD952), black text (#303030)
- **Secondary**: Grey background, black text
- **Ghost**: Text only, no background
- **Danger**: Red background for destructive actions

```tsx
// Primary button
<button className="bg-primary hover:bg-primary-dark text-text-primary font-semibold px-4 py-2 rounded-lg">
  Save Changes
</button>
```

---

## Card Standards

- White background (#FFFFFF)
- Subtle border (--grey-300) or no border
- No gradient backgrounds
- No decorative icons
- Typography-focused content

---

## Navigation

- Text-only navigation items
- Active state: Gold underline or gold background accent
- No emoji icons in nav items

---

## Typography

- **Headings**: Bold, clean, no icons
- **Body**: Clean sans-serif
- **Labels**: All-caps or sentence case, no emoji prefixes

---

## 🚨 MANDATORY: Official Logo Assets

**ALL new pages and portals MUST use the official logo files from the onset.**

### Official Asset Files

| Asset | Filename | Location | Use Case |
|-------|----------|----------|----------|
| **Square Logo (Favicon)** | `logosq.png` | `/public/logosq.png` | Browser favicon, app icons, square contexts |
| **Full Logo (Horizontal)** | `Bobylogo.png` | `/public/Bobylogo.png` | Headers, splash screens, login pages |

### Visual Reference

- **logosq**: Gold sergeant chevron badge icon (circle with downward chevrons)
- **Bobylogo**: Full horizontal logo with badge + "BOBY" gold text

### Implementation (MANDATORY on every new app)

```html
<!-- index.html - Favicon (REQUIRED) -->
<link rel="icon" type="image/png" href="/logosq.png" />
<link rel="apple-touch-icon" href="/logosq.png" />

<!-- Header Component - Full Logo -->
<img src="/Bobylogo.png" alt="BOBY" className="h-8" />

<!-- Mobile Header - Square Logo -->
<img src="/logosq.png" alt="BOBY" className="h-7 w-7" />
```

### Sizing Standards

| Context | Asset | Recommended Size |
|---------|-------|------------------|
| Favicon | logosq | 32x32, 180x180 (apple-touch) |
| Mobile header | logosq | 28px height |
| Desktop header | Bobylogo | 32-40px height |
| Login page | Bobylogo | 48-64px height |
| Splash/Loading | Bobylogo | 80-120px height |

### ❌ DO NOT

- Create new placeholder logos (use official assets)
- Use CSS-only "B" letters as logo substitutes
- Modify the logo colors (gold #FFD952 is fixed)
- Reference logos from external URLs

### ✅ ALWAYS

- Copy logosq.png and Bobylogo.png to `/public/` when creating new apps
- Set favicon in index.html immediately when scaffolding
- Use img tags with proper alt text

---

## FORBIDDEN Patterns

1. ❌ Emoji in headings or labels
2. ❌ Blue as primary brand color
3. ❌ Decorative icons in lists
4. ❌ Complex gradients on cards
5. ❌ Icon-only buttons without text

---

## REQUIRED Patterns

1. ✅ Gold (#FFD952) for primary actions
2. ✅ 2-letter markers instead of icons
3. ✅ Typography-only list items
4. ✅ Flat, clean backgrounds
5. ✅ High contrast (gold/black/white)

---

*This guide supersedes any generic React/web design patterns.*
*When in doubt, choose LESS visual elements, not more.*
