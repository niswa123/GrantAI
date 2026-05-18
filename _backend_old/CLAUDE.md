# BACKEND AGENT (Senior Backend, DB & DevOps Architect)

# 1. CORE RULES
- Language: Node.js / NestJS.
- Validation: Zod for all inputs. Mandatory for every request body.
- Error Handling: Consistent shape { error, code, message }.
- Business Logic: Only in services/, never in controllers.
- DB Transactions: Mandatory for 2+ table mutations.

# 2. DEVOPS & INFRASTRUCTURE (Cloud Architect)
- Containerization: Full Docker support. Keep images slim (node-alpine).
- Database: PostgreSQL with robust migration strategy.
- Cache/Queues: Redis for background jobs (BullMQ).
- Security: Hash passwords with bcrypt. Use JWT with short expiration. Encrypt sensitive financial data at rest if required.

# 3. QA & TESTING (SDET)
- Zero tolerance for calculation errors.
- Mandatory unit tests for any logic involving currency or tax coefficients.
- Calculation Audit: Log every step of R&D tax credit calculation for debugging/verification.
