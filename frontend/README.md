# GrantAI Frontend

AI-powered R&D tax credit automation platform built with Next.js 16, TypeScript, and Prisma.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database (Supabase recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

4. Run database migrations:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 🔐 Security Features

### Cloudflare Turnstile (Bot Protection)

The registration endpoint is protected by Cloudflare Turnstile to prevent:
- Mass bot registrations
- Spam accounts
- DDoS attacks

**Status**: ✅ Integrated (using test keys for development)

**For Production**: Replace test keys with real keys from [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)

```bash
# Development (test keys - always pass)
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"

# Production (real keys - actual validation)
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAADRJG0feCQv43WrF"
TURNSTILE_SECRET_KEY="0x4AAAAAADRJG8Nun7-S7sLyEqJBmJ5ms1Y"
```

**Quick Setup**: See [TURNSTILE_QUICKSTART.md](../documents/TURNSTILE_QUICKSTART.md)

**Check Configuration**:
```bash
npm run check:turnstile
```

---

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe (fiat) + NOWPayments (crypto)
- **Email**: Resend
- **UI**: Tailwind CSS + Radix UI + Framer Motion
- **Security**: Cloudflare Turnstile, bcrypt, rate limiting

---

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build            # Build for production
npm start                # Start production server

# Database
npx prisma migrate dev   # Run migrations (dev)
npx prisma migrate deploy # Run migrations (prod)
npx prisma studio        # Open Prisma Studio

# Linting
npm run lint             # Run ESLint

# Security
npm run check:turnstile  # Check Turnstile configuration
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── actions/           # Server Actions
│   │   ├── api/               # API Routes
│   │   ├── register/          # Registration page
│   │   ├── login/             # Login page
│   │   └── dashboard/         # Dashboard pages
│   ├── components/            # React components
│   │   ├── ui/               # UI components
│   │   └── turnstile.tsx     # Cloudflare Turnstile
│   └── lib/                   # Utilities
│       ├── prisma.ts         # Prisma client
│       └── turnstile-server.ts # Turnstile validation
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── public/                    # Static assets
└── scripts/                   # Utility scripts
    └── check-turnstile.ts    # Turnstile checker
```

---

## 🔑 Environment Variables

See [.env.example](./.env.example) for all required environment variables.

### Required for Development:

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

### Required for Production:

All variables in `.env.example` must be set in Vercel Environment Variables.

**Important**: Never commit `.env.local` to Git!

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/dashboard)
3. Set environment variables (see [VERCEL_ENV_SETUP.md](../documents/VERCEL_ENV_SETUP.md))
4. Deploy!

### Pre-Deployment Checklist

See [PRODUCTION_CHECKLIST.md](../documents/PRODUCTION_CHECKLIST.md) for complete checklist.

**Critical**:
- [ ] Replace Turnstile test keys with production keys
- [ ] Set all OAuth callback URLs to production domain
- [ ] Configure Stripe webhook endpoint
- [ ] Verify email domain in Resend
- [ ] Run database migrations: `npx prisma migrate deploy`

---

## 📚 Documentation

- [Turnstile Quick Start](../documents/TURNSTILE_QUICKSTART.md) - Bot protection setup
- [Turnstile Setup Guide](../documents/TURNSTILE_SETUP_GUIDE.md) - Detailed Turnstile docs
- [Turnstile Flow](../documents/TURNSTILE_FLOW.md) - Architecture & flow diagrams
- [OAuth Setup Guide](../documents/OAUTH_SETUP_GUIDE.md) - OAuth configuration
- [Vercel Setup Guide](../documents/VERCEL_ENV_SETUP.md) - Vercel deployment
- [Production Checklist](../documents/PRODUCTION_CHECKLIST.md) - Pre-deployment checklist

---

## 🧪 Testing

### Manual Testing

```bash
# Start dev server
npm run dev

# Test registration
# 1. Open http://localhost:3000/register
# 2. Fill form and submit
# 3. Turnstile should appear (test mode - always passes)
# 4. Check email for verification link
```

### Check Configuration

```bash
# Verify Turnstile setup
npm run check:turnstile

# Verify database connection
npx prisma db pull

# Verify TypeScript
npm run lint
```

---

## 🐛 Troubleshooting

### Turnstile not working?

```bash
# Check configuration
npm run check:turnstile

# Check environment variables
echo $NEXT_PUBLIC_TURNSTILE_SITE_KEY
echo $TURNSTILE_SECRET_KEY

# Check browser console for errors
# Open DevTools → Console
```

### Database connection issues?

```bash
# Test connection
npx prisma db pull

# Check DATABASE_URL format
# Should be: postgresql://user:pass@host:port/db?pgbouncer=true
```

### OAuth not working?

- Check callback URLs match in OAuth provider settings
- Verify `NEXTAUTH_URL` matches your domain
- Check `NEXTAUTH_SECRET` is set

See [OAUTH_SETUP_GUIDE.md](../documents/OAUTH_SETUP_GUIDE.md) for details.

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run lint`
4. Submit a pull request

---

## 📄 License

Proprietary - All rights reserved

---

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
- [Vercel Platform](https://vercel.com)
