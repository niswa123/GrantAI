<div align="center">

# ✦ GrantAI

<p align="center">
  <strong>The intelligent R&D Tax Credit engine that turns your development work into capital.</strong>
</p>

<img src="https://readme-typing-svg.demolab.com?font=Inter&size=20&duration=3000&pause=1000&color=8B5CF6&center=true&vCenter=true&width=600&lines=Automated+R%26D+Tax+Credits;Real-time+Engineering+Data+Ingestion;Background+AI+Processing;Multi-Country+Support" alt="GrantAI Features" />

---

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Inngest](https://img.shields.io/badge/Inngest-Background_Jobs-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://www.inngest.com/)

</div>

---

## 🎯 The Vision

The process of claiming **Research & Development (R&D) Tax Credits** is broken. Companies either lose thousands by attempting it themselves, or lose 20% of their return to expensive tax consultants. 

**GrantAI** replaces the consultancy with a strict, audit-proof, deterministic AI engine. 

Moving beyond manual forms, GrantAI integrates directly into your engineering workflows (GitHub, Jira, Linear). It asynchronously analyzes commits, pull requests, and tickets in the background using advanced **Chain-of-Thought (CoT)** reasoning, tracking your R&D value in real-time.

---

## ✨ Features

*   🔌 **Continuous Engineering Ingestion**: Native OAuth integrations with **GitHub**, **Jira**, and **Linear**. GrantAI silently listens to webhooks and logs your team's engineering events.
*   🧠 **Event-Driven AI Analysis**: Using **Inngest** for resilient background processing, raw logs are processed through a two-pass AI classification engine to separate commercial tasks from genuine R&D.
*   🧮 **Real-Time Financial Engine**: Transforms hours spent and AI confidence scores into a real-time `DailyValueMap`. Track exactly how much R&D capital your engineering team generated today.
*   🏢 **Multi-Tenancy (Workspaces)**: Create multiple companies/workspaces, each with their own jurisdiction, currency, integrations, and R&D claims.
*   🎨 **Premium Dark UI**: Built with Tailwind CSS and Framer Motion for a stunning, glassmorphism-heavy, enterprise-grade feel.
*   🔐 **Secure Auth & OAuth**: JWT-based session management, securely storing integration tokens.

---

## 🏗 Architecture

GrantAI is built as an asynchronous, event-driven **Next.js App Router** application.

```mermaid
graph TD;
    subgraph Data Sources
      GH[GitHub Webhooks]
      JR[Jira Webhooks]
      LN[Linear Webhooks]
    end

    subgraph GrantAI Backend
      API[Next.js API Ingress]
      ING[Inngest Background Workers]
      AI[AI Analysis Engine]
      FIN[Financial Aggregation Layer]
    end

    DB[(PostgreSQL / Supabase)]

    GH -->|Payload| API
    JR -->|Payload| API
    LN -->|Payload| API

    API -->|engineering/event.received| ING
    ING --> AI
    AI -->|Confidence Score + Justification| FIN
    FIN -->|Calculated Value| DB
    
    DB --> UI[Next.js Client Dashboard]
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- PostgreSQL running locally or in the cloud (Supabase)
- An Inngest account or local Inngest Dev Server

### 2. Installation

Navigate to the frontend directory:
```bash
cd frontend
npm install
```

### 3. Environment Variables
Create a `.env` file inside the `frontend` folder:
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/grantai?schema=public"

# Authentication (NextAuth)
NEXTAUTH_SECRET="generate-a-secure-random-string-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Engine
OPENAI_API_KEY="sk-..."

# Integrations
GITHUB_INTEGRATION_CLIENT_ID="..."
GITHUB_INTEGRATION_CLIENT_SECRET="..."
JIRA_CLIENT_ID="..."
JIRA_CLIENT_SECRET="..."
LINEAR_CLIENT_ID="..."
LINEAR_CLIENT_SECRET="..."
```

### 4. Database Setup
Push the Prisma schema to your database (or run the SQL migration files for Supabase poolers):
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Engine
Run the development server and the Inngest local dev server:
```bash
npm run dev
npx inngest-cli@latest dev
```
Navigate to `http://localhost:3000` to access the platform.

---

## 📁 Core Directory Structure

```text
frontend/
├── prisma/                 # Database schema & Migrations
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/integrations/ # OAuth Callback & Connect routes
│   │   ├── api/webhooks/   # Ingress points for 3rd party events
│   │   ├── api/inngest/    # Inngest API handler
│   │   └── dashboard/      # Secure user workspace
│   ├── components/         # Reusable React components (Tailwind)
│   ├── inngest/            # Background job definitions and client
│   ├── lib/
│   │   ├── prisma.ts       # Prisma Client singleton
│   │   ├── auth.ts         # NextAuth configuration
│   │   ├── rd-engine/      # 🧠 The core scoring & calculation pipeline
│   │   └── financial-engine.ts # Calculates daily R&D value
│   └── providers/          # React Context (Session, Workspace)
```

---

<div align="center">
  <p>Built for the future of automated compliance. ✦</p>
</div>
