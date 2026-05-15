---
name: production-deployment-check
description: Workflow for finalizing the project and pushing to production environments like Vercel.
---

# Workflow: Production Deployment Check

## Objective
To ensure the application is completely hardened, error-free, and securely configured before it is deployed to production.

## Step 1: Environment & Secrets Audit
1. **Check Variables:** Ensure all required `.env` variables are documented in a `.env.example` file.
2. **URLs:** Verify that callback URLs (NextAuth, OAuth providers, etc.) use production domains, not `localhost:3000`.
3. **Secrets:** Verify that `NEXTAUTH_SECRET` and database passwords are securely generated and not hardcoded anywhere in the codebase.

## Step 2: Database & Migrations
1. **Migration State:** Ensure Prisma schema is fully synced with the production database.
2. **Direct vs Pooler:** Verify that the connection pooler URL (e.g., PgBouncer port 6543) is used for `DATABASE_URL` and direct connection (port 5432) is used for `DIRECT_URL`.

## Step 3: Build & Compilation Check
1. **Type Checking:** Run `npx tsc --noEmit` to catch any hidden TypeScript errors.
2. **Linting:** Run `npm run lint` to catch React hook dependency issues or unused variables.
3. **Production Build:** Run `npm run build` locally. If it fails here, it will fail on Vercel. Fix ALL build errors.

## Step 4: Final Quality Assurance
1. **Apply `code-review-and-quality`:** 
   - No mock data should be left in production components.
   - All console logs should be removed or replaced with proper logging.
   - Loading and Error states must be handled gracefully without crashing the app.
2. **Sign-off:** Provide a summary to the user confirming the build succeeded and the project is ready to be pushed to GitHub/Vercel.
