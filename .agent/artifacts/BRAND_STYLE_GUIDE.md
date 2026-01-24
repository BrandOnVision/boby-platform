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

## Logo Usage

- **Header**: `/boby-logo-text.png` (with text fallback "BOBY")
- **Favicon**: `/boby-logo-sq.png`
- **Mobile**: Max height 28px

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
