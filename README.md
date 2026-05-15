<div align="center">
  
  <br />
  <a href="https://grantai.com" target="_blank">
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Rocket.png" alt="GrantAI Logo" width="100" />
  </a>
  <br />

  <h1 align="center"><span style="color: #06B6D4;">✦ GrantAI ✦</span></h1>

  <p align="center" style="font-size: 1.2rem; color: #94a3b8;">
    <b>The world's first fully autonomous, audit-proof R&D Tax Credit Engine.</b><br />
    Turn your development work into capital, instantly.
  </p>

  <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=800&size=22&duration=3000&pause=1000&color=06B6D4&center=true&vCenter=true&width=800&lines=Automated+R%26D+Tax+Credits;Real-time+Engineering+Data+Ingestion;Background+AI+Processing;Multi-Country+Support;Audit-Proof+Claim+Generation;Turn+Code+Into+Financial+Capital" alt="GrantAI Features" />

  <br />

  <div align="center">
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" /></a>
    <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" /></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-16-336791?style=for-the-badge&logo=supabase&logoColor=white" alt="PostgreSQL" /></a>
    <a href="https://stripe.com/"><img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" /></a>
  </div>
  
  <br />
  
  <p align="center">
    <a href="#-the-vision">Vision</a> • 
    <a href="#-core-features">Features</a> • 
    <a href="#-the-engine">How it Works</a> • 
    <a href="#-architecture">Architecture</a> • 
    <a href="#-quick-start">Quick Start</a>
  </p>

</div>

---

## 🌌 The Vision: Killing the $20B Consultancy Tax

The process of claiming **Research & Development (R&D) Tax Credits** is broken. Companies either lose thousands by attempting it themselves, or lose 20% of their return to expensive tax consultants who don't understand code.

**GrantAI** replaces the 25% success-fee consultant with a strict, deterministic AI engine. 

Moving beyond manual forms, GrantAI integrates directly into your engineering workflows (**GitHub, Jira, Linear**). It silently analyzes commits, pull requests, and tickets using advanced **Chain-of-Thought (CoT)** reasoning, mathematically calculating your R&D value in real-time.

---

## ✨ Core Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🔌 Continuous Ingestion</h3>
      <p>Native OAuth integrations with <b>GitHub</b>, <b>Jira</b>, and <b>Linear</b>. GrantAI silently listens to webhooks and logs your team's engineering events without disrupting their flow.</p>
    </td>
    <td width="50%" valign="top">
      <h3>🧠 Event-Driven AI</h3>
      <p>Using resilient background processing, raw logs are passed through a <b>Two-Pass AI Engine</b> to rigorously separate commercial tasks from genuine R&D.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🧮 Real-Time Financials</h3>
      <p>Transforms hours spent and AI confidence scores into a real-time <code>DailyValueMap</code>. Track exactly how much R&D capital your engineering team generated <b>today</b>.</p>
    </td>
    <td width="50%" valign="top">
      <h3>🏢 Multi-Tenancy & Global</h3>
      <p>Create multiple companies and workspaces, each with their own jurisdiction (UK, FR, DE, NL, etc.), currency, integrations, and meticulously tracked claims.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>💳 Dual Payment System</h3>
      <p>Seamlessly upgrade via <b>Stripe</b> (Fiat / Credit Cards) or <b>NOWPayments</b> (Crypto). Instant access provisioning via secure webhooks.</p>
    </td>
    <td width="50%" valign="top">
      <h3>🛡️ Audit-Proof Generation</h3>
      <p>Generates dry, highly technical, third-person defense narratives perfectly tuned for tax authority review. Zero marketing fluff.</p>
    </td>
  </tr>
</table>

---

## ⚙️ The Engine (Our Moat)

This isn't a simple "ChatGPT wrapper". We've engineered a proprietary **Two-Pass AI Engine paired with a Deterministic Math Calculator** compliant with the OECD Frascati Manual.

1. **Pass 1: The Skeptical Auditor (Chain-of-Thought)**
   Before generating text, our AI reasons step-by-step. It identifies the industry baseline, pinpoints the technical advance, and evaluates the methodology. If genuine technical uncertainty is missing, the engine *rejects* it.
2. **The Deterministic Core (Zero AI Math)**
   Tax laws are formulas, not suggestions. GrantAI routes approved projects through a hard-coded, math-only rules engine specific to the jurisdiction (e.g., applying the French 43% overhead *forfait*, or the German €2M salary cap).
3. **Pass 2: The Technical Writer**
   Approved metadata is synthesized into a robust defense narrative ready for the tax office.

---

## 🏗 Architecture Topology

GrantAI is built as a highly scalable, asynchronous, event-driven **Next.js App Router** application.

```mermaid
graph TD;
    subgraph "Data Sources (Webhooks)"
      GH([GitHub]):::source
      JR([Jira]):::source
      LN([Linear]):::source
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

    UI>Next.js Premium UI]:::ui

    GH -->|Payload| API
    JR -->|Payload| API
    LN -->|Payload| API

    API -->|Event| ING
    ING --> AI
    AI -->|Confidence + Justification| FIN
    FIN -->|Calculated Value| DB
    STR -->|Webhook| API
    
    DB --> UI

    classDef source fill:#1e293b,stroke:#334155,color:#cbd5e1;
    classDef backend fill:#0f172a,stroke:#38bdf8,color:#f8fafc;
    classDef worker fill:#312e81,stroke:#6366f1,color:#f8fafc;
    classDef ai fill:#4c1d95,stroke:#8b5cf6,color:#f8fafc;
    classDef database fill:#064e3b,stroke:#10b981,color:#f8fafc;
    classDef payment fill:#635BFF,stroke:#4f46e5,color:#ffffff;
    classDef ui fill:#020617,stroke:#06b6d4,color:#f8fafc,stroke-width:2px;
```

---

## 🚀 Quick Start Guide

<details>
<summary><b>1. Prerequisites</b></summary>
<br/>
<ul>
  <li><b>Node.js</b> (v18 or higher)</li>
  <li><b>PostgreSQL</b> database (Supabase recommended)</li>
  <li>API Keys for Stripe, NOWPayments, and OpenAI/Gemini</li>
</ul>
</details>

<details>
<summary><b>2. Installation</b></summary>
<br/>

Clone the repository and install dependencies:

```bash
cd frontend
npm install
```
</details>

<details>
<summary><b>3. Environment Configuration</b></summary>
<br/>

Create a `.env` file inside the `frontend` folder based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://user:pass@pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@pooler.supabase.com:5432/postgres"

# Authentication (NextAuth)
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# AI Engine
KIE_API_KEY="your-api-key"

# Payments
STRIPE_SECRET_KEY="sk_test_..."
NOWPAYMENTS_API_KEY="..."
```
</details>

<details>
<summary><b>4. Database & Seeding</b></summary>
<br/>

Push the Prisma schema to your database and run the initial seed to create the Admin account:

```bash
npx prisma migrate dev --name init
npm run prisma db seed
```
*(The seed script automatically provisions `admin@gmail.com` with `UNLIMITED` lifetime access).*
</details>

<details>
<summary><b>5. Ignite the Engine</b></summary>
<br/>

Run the development server:

```bash
npm run dev
```
Navigate to <kbd>http://localhost:3000</kbd> to access the platform.
</details>

---

## 🎨 Design System

GrantAI employs a "Premium Adaptive" design aesthetic:
- **Typography:** `Inter` (UI) and `Outfit` / `Font-Black` tracking for strong, commanding headers.
- **Color Palette:** Deep `slate-950` backgrounds contrasted with vivid `cyan-400` gradients and `emerald-400` success states.
- **Motion:** Heavy use of `framer-motion` for fluid scroll-snapping, parallax elements, and micro-interactions (e.g., pulsing status badges, glassmorphism hovers).

---

<div align="center">
  <p><i>Crafted with precision for the future of automated compliance.</i> ✦</p>
  <p><b>GrantAI — Code. Claim. Capital.</b></p>
</div>
