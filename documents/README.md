# GrantAI Documentation

Полная документация по настройке и деплою GrantAI платформы.

---

## 🚀 Quick Start

Новый в проекте? Начните здесь:

1. **[Frontend README](../frontend/README.md)** - Установка и запуск приложения
2. **[Production Checklist](./PRODUCTION_CHECKLIST.md)** - Чеклист перед деплоем
3. **[Turnstile Quick Start](./TURNSTILE_QUICKSTART.md)** - Защита от ботов (5 минут)

---

## 📚 Документация по категориям

### 🔐 Security & Bot Protection

#### Cloudflare Turnstile (Защита от ботов)
- **[Quick Start](./TURNSTILE_QUICKSTART.md)** ⚡ - Быстрая настройка (5 минут)
- **[Setup Guide](./TURNSTILE_SETUP_GUIDE.md)** 📖 - Полная инструкция
- **[Architecture & Flow](./TURNSTILE_FLOW.md)** 🏗️ - Как это работает
- **[Visual Guide](./TURNSTILE_VISUAL_GUIDE.md)** 🎨 - Дизайн и UX
- **[Summary](./TURNSTILE_SUMMARY.md)** 📊 - Итоговая сводка

**Статус**: ✅ Интегрировано (тестовые ключи)  
**Для продакшена**: Нужно получить реальные ключи (5 минут)

---

### 🔑 Authentication & OAuth

#### OAuth Setup
- **[OAuth Setup Guide](./OAUTH_SETUP_GUIDE.md)** - Настройка Google, GitHub, Jira, Linear

**Включает**:
- Google OAuth (login)
- GitHub OAuth (login)
- GitHub Integration (repo access)
- Jira Integration
- Linear Integration

---

### 🚀 Deployment

#### Vercel
- **[Vercel Environment Setup](./VERCEL_ENV_SETUP.md)** - Настройка переменных окружения
- **[Production Checklist](./PRODUCTION_CHECKLIST.md)** - Полный чеклист перед деплоем

**Включает**:
- Environment variables
- Database setup
- OAuth callbacks
- Webhook endpoints
- Domain configuration

---

## 🗂️ Структура документации

```
documents/
├── README.md                          # Этот файл (индекс)
│
├── Security & Bot Protection
│   ├── TURNSTILE_QUICKSTART.md       # ⚡ Быстрый старт (5 мин)
│   ├── TURNSTILE_SETUP_GUIDE.md      # 📖 Полная инструкция
│   ├── TURNSTILE_FLOW.md             # 🏗️ Архитектура
│   ├── TURNSTILE_VISUAL_GUIDE.md     # 🎨 Визуальный гид
│   └── TURNSTILE_SUMMARY.md          # 📊 Итоговая сводка
│
├── Authentication
│   └── OAUTH_SETUP_GUIDE.md          # 🔑 OAuth настройка
│
└── Deployment
    ├── VERCEL_ENV_SETUP.md           # ☁️ Vercel setup
    └── PRODUCTION_CHECKLIST.md       # ✅ Чеклист деплоя
```

---

## 🎯 Быстрые ссылки

### Для разработчиков

- [Frontend README](../frontend/README.md) - Установка и разработка
- [Prisma Schema](../frontend/prisma/schema.prisma) - Database schema
- [API Routes](../frontend/src/app/api/) - Backend endpoints
- [Components](../frontend/src/components/) - React components

### Для DevOps

- [Production Checklist](./PRODUCTION_CHECKLIST.md) - Чеклист деплоя
- [Vercel Setup](./VERCEL_ENV_SETUP.md) - Environment variables
- [OAuth Setup](./OAUTH_SETUP_GUIDE.md) - OAuth configuration

### Для безопасности

- [Turnstile Setup](./TURNSTILE_SETUP_GUIDE.md) - Bot protection
- [Turnstile Flow](./TURNSTILE_FLOW.md) - Security architecture

---

## 🔧 Инструменты и команды

### Проверка конфигурации

```bash
cd frontend

# Проверить Turnstile
npm run check:turnstile

# Проверить TypeScript
npm run lint

# Проверить Prisma
npx prisma validate

# Проверить database connection
npx prisma db pull
```

### Разработка

```bash
# Запустить dev сервер
npm run dev

# Открыть Prisma Studio
npx prisma studio

# Применить миграции
npx prisma migrate dev
```

### Деплой

```bash
# Build для продакшена
npm run build

# Деплой на Vercel
vercel --prod

# Проверить логи
vercel logs --follow
```

---

## 📊 Статус интеграций

| Компонент | Статус | Документация |
|-----------|--------|--------------|
| **Cloudflare Turnstile** | ✅ Интегрировано (dev) | [Quick Start](./TURNSTILE_QUICKSTART.md) |
| **NextAuth** | ✅ Настроено | [OAuth Guide](./OAUTH_SETUP_GUIDE.md) |
| **Prisma + Supabase** | ✅ Настроено | [Frontend README](../frontend/README.md) |
| **Stripe Payments** | ✅ Настроено | [Vercel Setup](./VERCEL_ENV_SETUP.md) |
| **NOWPayments (Crypto)** | ✅ Настроено | [Vercel Setup](./VERCEL_ENV_SETUP.md) |
| **Resend (Email)** | ✅ Настроено | [Vercel Setup](./VERCEL_ENV_SETUP.md) |
| **GitHub Integration** | ✅ Настроено | [OAuth Guide](./OAUTH_SETUP_GUIDE.md) |
| **Jira Integration** | ✅ Настроено | [OAuth Guide](./OAUTH_SETUP_GUIDE.md) |
| **Linear Integration** | ✅ Настроено | [OAuth Guide](./OAUTH_SETUP_GUIDE.md) |

---

## ⚠️ Что нужно для продакшена?

### Критично (без этого не работает)

- [ ] **Database**: Supabase настроен и миграции применены
- [ ] **NextAuth**: `NEXTAUTH_SECRET` и `NEXTAUTH_URL` установлены
- [ ] **Turnstile**: Реальные ключи в Vercel (см. [Quick Start](./TURNSTILE_QUICKSTART.md))
- [ ] **OAuth**: Callback URLs обновлены на продакшен домен

### Важно (для полной функциональности)

- [ ] **Stripe**: Live keys и webhook endpoint
- [ ] **Resend**: Домен верифицирован
- [ ] **Integrations**: OAuth apps настроены для продакшена

### Опционально (можно добавить позже)

- [ ] **NOWPayments**: Crypto payments
- [ ] **Loops**: Email marketing
- [ ] **FeatureBase**: Feedback widget
- [ ] **PostHog**: Analytics

---

## 🚨 Troubleshooting

### Общие проблемы

#### "CAPTCHA verification failed"
→ См. [Turnstile Troubleshooting](./TURNSTILE_SETUP_GUIDE.md#troubleshooting)

#### "OAuth callback error"
→ См. [OAuth Setup Guide](./OAUTH_SETUP_GUIDE.md)

#### "Database connection failed"
→ Проверьте `DATABASE_URL` и `DIRECT_URL`

#### "Build failed"
→ Запустите `npm run lint` и исправьте ошибки

### Где искать помощь?

1. **Документация** - Проверьте соответствующий гид
2. **Vercel Logs** - `vercel logs --follow`
3. **Browser Console** - DevTools → Console
4. **Prisma Studio** - `npx prisma studio`

---

## 📞 Support & Resources

### Внешние сервисы

- [Vercel Support](https://vercel.com/support)
- [Cloudflare Support](https://dash.cloudflare.com/support)
- [Stripe Support](https://support.stripe.com/)
- [Supabase Support](https://supabase.com/support)

### Документация сервисов

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)

---

## 🎉 Готовы к деплою?

Следуйте [Production Checklist](./PRODUCTION_CHECKLIST.md) для полной проверки перед деплоем.

**Основные шаги**:
1. ✅ Проверить все environment variables
2. ✅ Получить реальные Turnstile ключи
3. ✅ Обновить OAuth callback URLs
4. ✅ Настроить Stripe webhook
5. ✅ Верифицировать email домен
6. ✅ Запустить `npm run build`
7. ✅ Деплой: `vercel --prod`

---

## 📝 Changelog

### 2026-05-19
- ✅ Добавлена полная документация по Cloudflare Turnstile
- ✅ Создан Production Checklist
- ✅ Обновлен Frontend README
- ✅ Добавлены визуальные гиды и диаграммы

### Предыдущие версии
- OAuth Setup Guide
- Vercel Environment Setup
- Базовая документация

---

**Последнее обновление**: 2026-05-19  
**Версия документации**: 1.0.0  
**Статус**: ✅ Готово к использованию
