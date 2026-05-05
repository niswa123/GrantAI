# 🚀 GrantAI - R&D Tax Credit Analysis Platform

<div align="center">

![GrantAI](https://img.shields.io/badge/GrantAI-v0.1.0-blue?style=for-the-badge)
![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?style=for-the-badge&logo=nestjs)
![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-336791?style=for-the-badge&logo=postgresql)

**Automated platform for calculating and submitting R&D tax credit claims**

[Quick Start](#-quick-start) • [Features](#-features) • [Documentation](#-documentation) • [API](#-api)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [API](#-api)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🎯 About

**GrantAI** is a full-featured platform for automating the R&D tax credit application process. The system uses AI to classify projects, calculate tax deductions, and generate claims for government agencies.

### Who is it for?

- 🏢 **Companies** - automate R&D tax credit calculations
- 👥 **Teams** - collaborate on claims
- 🌍 **International companies** - support for NL, UK, FR, DE
- 🔗 **Developers** - integrate with GitHub and Jira

---

## ✨ Features

### 🤖 AI-Powered Project Analysis
- Automatic R&D project classification
- Tax deduction calculations by country
- LLM-powered claim description generation
- Support for NL, UK, FR, DE tax rules

### 🔗 Integrations
- **GitHub** - import repositories and auto-populate projects
- **Jira** - sync projects and issues
- OAuth 2.0 authentication
- Automatic technical information extraction

### 👥 Team Collaboration
- Multi-user access to companies
- Roles: Owner, Admin, Member, Viewer
- Email-based member invitations
- Ownership transfer

### 📊 Audit & Logging
- Complete change history
- User action tracking
- Activity statistics
- Event type filtering

### 📄 Claim Export
- Multiple formats: PDF, XML, JSON, CSV
- Country-specific formats
- Submission status tracking
- Complete submission history

### 📈 Analytics
- Metrics dashboard
- R&D vs Non-R&D expense charts
- Conversion funnel
- Project reports

---

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS 11.0
- **Language**: TypeScript 5.7
- **Database**: PostgreSQL + Prisma ORM
- **Queue**: BullMQ + Redis
- **Auth**: JWT + Passport
- **Validation**: Zod
- **Logging**: Pino
- **PDF**: PDFKit

### Frontend
- **Framework**: Next.js 16.2 (App Router)
- **Language**: TypeScript 5
- **UI**: React 19 + Tailwind CSS 4
- **Components**: Radix UI + shadcn/ui
- **State**: TanStack Query
- **Charts**: Recharts
- **Animations**: Framer Motion

### DevOps
- **Containerization**: Docker + Docker Compose
- **Database Migrations**: Prisma Migrate
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/grantai.git
cd grantai
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Database Setup

```bash
cd backend

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env and set DATABASE_URL

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

### 4. Configure Integrations (Optional)

To enable GitHub and Jira integrations, create OAuth apps:

📖 **Detailed guide**: [SETUP_TUTORIAL_RU.md](./SETUP_TUTORIAL_RU.md) (Russian)

### 5. Start Application

```bash
# Backend (terminal 1)
cd backend
npm run start:dev

# Frontend (terminal 2)
cd frontend
npm run dev
```

🎉 **Done!**
- Backend: http://localhost:3000
- Frontend: http://localhost:3001

---

## 📁 Project Structure

```
grantai/
├── backend/                    # NestJS Backend
│   ├── prisma/                # Database schema & migrations
│   │   ├── schema.prisma      # Prisma schema
│   │   └── migrations/        # Database migrations
│   ├── src/
│   │   ├── common/            # Common modules
│   │   │   ├── decorators/    # Decorators
│   │   │   ├── filters/       # Exception filters
│   │   │   ├── guards/        # Auth guards
│   │   │   ├── prisma/        # Prisma service
│   │   │   └── queue/         # BullMQ queue
│   │   ├── modules/           # Business modules
│   │   │   ├── auth/          # Authentication
│   │   │   ├── company/       # Company management
│   │   │   ├── projects/      # Projects
│   │   │   ├── expenses/      # Expenses
│   │   │   ├── analysis/      # AI analysis
│   │   │   ├── claims/        # Claims
│   │   │   ├── analytics/     # Analytics
│   │   │   ├── integrations/  # GitHub/Jira
│   │   │   ├── team/          # Team collaboration
│   │   │   └── submissions/   # Claim export
│   │   ├── app.module.ts      # Root module
│   │   └── main.ts            # Entry point
│   ├── test/                  # E2E tests
│   ├── .env.example           # Environment variables example
│   └── package.json
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── dashboard/     # Dashboard
│   │   │   ├── company/       # Companies
│   │   │   ├── projects/      # Projects
│   │   │   ├── expenses/      # Expenses
│   │   │   ├── analysis/      # Analysis
│   │   │   ├── claims/        # Claims
│   │   │   └── analytics/     # Analytics
│   │   ├── components/        # React components
│   │   ├── lib/               # Utilities
│   │   └── hooks/             # Custom hooks
│   ├── public/                # Static files
│   └── package.json
│
├── ai_core/                    # AI modules (optional)
│   ├── legal_rules/           # Tax rules
│   └── prompts/               # LLM prompts
│
├── docs/                       # Documentation
│   ├── SETUP_TUTORIAL_RU.md   # 🇷🇺 Setup guide (Russian)
│   ├── API_EXAMPLES_RU.md     # 🇷🇺 API examples (Russian)
│   └── TODO.md                # Task list
│
└── README.md                   # This file
```

---

## 📚 Documentation

### Guides (Russian)

| Document | Description |
|----------|-------------|
| [SETUP_TUTORIAL_RU.md](./SETUP_TUTORIAL_RU.md) | 🚀 Complete setup guide |
| [API_EXAMPLES_RU.md](./API_EXAMPLES_RU.md) | 📡 API examples with curl |
| [TODO.md](./TODO.md) | ✅ Implemented features list |

### Modules

- **Integrations**: `backend/src/modules/integrations/QUICK_START.md`
- **Teams**: Documentation in `team` module code
- **Export**: Documentation in `submissions` module code

---

## 🔌 API

### Base URL

```
http://localhost:3000/api
```

### Authentication

All protected endpoints require JWT token:

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

### Main Endpoints

#### 🔐 Authentication
```
POST   /auth/register          # Register
POST   /auth/login             # Login
GET    /auth/profile           # Profile
```

#### 🏢 Companies
```
GET    /company                # List companies
POST   /company                # Create company
GET    /company/:id            # Get company
PUT    /company/:id            # Update company
DELETE /company/:id            # Delete company
```

#### 📊 Projects
```
GET    /projects               # List projects
POST   /projects               # Create project
PUT    /projects/:id           # Update project
DELETE /projects/:id           # Delete project
```

#### 💰 Expenses
```
GET    /expenses               # List expenses
POST   /expenses               # Create expense
PUT    /expenses/:id           # Update expense
DELETE /expenses/:id           # Delete expense
```

#### 🤖 Analysis
```
POST   /analysis/run           # Run analysis
GET    /analysis/:id           # Get results
```

#### 📄 Claims
```
GET    /claims                 # List claims
POST   /claims/generate        # Generate claim
GET    /claims/:id/pdf         # Download PDF
```

#### 🔗 Integrations
```
GET    /integrations/github/authorize              # GitHub OAuth
GET    /integrations/github/repositories           # Repositories
GET    /integrations/github/project-suggestions    # Project suggestions
GET    /integrations/jira/authorize                # Jira OAuth
GET    /integrations/jira/projects                 # Jira projects
```

#### 👥 Teams
```
GET    /team/companies/:id/members                 # Members
POST   /team/companies/:id/members                 # Invite
PUT    /team/companies/:id/members/:userId/role    # Change role
DELETE /team/companies/:id/members/:userId         # Remove
GET    /team/companies/:id/activity                # Activity logs
```

#### 📤 Export
```
POST   /submissions/claims/:id/export              # Export
GET    /submissions/:id                            # Get submission
PUT    /submissions/:id/status                     # Update status
```

📖 **Full API documentation**: [API_EXAMPLES_RU.md](./API_EXAMPLES_RU.md) (Russian)

---

## 💻 Development

### Run in Development Mode

```bash
# Backend with hot-reload
cd backend
npm run start:dev

# Frontend with hot-reload
cd frontend
npm run dev
```

### Database Operations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database (CAUTION!)
npx prisma migrate reset
```

### Linting and Formatting

```bash
# Backend
cd backend
npm run lint          # Check
npm run format        # Format

# Frontend
cd frontend
npm run lint          # Check
```

### Environment Variables

#### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/grantai_db"

# JWT
JWT_SECRET="your_super_secret_key_min_32_chars"
JWT_EXPIRES_IN="15m"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Server
PORT=3000
FRONTEND_URL=http://localhost:3001

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/integrations/github/callback

# Jira OAuth (optional)
JIRA_CLIENT_ID=your_jira_client_id
JIRA_CLIENT_SECRET=your_jira_client_secret
JIRA_CALLBACK_URL=http://localhost:3000/api/integrations/jira/callback
```

---

## 🧪 Testing

### Backend

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Frontend

```bash
cd frontend

# Run tests (if configured)
npm run test
```

---

## 🚢 Deployment

### Docker

```bash
# Build images
docker-compose build

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Production Build

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run start
```

### Production Environment Variables

Update OAuth callback URLs:

```env
GITHUB_CALLBACK_URL=https://yourdomain.com/api/integrations/github/callback
JIRA_CALLBACK_URL=https://yourdomain.com/api/integrations/jira/callback
FRONTEND_URL=https://yourdomain.com
```

---

## 🎨 Features

### 🌍 Multi-language
- Tax rules support for NL, UK, FR, DE
- UI localization (in development)

### 🔒 Security
- JWT authentication
- Bcrypt password hashing
- Helmet for header protection
- Rate limiting
- CORS configuration

### ⚡ Performance
- Redis caching
- BullMQ for background jobs
- Optimized SQL queries
- Component lazy loading

### 📱 Responsive
- Responsive design
- Mobile-first approach
- PWA ready (in development)

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under UNLICENSED - see LICENSE file for details.

---

## 👨‍💻 Authors

- **Your Name** - *Initial work*

---

## 🙏 Acknowledgments

- NestJS for the excellent framework
- Next.js for the modern React framework
- Prisma for convenient database work
- shadcn/ui for beautiful components

---

## 📞 Support

If you have questions:

- 📧 Email: support@grantai.com
- 💬 Issues: [GitHub Issues](https://github.com/yourusername/grantai/issues)
- 📖 Documentation: [Docs](./docs/)

---

<div align="center">

**Made with ❤️ to simplify R&D tax credit applications**

⭐ Star us if you like the project!

</div>
