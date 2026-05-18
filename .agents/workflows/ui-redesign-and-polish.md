---
name: ui-redesign-and-polish
description: Workflow for redesigning, improving, or polishing an existing User Interface.
---

# Workflow: UI Redesign & Polish

## Objective
Transform a generic, "AI-looking" or clunky interface into a premium, production-grade experience that delights the user.

## Step 1: UI/UX Audit
1. **Analyze the Current State:** Read the component/page code.
2. **Apply `impeccable` skill:** Look for AI anti-patterns (e.g., purple/indigo defaults, rounded-2xl everywhere, excessive gradients, lack of proper spacing).
3. **Identify Missing States:** Does the UI handle loading states? What about when the data is empty? How are errors displayed?

## Step 2: Shape & Redesign
1. **Typography & Hierarchy:** Ensure H1, H2, H3 follow a strict scale.
2. **Color Strategy:** Stick to the project's brand palette. Use semantic colors (e.g., text-muted, bg-surface).
3. **Structure & Layout:** Remove unnecessary cards. Use grids and flexbox thoughtfully. Ensure content breathes with proper padding/margins.

## Step 3: Implementation & Interactivity
1. **Apply `frontend-ui-engineering`:** Refactor the React code. Keep components focused and composable.
2. **Micro-interactions:** Add subtle hover states (`hover:bg-accent`, `transition-all`), focus rings for accessibility, and active states.
3. **Accessibility (a11y):** Ensure interactive elements are `button` or `a` tags. Check ARIA labels for icon-only buttons. Keyboard navigation must work perfectly.

## Step 4: Final Polish
1. **Mobile Responsiveness:** Ensure the design gracefully degrades on small screens (`sm:`, `md:`, `lg:` breakpoints).
2. **Review:** Present the redesigned UI to the user. Explain *why* the design choices were made (e.g., "I removed the heavy box-shadows to flatten the hierarchy and make the text easier to read").
