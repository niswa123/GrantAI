<div align="center">

# ✦ GrantAI

<p align="center">
  <strong>The intelligent R&D Tax Credit engine that turns your development work into capital.</strong>
</p>

<img src="https://readme-typing-svg.demolab.com?font=Inter&size=20&duration=3000&pause=1000&color=8B5CF6&center=true&vCenter=true&width=600&lines=Automated+R%26D+Tax+Credits;Audit-Proof+Claim+Generation;Chain-of-Thought+AI+Scoring;Multi-Country+Support" alt="GrantAI Features" />

---

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

</div>

---

## 🎯 The Vision

The process of claiming **Research & Development (R&D) Tax Credits** is broken. Companies either lose thousands by attempting it themselves, or lose 20% of their return to expensive tax consultants. 

**GrantAI** replaces the consultancy with a strict, audit-proof, deterministic AI engine. 

By employing advanced **Chain-of-Thought (CoT)** reasoning, GrantAI evaluates your software projects exactly like a Senior Big 4 Tax Director would: separating commercial fluff from genuine technological advancement, calculating exact credit limits, and generating formal justification texts ready for tax authority submission.

---

## ✨ Features (MVP)

*   🧠 **Two-Pass AI Engine**: 
    *   **Pass 1 (Classify):** Rigorous, low-temperature evaluation of *Technical Uncertainty* and *Methodology*.
    *   **Pass 2 (Generate):** High-quality, formal, 3rd-person claim text generation.
*   🧮 **Deterministic Credit Calculator**: Zero LLM hallucinations for the money. Tax rules for **NL (WBSO)**, **UK (RDEC/SME)**, **FR (CIR)**, and **DE (Forschungszulage)** are mathematically encoded with hard caps and tier support.
*   🏢 **Multi-Tenancy (Workspaces)**: Create multiple companies/workspaces, each with their own jurisdiction, currency, and R&D claims.
*   🎨 **Premium Dark UI**: Built with Tailwind CSS and Framer Motion for a stunning, glassmorphism-heavy, enterprise-grade feel.
*   🔐 **Secure Auth**: JWT-based session management with NextAuth.js.
*   🖼️ **Dynamic Avatars**: Upload your own image or let GrantAI generate a beautiful abstract geometric avatar.

---

## 🏗 Architecture

GrantAI is built as a robust monolithic **Next.js App Router** application.

```mermaid
graph TD;
    A[Client UI / React] -->|Input Project & Costs| B(Next.js Server Actions / API);
    B --> C{Workspace Jurisdiction Lookup};
    C --> D[AI Core: Pass 1 Classify];
    D --> E{Is R&D Eligible?};
    E -- No --> F[Return 'Not R&D' Result];
    E -- Yes --> G[AI Core: Pass 2 Generate Claim];
    G --> H[Deterministic Credit Calculator];
    H --> I[(PostgreSQL / Prisma)];
    I --> J[Return Formatted Markdown to UI];
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- PostgreSQL running locally or in the cloud.

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
KIE_API_KEY="your-kie-ai-api-key"
```

### 4. Database Setup
Push the Prisma schema to your database and generate the client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Run the Engine
```bash
npm run dev
```
Navigate to `http://localhost:3000` to access the platform.

---

## 📁 Core Directory Structure

```text
frontend/
├── prisma/                 # Database schema
├── src/
│   ├── ai_core/            # Deprecated (moved to rd-engine)
│   ├── app/                # Next.js App Router pages & API routes
│   │   ├── api/calculate/  # The core R&D pipeline endpoint
│   │   └── dashboard/      # Secure user workspace
│   ├── components/         # Reusable React components (Tailwind)
│   ├── lib/
│   │   ├── prisma.ts       # Prisma Client singleton
│   │   ├── auth.ts         # NextAuth configuration
│   │   └── rd-engine/      # 🧠 The core scoring & calculation pipeline
│   │       ├── pipeline.ts # LLM Pass 1 & Pass 2
│   │       ├── credit-calculator.ts # Deterministic math
│   │       ├── llm-client.ts        # Resilient AI fetcher
│   │       └── legal_rules/         # International tax code configurations
│   └── providers/          # React Context (Session, Workspace)
```

---

<div align="center">
  <p>Built for the future of automated compliance. ✦</p>
</div>
