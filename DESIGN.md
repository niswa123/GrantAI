# DESIGN.md — GrantAI Design System & Style Guide

## Color Strategy
We use a **Restrained & Committed** hybrid strategy: deep, high-contrast, tinted neutrals with a single high-precision color accent representing data flow and compliance.

### Color Tokens (OKLCH Space)
- **Background**: `oklch(14.07% 0.006 250)` — A deep, dark space-slate, slightly tinted blue to feel cold, technical, and professional. Never pure black `#000`.
- **Foreground (Text)**: `oklch(97.23% 0.002 250)` — Off-white neutral with minimal chroma.
- **Muted Text**: `oklch(62.3% 0.005 250)` — Mid-tone slate for supporting labels.
- **Accents (Deterministic Compliance)**:
  - Primary Cyan: `oklch(76.12% 0.156 210)` — High-precision accent for active state flow.
  - Positive Emerald: `oklch(79.3% 0.134 145)` — High-contrast success indicators.
  - Warning/Alert: `oklch(71.2% 0.165 45)` — Precise amber for technical uncertainties.

## Typography
- **Headings & Hierarchy**: Outlined or heavy high-contrast grotesque typography. Minimal flat scales are banned. Ensure heading scale is at least 1.25 ratio.
- **Monospace Elements**: Numbers, stats, dates, and technical logs must use a crisp, tabular monospaced font (`font-mono` / Geist Mono) to emphasize precision and financial/code authenticity.
- **Line Length**: Max 65–75ch for optimal reading and readability.

## Layout & Structure
- **No side-stripe borders**: Avoid arbitrary vertical/horizontal accents on borders.
- **No identical card grids**: Vary layouts based on information hierarchy. Do not repeat identical cards.
- **No text gradients**: Avoid decorative text gradient clipping. Text should have high-contrast solid colors.
- **No decorative blurs / glassmorphism**: Glassmorphism is banned as a default decorative element. Any transparent components must have crisp, structured solid borders and strict readability.

## Spacing & Rhythm
- Spacing follows a strict 4px/8px grid scale.
- Asymmetric padding is preferred to prevent uniform monotony.
