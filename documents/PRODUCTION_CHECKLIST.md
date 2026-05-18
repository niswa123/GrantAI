# Production Deployment Checklist

## 🚀 Чеклист перед деплоем в продакшен

### 1. Cloudflare Turnstile (Защита от ботов)

- [ ] Зарегистрирован домен в [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
- [ ] Получены реальные ключи (Site Key и Secret Key)
- [ ] Ключи добавлены в Vercel Environment Variables:
  - [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Production)
  - [ ] `TURNSTILE_SECRET_KEY` (Production)
- [ ] Проверена работа капчи на `/register`
- [ ] Проверены логи: `vercel logs` (нет ошибок Turnstile)

**Документация**: [TURNSTILE_QUICKSTART.md](./TURNSTILE_QUICKSTART.md)

---

### 2. Database (Supabase)

- [ ] База данных создана в Supabase
- [ ] Миграции применены: `npx prisma migrate deploy`
- [ ] Connection pooling настроен (pgBouncer)
- [ ] Переменные окружения установлены:
  - [ ] `DATABASE_URL` (с pgbouncer=true)
  - [ ] `DIRECT_URL` (без pgbouncer)
- [ ] Проверено подключение: `npx prisma db pull`

---

### 3. Authentication (NextAuth)

- [ ] `NEXTAUTH_SECRET` сгенерирован: `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` установлен на продакшен домен
- [ ] OAuth провайдеры настроены:
  - [ ] Google OAuth (Client ID + Secret)
  - [ ] GitHub OAuth (Client ID + Secret)
- [ ] **Callback URLs обновлены на продакшен домен**:
  - [ ] Google: `https://grantai.com/api/auth/callback/google`
  - [ ] GitHub: `https://grantai.com/api/auth/callback/github`
- [ ] Localhost URLs оставлены для разработки

**Документация**: [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md) | [PRODUCTION_OAUTH_SETUP.md](./PRODUCTION_OAUTH_SETUP.md)

---

### 4. Integrations (GitHub, Jira, Linear)

- [ ] **GitHub Integration OAuth App создан**
  - [ ] `GITHUB_INTEGRATION_CLIENT_ID`
  - [ ] `GITHUB_INTEGRATION_CLIENT_SECRET`
  - [ ] Callback URL: `https://grantai.com/api/integrations/github/callback`
  - [ ] Localhost URL оставлен: `http://localhost:3000/api/integrations/github/callback`
- [ ] **Jira Integration настроен**
  - [ ] `JIRA_CLIENT_ID`
  - [ ] `JIRA_CLIENT_SECRET`
  - [ ] Callback URL: `https://grantai.com/api/integrations/jira/callback`
  - [ ] Localhost URL оставлен: `http://localhost:3000/api/integrations/jira/callback`
- [ ] **Linear Integration настроен**
  - [ ] `LINEAR_CLIENT_ID`
  - [ ] `LINEAR_CLIENT_SECRET`
  - [ ] Callback URL: `https://grantai.com/api/integrations/linear/callback`
  - [ ] Localhost URL оставлен: `http://localhost:3000/api/integrations/linear/callback`
- [ ] `ENCRYPTION_KEY` сгенерирован: `openssl rand -hex 32`

**Документация**: [PRODUCTION_OAUTH_SETUP.md](./PRODUCTION_OAUTH_SETUP.md)

---

### 5. Payments (Stripe + NOWPayments)

#### Stripe (Fiat)
- [ ] Stripe аккаунт создан
- [ ] Продукты созданы в [Stripe Dashboard](https://dashboard.stripe.com/products)
- [ ] Ключи установлены:
  - [ ] `STRIPE_SECRET_KEY` (live key: `sk_live_...`)
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live key: `pk_live_...`)
  - [ ] `STRIPE_WEBHOOK_SECRET` (webhook endpoint secret)
  - [ ] `STRIPE_PRO_PRICE_ID`
  - [ ] `STRIPE_ENTERPRISE_PRICE_ID`
- [ ] Webhook endpoint настроен:
  - URL: `https://yourdomain.com/api/stripe/webhook`
  - Events: `checkout.session.completed`, `invoice.payment_succeeded`

#### NOWPayments (Crypto)
- [ ] NOWPayments аккаунт создан
- [ ] Ключи установлены:
  - [ ] `NOWPAYMENTS_API_KEY`
  - [ ] `NOWPAYMENTS_IPN_SECRET`
- [ ] IPN callback настроен: `https://yourdomain.com/api/nowpayments/webhook`

---

### 6. Email (Resend)

- [ ] Resend аккаунт создан
- [ ] Домен верифицирован в Resend
- [ ] Ключи установлены:
  - [ ] `RESEND_API_KEY`
  - [ ] `RESEND_FROM_EMAIL` (например, `GrantAI <noreply@yourdomain.com>`)
- [ ] Проверена отправка email:
  - [ ] Email verification
  - [ ] Password reset
  - [ ] Team invitations

---

### 7. Analytics & Monitoring

- [ ] Vercel Analytics включен
- [ ] PostHog настроен (если используется)
- [ ] FeatureBase настроен:
  - [ ] `NEXT_PUBLIC_FEATUREBASE_ORG`
- [ ] Loops (email marketing) настроен:
  - [ ] `LOOPS_API_KEY`
- [ ] Error tracking настроен (Sentry/Bugsnag)

---

### 8. Security

- [ ] HTTPS включен (автоматически в Vercel)
- [ ] CORS настроен правильно
- [ ] Rate limiting включен для критичных эндпоинтов
- [ ] Secrets не коммитятся в Git
- [ ] `.env.local` добавлен в `.gitignore`
- [ ] Environment variables установлены только в Vercel
- [ ] Bcrypt work factor = 12 (проверено в `authActions.ts`)
- [ ] Password max length = 72 (защита от DoS)

---

### 9. Performance

- [ ] Next.js build успешен: `npm run build`
- [ ] Нет ошибок TypeScript: `npm run lint`
- [ ] Prisma schema синхронизирован: `npx prisma generate`
- [ ] Images оптимизированы
- [ ] Fonts загружаются локально (не из Google Fonts)
- [ ] Bundle size проверен: `npm run build` → анализ размера

---

### 10. Testing

- [ ] Регистрация работает (email + OAuth)
- [ ] Login работает (email + OAuth)
- [ ] Password reset работает
- [ ] Email verification работает
- [ ] Payments работают (Stripe + NOWPayments)
- [ ] Integrations работают (GitHub, Jira, Linear)
- [ ] Dashboard доступен после логина
- [ ] Mobile responsive проверен

---

### 11. DNS & Domain

- [ ] Домен куплен
- [ ] DNS записи настроены:
  - [ ] A record → Vercel IP
  - [ ] CNAME → Vercel domain
- [ ] SSL сертификат выпущен (автоматически в Vercel)
- [ ] Домен добавлен в Vercel проекте
- [ ] Домен верифицирован

---

### 12. Legal & Compliance

- [ ] Terms of Service опубликованы
- [ ] Privacy Policy опубликована
- [ ] Cookie Policy опубликована (если используются cookies)
- [ ] GDPR compliance проверен (для EU пользователей)
- [ ] Data retention policy определен

---

### 13. Backup & Recovery

- [ ] Database backups настроены (Supabase автоматически)
- [ ] Environment variables задокументированы
- [ ] Recovery plan создан
- [ ] Rollback strategy определена

---

### 14. Documentation

- [ ] README.md обновлен
- [ ] API documentation создана (если есть public API)
- [ ] Environment variables задокументированы (`.env.example`)
- [ ] Deployment guide создан
- [ ] Troubleshooting guide создан

---

## 🔍 Финальная проверка

### Запустите все проверки:

```bash
cd frontend

# 1. Проверка TypeScript
npm run lint

# 2. Проверка Prisma
npx prisma validate

# 3. Проверка Turnstile
npm run check:turnstile

# 4. Build проекта
npm run build

# 5. Проверка environment variables
node -e "console.log(Object.keys(process.env).filter(k => k.includes('NEXT_PUBLIC')))"
```

### Проверьте Vercel Dashboard:

1. **Environment Variables** → Все ключи установлены
2. **Domains** → Домен добавлен и верифицирован
3. **Deployments** → Последний деплой успешен
4. **Logs** → Нет критичных ошибок

### Проверьте приложение:

1. Откройте `https://yourdomain.com`
2. Попробуйте зарегистрироваться
3. Проверьте email verification
4. Попробуйте войти
5. Проверьте dashboard
6. Попробуйте payment flow
7. Проверьте integrations

---

## ✅ Готово к деплою!

Если все пункты отмечены, ваше приложение готово к продакшену.

### Деплой:

```bash
# Через Vercel CLI
vercel --prod

# Или через Git
git push origin main
# (автоматический деплой через Vercel GitHub integration)
```

### После деплоя:

1. Проверьте логи: `vercel logs --follow`
2. Мониторьте ошибки в течение первых 24 часов
3. Проверьте Cloudflare Turnstile Dashboard на статистику
4. Проверьте Stripe Dashboard на транзакции
5. Проверьте Resend Dashboard на отправленные emails

---

## 🚨 Rollback Plan

Если что-то пошло не так:

```bash
# 1. Откатитесь на предыдущий деплой
vercel rollback

# 2. Или через Dashboard
# Deployments → Previous deployment → Promote to Production

# 3. Проверьте логи
vercel logs

# 4. Исправьте проблему
# 5. Задеплойте снова
```

---

## 📞 Support

Если нужна помощь:
- Vercel Support: https://vercel.com/support
- Cloudflare Support: https://dash.cloudflare.com/support
- Stripe Support: https://support.stripe.com/
- Supabase Support: https://supabase.com/support

---

**Последнее обновление**: 2026-05-19
