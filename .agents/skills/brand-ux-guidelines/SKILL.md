---
name: brand-ux-guidelines
description: Enforces project-specific brand guidelines, typography, and UX patterns for ZonaCrono.
triggers:
  - "apply brand styles"
  - "check ux guidelines"
  - "maintain brand consistency"
  - "implement zonacrono design"
  - "use brand colors"
---

# ZonaCrono Brand & UX Guidelines

This skill ensures that all UI/UX developments align with the unique "Mechanical Industrial" brand identity of ZonaCrono.

## Brand Identity: Mechanical Industrial
ZonaCrono uses a high-energy, performance-oriented aesthetic that blends industrial elements with modern web design.

### Core Color Palette
- **Primary**: `hsl(12 90% 50%)` (Racing Red/Orange) - Used for primary actions, accents, and branding.
- **Secondary**: `hsl(220 14% 92%)` (Industrial Gray) - Used for secondary elements and background contrasts.
- **Background**: `hsl(0 0% 97%)` (Light) / `hsl(220 20% 8%)` (Dark).
- **Surface/Card**: `hsl(0 0% 100%)` (Light) / `hsl(220 20% 12%)` (Dark).
- **Brand Colors**:
  - `brand-red`: `#d50f17`
  - `brand-yellow`: `#ffdb4a`
  - `brand-dark-purple`: `#0d164d`
  - `ember`: `hsl(14 78% 57%)`
  - `charcoal`: `hsl(0 0% 10%)`

### Typography
- **Edo**: Used for extreme emphasis, industrial headers, and unique branding moments.
- **Satoshi**: Primary sans-serif font for clean, modern body text and navigation. Usually used in **Black** weight for headers.
- **Permanent Marker**: Used for organic, "drawn" emphasis in specific sections (e.g., `OrganizersSection`).
- **Mono**: Used for technical details, labels, and "mechanical" metadata.

### Design Elements & UX Patterns
- **Mechanical Buttons**: Use `btn-mechanical` or `btn-mechanical-outline` classes.
- **Glassmorphism**: Use `bg-card/95 backdrop-blur-sm` for overlays and cards.
- **Borders**: Often use `border-l-4 border-l-primary` for section emphasis.
- **Animations**:
  - `animate-needle`: Custom animation for "chronometer" vibes.
  - `transition-smooth`: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`.
  - `transition-bounce`: `all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)`.
- **Gradients**:
  - `gradient-hero`: Purple spectrum.
  - `gradient-cta`: Gold/Yellow spectrum.

## Implementation Rules
1. **Always use CSS Variables**: Prefer `var(--primary)` or Tailwind's `primary` class over hardcoded hex codes.
2. **Respect Dark/Light Mode**: Use `.dark` class overrides defined in `globals.css`.
3. **Typography Consistency**:
   - Headers: `font-satoshi font-black uppercase tracking-tight`.
   - Emphasis: `font-permanent` or `font-edo`.
   - Action Labels: `font-mono text-xs uppercase tracking-widest`.
4. **Layout**: Use `grid gap-px bg-border` for "table-like" industrial layouts.
5. **Interactive Feedback**: All interactive elements MUST have a hover state, usually involving a scale increase (`hover:scale-105`) or color shift.

## Visual Reference (Checklist)
- [ ] Is the primary action color Purple (`hsl(271 81% 56%)`)?
- [ ] Are headers using Satoshi Black or Edo?
- [ ] Does the card use the project's glassmorphism pattern?
- [ ] are gradients applied to large surfaces (Hero/CTA)?
- [ ] Is there an industrial/mechanical "vibe" (mono labels, borders, high contrast)?
