<div align="center">

<!-- Hero Header with Native Emojis -->
<h1 align="center" style="font-size: 3rem;">🚀 💸 🧠</h1>

<br/>

<h1 align="center">
  <span style="color: #06B6D4;">GRANT.AI</span><br/>
  CODE → CAPITAL<br/>
  R&D TAX CREDITS ON AUTOPILOT
</h1>

<p align="center" style="font-size: 1.4rem;">
  <b>The world's first fully autonomous, audit-proof R&D Tax Credit Engine.</b>
</p>

<!-- Animated Tech Stack Badges (Shields.io is extremely stable) -->
<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-336791?style=for-the-badge&logo=supabase&logoColor=white" /></a>
  <a href="https://stripe.com/"><img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white" /></a>
  <a href="https://nowpayments.io/"><img src="https://img.shields.io/badge/Crypto_Payments-F3BA2F?style=for-the-badge&logo=binance&logoColor=black" /></a>
</p>

---

</div>

## 🌌 The Vision: Killing the $20B Consultancy Tax

<div align="center">
  <i>"Engineering teams build the future. Tax consultants shouldn't take 20% of it."</i>
</div>

<br/>

The process of claiming **Research & Development (R&D) Tax Credits** is broken. Companies either lose thousands of hours attempting it themselves or bleed **20-25%** of their return to expensive tax consultants who don't even understand the code being written.

**GrantAI** replaces the success-fee consultant with a strict, deterministic AI engine. We integrate natively into your DevOps pipelines to mathematically calculate and defend your R&D value in real-time.

---

## ⚡ Core Architecture

<table align="center">
  <tr>
    <td align="center" width="50%">
      <h1 style="margin: 0;">💻</h1>
      <b>1. Continuous Ingestion</b>
      <br />
      <p align="left">Native OAuth integrations with <b>GitHub</b>, <b>Jira</b>, and <b>Linear</b>. Silently listens to webhooks and logs your team's engineering events without disrupting their flow.</p>
    </td>
    <td align="center" width="50%">
      <h1 style="margin: 0;">🕵️‍♂️</h1>
      <b>2. Two-Pass AI Engine</b>
      <br />
      <p align="left">Raw logs pass through a Skeptical Auditor (Chain-of-Thought) to separate commercial boilerplate from genuine technical R&D based on OECD Frascati rules.</p>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <h1 style="margin: 0;">🧮</h1>
      <b>3. Real-Time Math</b>
      <br />
      <p align="left">AI doesn't count money. GrantAI routes approved projects through a hard-coded, math-only rules engine specific to your jurisdiction (UK, FR, DE, NL, US).</p>
    </td>
    <td align="center" width="50%">
      <h1 style="margin: 0;">🛡️</h1>
      <b>4. Audit-Proof Generation</b>
      <br />
      <p align="left">Generates dry, highly technical, third-person defense narratives perfectly tuned for tax authority review. Zero marketing fluff. 100% compliant.</p>
    </td>
  </tr>
</table>

---

## 🏗 System Topology

GrantAI is built as a highly scalable, asynchronous, event-driven application.

```mermaid
graph TD;
    subgraph "Data Sources"
      GH([GitHub]):::source
      JR([Jira]):::source
    end

    subgraph "GrantAI Backend"
      API[Next.js API Ingress]:::backend
      ING((Job Queue)):::worker
      AI{AI Engine}:::ai
      FIN[Financial Rules Engine]:::backend
    end

    subgraph "Payments & Data"
      STR([Stripe / Crypto]):::payment
      DB[(Supabase PostgreSQL)]:::database
    end

    GH -->|Payload| API
    JR -->|Payload| API

    API -->|Event| ING
    ING --> AI
    AI -->|Confidence + Justification| FIN
    FIN -->|Calculated Value| DB
    STR -->|Webhook| API

    classDef source fill:#1e293b,stroke:#334155,color:#cbd5e1;
    classDef backend fill:#0f172a,stroke:#06b6d4,color:#f8fafc;
    classDef worker fill:#312e81,stroke:#6366f1,color:#f8fafc;
    classDef ai fill:#4c1d95,stroke:#a855f7,color:#f8fafc;
    classDef database fill:#064e3b,stroke:#10b981,color:#f8fafc;
    classDef payment fill:#635BFF,stroke:#818cf8,color:#ffffff;
```

---

## 🚀 Quick Start Guide

> [!IMPORTANT]
> Make sure you have **Node.js 18+**, a **PostgreSQL** database (Supabase), and your API keys ready (KIE.AI, Stripe, NOWPayments).

### 1. Installation

```bash
cd frontend
npm install
```

### 2. Environment Setup

Create `.env` in the `frontend` directory:

```env
DATABASE_URL="postgresql://user:pass@pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@pooler.supabase.com:5432/postgres"

NEXTAUTH_SECRET="your-secure-secret"
NEXTAUTH_URL="http://localhost:3000"

KIE_API_KEY="sk-..." # Drives the Two-Pass AI Engine

STRIPE_SECRET_KEY="sk_test_..."
NOWPAYMENTS_API_KEY="..."
```

### 3. Ignite

```bash
npx prisma migrate dev --name init
npm run prisma db seed
npm run dev
```

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" width="100%">

<div align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Diamond%20with%20a%20Dot.png" alt="Diamond" width="40" />
  <p><i>Crafted with precision for the future of automated compliance.</i></p>
  <h3><b>GrantAI — Code. Claim. Capital.</b></h3>
</div>
