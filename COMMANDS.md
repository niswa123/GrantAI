# Quick Commands Reference

Быстрый справочник всех команд для работы с проектом.

---

## 🚀 Development

### Start Development Server
```bash
cd frontend
npm run dev
```
Откроется на `http://localhost:3000`

### Build for Production
```bash
cd frontend
npm run build
```

### Start Production Server (locally)
```bash
cd frontend
npm run build
npm start
```

---

## 🔍 Verification & Testing

### Check Turnstile Configuration
```bash
cd frontend
npm run check:turnstile
```

### Check TypeScript Errors
```bash
cd frontend
npm run lint
```

### Validate Prisma Schema
```bash
cd frontend
npx prisma validate
```

### Test Database Connection
```bash
cd frontend
npx prisma db pull
```

### Run All Checks
```bash
cd frontend
npm run lint && npx prisma validate && npm run check:turnstile && npm run build
```

---

## 🗄️ Database

### Open Prisma Studio
```bash
cd frontend
npx prisma studio
```
Откроется на `http://localhost:5555`

### Generate Prisma Client
```bash
cd frontend
npx prisma generate
```

### Run Migrations (Development)
```bash
cd frontend
npx prisma migrate dev
```

### Run Migrations (Production)
```bash
cd frontend
npx prisma migrate deploy
```

### Reset Database (⚠️ DANGER - deletes all data)
```bash
cd frontend
npx prisma migrate reset
```

### Create New Migration
```bash
cd frontend
npx prisma migrate dev --name your_migration_name
```

### View Database Schema
```bash
cd frontend
npx prisma db pull
```

---

## 🚀 Deployment (Vercel)

### Deploy to Production
```bash
vercel --prod
```

### Deploy to Preview
```bash
vercel
```

### View Logs (Live)
```bash
vercel logs --follow
```

### View Logs (Last 100 lines)
```bash
vercel logs
```

### List Deployments
```bash
vercel ls
```

### Rollback to Previous Deployment
```bash
vercel rollback
```

### Check Deployment Status
```bash
vercel inspect
```

---

## 🔐 Security

### Generate NextAuth Secret
```bash
openssl rand -base64 32
```

### Generate Encryption Key
```bash
openssl rand -hex 32
```

### Check for Vulnerabilities
```bash
cd frontend
npm audit
```

### Fix Vulnerabilities
```bash
cd frontend
npm audit fix
```

### Check Outdated Packages
```bash
cd frontend
npm outdated
```

### Update All Packages
```bash
cd frontend
npm update
```

---

## 📦 Dependencies

### Install Dependencies
```bash
cd frontend
npm install
```

### Install Specific Package
```bash
cd frontend
npm install package-name
```

### Install Dev Dependency
```bash
cd frontend
npm install -D package-name
```

### Remove Package
```bash
cd frontend
npm uninstall package-name
```

### Clean Install (removes node_modules)
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 🧹 Cleanup

### Clean Build Files
```bash
cd frontend
rm -rf .next
```

### Clean Node Modules
```bash
cd frontend
rm -rf node_modules
```

### Clean Everything (⚠️ requires reinstall)
```bash
cd frontend
rm -rf .next node_modules package-lock.json
npm install
```

---

## 🔧 Environment Variables

### Check Environment Variables (local)
```bash
cd frontend
cat .env.local
```

### Check Public Environment Variables
```bash
cd frontend
node -e "console.log(Object.keys(process.env).filter(k => k.includes('NEXT_PUBLIC')))"
```

### Copy Example Environment File
```bash
cd frontend
cp .env.example .env.local
```

---

## 📊 Monitoring

### Vercel Logs (Production)
```bash
vercel logs --prod --follow
```

### Vercel Logs (Preview)
```bash
vercel logs --follow
```

### Check Deployment URL
```bash
vercel ls
```

### Open Vercel Dashboard
```bash
vercel dashboard
```

---

## 🧪 Testing

### Run Linter
```bash
cd frontend
npm run lint
```

### Fix Linting Issues
```bash
cd frontend
npm run lint -- --fix
```

### Type Check
```bash
cd frontend
npx tsc --noEmit
```

---

## 📝 Git Commands

### Check Status
```bash
git status
```

### Add All Changes
```bash
git add .
```

### Commit Changes
```bash
git commit -m "your commit message"
```

### Push to Remote
```bash
git push origin main
```

### Pull Latest Changes
```bash
git pull origin main
```

### Create New Branch
```bash
git checkout -b feature/your-feature-name
```

### Switch Branch
```bash
git checkout branch-name
```

### View Commit History
```bash
git log --oneline
```

---

## 🔍 Debugging

### Check Node Version
```bash
node --version
```

### Check npm Version
```bash
npm --version
```

### Check Next.js Version
```bash
cd frontend
npx next --version
```

### Check Prisma Version
```bash
cd frontend
npx prisma --version
```

### Clear Next.js Cache
```bash
cd frontend
rm -rf .next
npm run dev
```

### Check Port Usage (if 3000 is busy)
```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000
```

---

## 📚 Documentation

### Open Documentation Index
```bash
cat documents/README.md
```

### View Turnstile Quick Start
```bash
cat documents/TURNSTILE_QUICKSTART.md
```

### View Production Checklist
```bash
cat documents/PRODUCTION_CHECKLIST.md
```

### View Security Guide
```bash
cat SECURITY.md
```

---

## 🎯 Common Workflows

### Fresh Start (Development)
```bash
cd frontend
rm -rf .next node_modules package-lock.json
npm install
npx prisma generate
npm run dev
```

### Pre-Deployment Check
```bash
cd frontend
npm run lint
npx prisma validate
npm run check:turnstile
npm run build
```

### Deploy to Production
```bash
cd frontend
npm run build
git add .
git commit -m "feat: ready for production"
git push origin main
vercel --prod
vercel logs --prod --follow
```

### Rollback Production
```bash
vercel rollback
vercel logs --prod --follow
```

### Database Migration (Production)
```bash
cd frontend
npx prisma migrate deploy
vercel logs --prod --follow
```

---

## 🚨 Emergency Commands

### Stop Development Server
```
Ctrl + C
```

### Kill Process on Port 3000 (if stuck)
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Force Vercel Redeploy
```bash
vercel --prod --force
```

### Emergency Rollback
```bash
vercel rollback
```

---

## 📞 Help Commands

### Next.js Help
```bash
npx next --help
```

### Prisma Help
```bash
npx prisma --help
```

### Vercel Help
```bash
vercel --help
```

### npm Help
```bash
npm help
```

---

## 🔗 Quick Links

### Open in Browser
```bash
# Local development
open http://localhost:3000

# Prisma Studio
open http://localhost:5555

# Vercel Dashboard
open https://vercel.com/dashboard

# Cloudflare Turnstile
open https://dash.cloudflare.com/turnstile
```

---

## 💡 Pro Tips

### Create Aliases (add to ~/.bashrc or ~/.zshrc)
```bash
# Development
alias dev="cd frontend && npm run dev"
alias build="cd frontend && npm run build"

# Database
alias studio="cd frontend && npx prisma studio"
alias migrate="cd frontend && npx prisma migrate dev"

# Deployment
alias deploy="vercel --prod"
alias logs="vercel logs --prod --follow"

# Checks
alias check="cd frontend && npm run lint && npx prisma validate && npm run check:turnstile"
```

### Use npm Scripts
```bash
# Add to package.json
{
  "scripts": {
    "check:all": "npm run lint && npx prisma validate && npm run check:turnstile && npm run build",
    "db:studio": "npx prisma studio",
    "db:migrate": "npx prisma migrate dev",
    "db:deploy": "npx prisma migrate deploy"
  }
}
```

---

## 📋 Cheat Sheet

### Most Used Commands
```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production

# Database
npx prisma studio              # Open database GUI
npx prisma migrate dev         # Run migrations

# Deployment
vercel --prod                  # Deploy to production
vercel logs --follow           # Watch logs

# Checks
npm run check:turnstile        # Check Turnstile config
npm run lint                   # Check TypeScript
```

### Emergency Commands
```bash
vercel rollback                # Rollback deployment
rm -rf .next && npm run dev    # Clear cache and restart
npx prisma migrate reset       # Reset database (⚠️ DANGER)
```

---

**Last Updated**: 2026-05-19  
**Quick Access**: Bookmark this file for instant command reference!
