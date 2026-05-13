<div align="center">
  <br />
  <a href="https://grantai.com">
    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Rocket.png" alt="GrantAI Logo" width="80" />
  </a>
  
  <h1 align="center">✦ GrantAI ✦</h1>

  <p align="center">
    <b>The intelligent R&D Tax Credit engine that turns your development work into capital.</b>
  </p>

  <img src="https://readme-typing-svg.demolab.com?font=Inter&size=18&duration=3000&pause=1000&color=06B6D4&center=true&vCenter=true&width=600&lines=Automated+R%26D+Tax+Credits;Real-time+Engineering+Data+Ingestion;Background+AI+Processing;Multi-Country+Support;Audit-Proof+Claim+Generation" alt="GrantAI Features" />

  <br />

  <div align="center">
    <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Inngest-Background_Jobs-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Inngest" />
  </div>
</div>

<br />

---

## 🌌 The Vision

The process of claiming **Research & Development (R&D) Tax Credits** is broken. Companies either lose thousands by attempting it themselves, or lose 20% of their return to expensive tax consultants. 

**GrantAI** replaces the consultancy with a strict, audit-proof, deterministic AI engine. 

Moving beyond manual forms, GrantAI integrates directly into your engineering workflows (GitHub, Jira, Linear). It asynchronously analyzes commits, pull requests, and tickets in the background using advanced **Chain-of-Thought (CoT)** reasoning, tracking your R&D value in real-time.

---

## ✨ Engineering Excellence

<table>
  <tr>
    <td width="50%">
      <h3>🔌 Continuous Ingestion</h3>
      <p>Native OAuth integrations with <b>GitHub</b>, <b>Jira</b>, and <b>Linear</b>. GrantAI silently listens to webhooks and logs your team's engineering events without disrupting their flow.</p>
    </td>
    <td width="50%">
      <h3>🧠 Event-Driven AI</h3>
      <p>Using <b>Inngest</b> for resilient background processing, raw logs are passed through a two-pass AI classification engine to separate commercial tasks from genuine R&D.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🧮 Real-Time Financials</h3>
      <p>Transforms hours spent and AI confidence scores into a real-time <code>DailyValueMap</code>. Track exactly how much R&D capital your engineering team generated today.</p>
    </td>
    <td width="50%">
      <h3>🏢 Multi-Tenancy</h3>
      <p>Create multiple companies and workspaces, each with their own jurisdiction, currency, integrations, and meticulously tracked R&D claims.</p>
    </td>
  </tr>
</table>

---

## 🏗 Architecture Topology

GrantAI is built as a highly scalable, asynchronous, event-driven **Next.js App Router** application.

```mermaid
graph TD;
    subgraph "Data Sources"
      GH([GitHub Webhooks]):::source
      JR([Jira Webhooks]):::source
      LN([Linear Webhooks]):::source
    end

    subgraph "GrantAI Backend"
      API[Next.js API Ingress]:::backend
      ING((Inngest Workers)):::worker
      AI{AI Engine}:::ai
      FIN[Financial Layer]:::backend
    end

    DB[(PostgreSQL)]:::database
    UI>Next.js Dashboard]:::ui

    GH -->|Payload| API
    JR -->|Payload| API
    LN -->|Payload| API

    API -->|engineering/event.received| ING
    ING --> AI
    AI -->|Confidence + Justification| FIN
    FIN -->|Calculated Value| DB
    
    DB --> UI

    classDef source fill:#1e293b,stroke:#334155,color:#cbd5e1;
    classDef backend fill:#0f172a,stroke:#38bdf8,color:#f8fafc;
    classDef worker fill:#312e81,stroke:#6366f1,color:#f8fafc;
    classDef ai fill:#4c1d95,stroke:#8b5cf6,color:#f8fafc;
    classDef database fill:#064e3b,stroke:#10b981,color:#f8fafc;
    classDef ui fill:#020617,stroke:#06b6d4,color:#f8fafc;
```

---

## 🚀 Quick Start Guide

<details>
<summary><b>1. Prerequisites</b></summary>
<br/>
<ul>
  <li>Node.js (v18 or higher)</li>
  <li>PostgreSQL running locally or in the cloud (e.g., Supabase)</li>
  <li>An Inngest account or local Inngest Dev Server</li>
</ul>
</details>

<details>
<summary><b>2. Installation</b></summary>
<br/>
Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```
</details>

<details>
<summary><b>3. Environment Configuration</b></summary>
<br/>
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
</details>

<details>
<summary><b>4. Database Initialization</b></summary>
<br/>
Push the Prisma schema to your database (or run the SQL migration files for Supabase poolers):

```bash
npx prisma generate
npx prisma db push
```
</details>

<details>
<summary><b>5. Ignite the Engine</b></summary>
<br/>
Run the development server and the Inngest local dev server concurrently:

```bash
npm run dev
# In a new terminal window:
npx inngest-cli@latest dev
```
Navigate to <kbd>http://localhost:3000</kbd> to access the platform.
</details>

---

<div align="center">
  <p><i>Crafted with precision for the future of automated compliance.</i> ✦</p>
</div>
