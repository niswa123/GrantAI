<div align="center">
  <img src="./frontend/public/logo.png" alt="GrantAI Logo" width="200" height="200" style="border-radius: 24px;" />
  <h1 style="font-size: 3rem; margin-bottom: 0;">GrantAI 🚀</h1>
  <p style="font-size: 1.2rem; color: #94a3b8;">
    <strong>The Future of Automated R&D Tax Credits</strong>
  </p>
  <p>
    Convert R&D engineering efforts into audit-proof tax credits using AI-powered precision.<br/>
    Simple, fast, compliant, and deeply integrated with your existing developer stack.
  </p>
  <br/>
  <p>
    <a href="#features"><strong>Features</strong></a> ·
    <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
    <a href="#getting-started"><strong>Getting Started</strong></a> ·
    <a href="#security"><strong>Security</strong></a>
  </p>
</div>

---

## 🌟 Overview

GrantAI is a modern, enterprise-grade SaaS application that connects directly to your engineering ecosystem (GitHub, Jira, Linear) to analyze commits, issues, and tickets. Using a sophisticated two-pass LLM pipeline, it identifies R&D-eligible work and generates compliant, audit-ready claims in minutes instead of months.

Designed for speed, built for compliance, and engineered for maximum security.

## ✨ Key Features

- **🪄 Magic Sync:** Non-blocking, background synchronization with your engineering tools. Features a "Labour Illusion" UI to provide transparent, real-time feedback on AI analysis.
- **🧠 Two-Pass LLM Engine:** Accurately classifies R&D eligible work based on localized tax rules and generates deterministic credit calculations.
- **🔗 Deep Integrations:** Natively syncs with **GitHub**, **Jira**, and **Linear** via OAuth.
- **💳 Multi-Provider Billing:** Seamlessly accept fiat subscriptions via **Stripe** and cryptocurrency payments via **NOWPayments**.
- **🛡️ Enterprise Security:** Fully protected routes, sliding-window rate limiting, Turnstile CAPTCHA bot protection, and resilient bcrypt-hashing implementations.
- **🔐 Tier-Based Access Control:** Granular access management for Free, Pro, and Enterprise users.
- **🧑‍💻 Beautiful UI/UX:** Built with modern design principles (glassmorphism, micro-animations, tailored dark mode palettes) for a premium feel.

## 🛠 Tech Stack

### Frontend & Core
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS Modules
- **UI Components:** Shadcn/UI (Radix Primitives)
- **Animations:** Framer Motion & Lucide Icons

### Backend & Data
- **Database:** PostgreSQL (hosted on [Supabase](https://supabase.com/))
- **ORM:** [Prisma](https://www.prisma.io/)
- **Auth:** NextAuth (Google/GitHub/Credentials) + custom 2FA (TOTP)
- **Background Jobs:** [Inngest](https://www.inngest.com/)

### Integrations
- **Payments:** Stripe (Fiat), NOWPayments (Crypto)
- **AI Processing:** Gemini / KIE.AI (via dedicated API routes)
- **Email:** Resend & Loops (Marketing Automation)
- **CRM:** Attio

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- API Keys for necessary providers (Stripe, Resend, Turnstile, OAuth apps)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/grantai.git
cd grantai/frontend
npm install
```

### 2. Environment Setup

Create a `.env` file in the `frontend/` directory (see `.env.example` if available). 
Required critical variables:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Payments
STRIPE_SECRET_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
NOWPAYMENTS_IPN_SECRET="..."

# Security
TURNSTILE_SECRET_KEY="..."
```

### 3. Database Migration

Generate the Prisma client and push the schema to your database:

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔒 Security Posture

GrantAI handles sensitive financial and engineering data, making security paramount:
- **Rate Limiting:** Edge-safe, in-memory sliding window rate limits on critical endpoints (Registration, Password Reset, AI Calculation) to prevent abuse.
- **DoS Protection:** Strict input validation and Bcrypt DoS mitigations (password length enforcement).
- **Authentication:** Turnstile server-side validation against bots, required email verification gates, and robust NextAuth configuration.
- **Webhook Integrity:** HMAC-SHA512 validation for NOWPayments and official Stripe signature verification.

## 📄 License

Proprietary Software. All rights reserved by the GrantAI Team.
