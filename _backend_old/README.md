# GrantAI Backend

## Quick Start

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Install dependencies
npm install

# 3. Copy env file and configure
cp .env.example .env

# 4. Run migrations (requires DB running)
npx prisma migrate deploy

# 5. Start dev server
npm run start:dev
```

## Architecture

```
src/
├── common/
│   ├── decorators/       # @CurrentUser()
│   ├── exceptions/       # AppException, NotFoundException, etc.
│   ├── filters/          # AllExceptionsFilter (global)
│   ├── guards/           # JwtAuthGuard
│   └── prisma/           # PrismaService (global module)
│
└── modules/
    ├── auth/             # POST /auth/register, /auth/login
    ├── company/          # CRUD /company
    ├── projects/         # CRUD /company/:id/projects
    ├── expenses/         # CRUD /company/:id/expenses
    ├── analysis/         # POST /company/:id/analysis/run
    └── claims/           # /company/:id/claims (generate + submit)
```

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/v1/auth/register | ❌ | Register user |
| POST | /api/v1/auth/login | ❌ | Login → JWT |
| GET/POST | /api/v1/company | ✅ | Company CRUD |
| GET/POST | /api/v1/company/:id/projects | ✅ | Projects CRUD |
| GET/POST | /api/v1/company/:id/expenses | ✅ | Expenses CRUD |
| POST | /api/v1/company/:id/analysis/run | ✅ | Run R&D analysis |
| POST | /api/v1/company/:id/claims/generate | ✅ | Generate claim |
| POST | /api/v1/company/:id/claims/:id/submit | ✅ | Submit claim |

## R&D Calculation Logic

- **Project scoring**: keyword classifier (algorithm, ai, platform, data, model…) → `rd_score` 0.1–0.9
- **Expense classification**: `salary` + `contractor` types → `is_rd_related = true`
- **Credit rate**: `estimated_amount = rd_expenses_total × 0.2` (configurable in `analysis.service.ts`)
- **Audit trail**: every calculation step logged with `[AUDIT]` prefix

## Error Shape

All errors follow `{ error, code, message }` — no exceptions.
