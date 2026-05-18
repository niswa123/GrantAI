---
name: feature-development
description: End-to-End workflow for building a new feature. Use this when the user asks to "build X", "add a new page for Y", or "create the Z feature".
---

# Workflow: Feature Development

## Objective
To build a new feature predictably, without breaking existing code, ensuring high quality on both the backend and frontend.

## Step 1: Context & Planning
1. **Understand the Goal:** Read the task carefully. Identify the core user value.
2. **Break it Down:** Apply `planning-and-task-breakdown` skill. 
   - Define the database schema changes (if any).
   - Define the API contract (Input/Output types).
   - Define the UI components required.
3. **Get Approval (Optional but Recommended):** If the feature is large, write the plan in a markdown file and ask the user to approve the task list.

## Step 2: Backend First (Vertical Slicing)
1. **Schema:** Update `schema.prisma` if needed. Run `npx prisma format` and `npx prisma generate` (or `db push` / migrations depending on the environment).
2. **API Design:** Apply `api-and-interface-design`. Create the Server Actions or Next.js API Routes.
3. **Testing Logic:** Apply `test-driven-development`. Write logic to handle the happy path and edge cases (e.g., validation, unauthorized access).

## Step 3: Frontend Implementation
1. **UI Engineering:** Apply `frontend-ui-engineering`. Create the React components. Use Tailwind CSS effectively.
2. **State Management:** Connect the UI to the backend Server Actions/API. Handle loading states, error states, and empty states.
3. **Design Polish:** Apply `impeccable`. Ensure the UI feels premium, accessible, and responsive.

## Step 4: Verification
1. **Self-Review:** Apply `code-review-and-quality`. 
   - Did I leave console.logs?
   - Is the UI responsive on mobile?
   - Are errors gracefully handled?
2. **Commit/Finish:** Summarize what was built for the user and provide instructions on how they can test it.
