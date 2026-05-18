# Cloudflare Turnstile - Архитектура и Flow

## 🔄 Как работает Turnstile?

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Registration Flow                       │
└─────────────────────────────────────────────────────────────────────┘

1. User opens /register
   │
   ├─→ Frontend loads Turnstile widget
   │   └─→ <Turnstile siteKey={NEXT_PUBLIC_TURNSTILE_SITE_KEY} />
   │
2. Cloudflare analyzes user behavior (invisible)
   │   ├─→ Mouse movements
   │   ├─→ Keyboard patterns
   │   ├─→ Browser fingerprint
   │   └─→ Network characteristics
   │
3. User fills form and clicks "Create Account"
   │
   ├─→ Frontend checks if captcha token exists
   │   └─→ If no token → show error "Complete CAPTCHA"
   │
4. Form submits with captcha token
   │   └─→ FormData includes 'cf-turnstile-response'
   │
5. Backend receives request
   │   └─→ authActions.ts → registerUser()
   │
6. Server validates token with Cloudflare
   │   └─→ POST https://challenges.cloudflare.com/turnstile/v0/siteverify
   │       ├─→ secret: TURNSTILE_SECRET_KEY
   │       └─→ response: captcha_token
   │
7. Cloudflare responds
   │   ├─→ { success: true } → Continue registration
   │   └─→ { success: false } → Return error
   │
8. If valid → Create user in database
   │
9. Send verification email
   │
10. Redirect to /check-email

```

---

## 🏗️ Архитектура компонентов

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (Client)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  /register/page.tsx                                                  │
│  ├─→ Imports <Turnstile /> component                                │
│  ├─→ Manages captchaToken state                                     │
│  ├─→ Disables submit if no token                                    │
│  └─→ Sends token in FormData                                        │
│                                                                       │
│  /components/turnstile.tsx                                           │
│  ├─→ Loads Cloudflare script dynamically                            │
│  ├─→ Renders widget with siteKey                                    │
│  ├─→ Calls onVerify(token) when solved                              │
│  └─→ Handles expiration & errors                                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
                    FormData with token
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         Backend (Server)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  /actions/authActions.ts                                             │
│  ├─→ Extracts 'cf-turnstile-response' from FormData                 │
│  ├─→ Calls verifyTurnstileToken(token)                              │
│  ├─→ If invalid → return error                                      │
│  └─→ If valid → continue registration                               │
│                                                                       │
│  /lib/turnstile-server.ts                                            │
│  ├─→ verifyTurnstileToken(token)                                    │
│  ├─→ POST to Cloudflare API                                         │
│  ├─→ Validates response                                             │
│  └─→ Returns boolean                                                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
                    HTTP POST to Cloudflare
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    Cloudflare Turnstile API                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  POST /turnstile/v0/siteverify                                       │
│  ├─→ Validates secret key                                           │
│  ├─→ Validates token                                                │
│  ├─→ Checks token hasn't been used                                  │
│  ├─→ Checks token hasn't expired                                    │
│  └─→ Returns { success: true/false }                                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Безопасность

### ✅ Что защищено?

1. **Массовая регистрация ботов**
   - Cloudflare анализирует поведение
   - Блокирует автоматизированные скрипты

2. **Обход капчи**
   - Токен валидируется на сервере
   - Невозможно подделать токен
   - Токен одноразовый (нельзя переиспользовать)

3. **DDoS атаки**
   - Rate limiting на уровне Cloudflare
   - Защита от перегрузки сервера

### ⚠️ Что НЕ защищено?

1. **Email enumeration**
   - Нужен дополнительный rate limiting
   - Реализован в `forgotPassword()`

2. **Brute force на существующих аккаунтах**
   - Нужен rate limiting на `/api/auth/signin`
   - Рекомендуется добавить

3. **Социальная инженерия**
   - Turnstile не защищает от фишинга
   - Нужно обучение пользователей

---

## 🎨 Кастомизация виджета

### Темы

```typescript
// Dark theme (по умолчанию)
theme: "dark"

// Light theme
theme: "light"

// Auto (следует за системной темой)
theme: "auto"
```

### Размеры

```typescript
// Normal (300x65px)
size: "normal"

// Compact (150x140px)
size: "compact"

// Flexible (адаптивный)
size: "flexible"
```

### Языки

```typescript
// Auto-detect (по умолчанию)
language: "auto"

// Specific language
language: "ru"  // Русский
language: "en"  // English
```

### Пример кастомизации

```typescript
// src/components/turnstile.tsx
window.turnstile.render(containerRef.current, {
  sitekey: siteKey,
  theme: "dark",
  size: "normal",
  language: "auto",
  appearance: "always",  // "always" | "execute" | "interaction-only"
  callback: stableOnVerify,
  "error-callback": stableOnError,
  "expired-callback": stableOnExpire,
});
```

---

## 📊 Метрики и мониторинг

### Cloudflare Dashboard

Доступно в [dash.cloudflare.com/turnstile](https://dash.cloudflare.com/?to=/:account/turnstile):

- **Total Requests**: Общее количество запросов
- **Passed**: Успешно прошедшие проверку
- **Failed**: Заблокированные боты
- **Challenge Rate**: Процент показанных челленджей
- **Solve Rate**: Процент решенных челленджей

### Application Logs

```typescript
// В authActions.ts
console.log('[Turnstile] Verification result:', {
  success: captchaOk,
  email: email,
  timestamp: new Date().toISOString(),
});
```

### Vercel Analytics

Добавьте трекинг событий:

```typescript
// В register/page.tsx
import { track } from '@vercel/analytics';

// После успешной регистрации
track('registration_success', {
  method: 'email',
  captcha: 'turnstile',
});

// При ошибке капчи
track('captcha_failed', {
  reason: 'invalid_token',
});
```

---

## 🧪 Тестирование

### Локальная разработка

```bash
# Используйте тестовые ключи
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"

# Запустите dev сервер
npm run dev

# Откройте /register
# Капча всегда будет проходить
```

### Staging/Production

```bash
# Используйте реальные ключи
NEXT_PUBLIC_TURNSTILE_SITE_KEY="0x4AAAAAADRJG0feCQv43WrF"
TURNSTILE_SECRET_KEY="0x4AAAAAADRJG8Nun7-S7sLyEqJBmJ5ms1Y"

# Тестируйте разные сценарии:
# 1. Нормальная регистрация
# 2. Попытка обхода (без токена)
# 3. Попытка с истекшим токеном
# 4. Попытка с переиспользованным токеном
```

### Автоматизированное тестирование

⚠️ **Важно**: Turnstile нельзя обойти в E2E тестах!

Решения:
1. Используйте тестовые ключи в CI/CD
2. Мокайте `verifyTurnstileToken()` в тестах
3. Используйте feature flags для отключения в тестах

```typescript
// В authActions.ts
const SKIP_CAPTCHA = process.env.NODE_ENV === 'test';

if (!SKIP_CAPTCHA && process.env.TURNSTILE_SECRET_KEY) {
  const captchaOk = await verifyTurnstileToken(captchaToken || '');
  if (!captchaOk) return { error: 'CAPTCHA verification failed' };
}
```

---

## 🔄 Миграция с других капч

### С Google reCAPTCHA

```diff
- <ReCAPTCHA
-   sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
-   onChange={(token) => setCaptchaToken(token)}
- />
+ <Turnstile
+   siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
+   onVerify={(token) => setCaptchaToken(token)}
+ />
```

### С hCaptcha

```diff
- <HCaptcha
-   sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY}
-   onVerify={(token) => setCaptchaToken(token)}
- />
+ <Turnstile
+   siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
+   onVerify={(token) => setCaptchaToken(token)}
+ />
```

---

## 📚 Дополнительные ресурсы

- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
- [API Reference](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Widget Configuration](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
