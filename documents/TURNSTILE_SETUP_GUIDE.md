# Cloudflare Turnstile Setup Guide

## Зачем нужна защита от ботов?

Эндпоинт регистрации `/api/auth/register` сейчас открыт для всех. Без капчи:
- Конкуренты могут создать тысячи фейковых аккаунтов
- Спамеры засорят базу данных
- Возможны DDoS-атаки через массовую регистрацию
- Увеличатся расходы на инфраструктуру

**Cloudflare Turnstile** — это бесплатная альтернатива Google reCAPTCHA, которая:
- Не требует решения головоломок от пользователей
- Работает быстрее и незаметнее
- Полностью бесплатна (до 1 млн запросов/месяц)
- Уже интегрирована в код приложения

---

## Шаг 1: Регистрация в Cloudflare Turnstile

### 1.1 Создайте аккаунт Cloudflare (если нет)
1. Перейдите на [cloudflare.com](https://www.cloudflare.com/)
2. Нажмите **Sign Up** и создайте бесплатный аккаунт
3. Подтвердите email

### 1.2 Создайте Turnstile Site
1. Войдите в [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. В левом меню выберите **Turnstile**
3. Нажмите **Add Site**
4. Заполните форму:
   - **Site name**: `GrantAI Production` (или любое имя)
   - **Domain**: Ваш продакшен домен (например, `grantai.app`)
   - **Widget Mode**: Выберите **Managed** (рекомендуется)
5. Нажмите **Create**

### 1.3 Получите ключи
После создания сайта вы увидите:
- **Site Key** (публичный ключ) — начинается с `0x4AAAAAAD...`
- **Secret Key** (секретный ключ) — начинается с `0x4AAAAAAD...`

**⚠️ ВАЖНО**: Секретный ключ никогда не должен попадать в клиентский код!

---

## Шаг 2: Настройка переменных окружения

### 2.1 Локальная разработка (`.env.local`)

Для локальной разработки используются **тестовые ключи Cloudflare**, которые всегда проходят проверку:

```bash
# Тестовые ключи (всегда проходят валидацию)
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
TURNSTILE_SECRET_KEY="1x0000000000000000000000000000000AA"
```

Эти ключи уже прописаны в вашем `.env.local` файле.

### 2.2 Продакшен (Vercel)

Для продакшена используйте **реальные ключи** из Cloudflare Dashboard:

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект **GrantAI**
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте следующие переменные:

#### Публичный ключ (доступен в браузере):
```
Name: NEXT_PUBLIC_TURNSTILE_SITE_KEY
Value: 0x4AAAAAADRJG0feCQv43WrF
Environment: Production
```

#### Секретный ключ (только на сервере):
```
Name: TURNSTILE_SECRET_KEY
Value: 0x4AAAAAADRJG8Nun7-S7sLyEqJBmJ5ms1Y
Environment: Production
```

5. Нажмите **Save**
6. **Redeploy** приложение для применения изменений

---

## Шаг 3: Проверка интеграции

### 3.1 Код уже готов!

Turnstile уже интегрирован в следующие места:

#### Frontend (страница регистрации):
- `frontend/src/app/register/page.tsx` — отображает виджет капчи
- `frontend/src/components/turnstile.tsx` — React компонент для Turnstile

#### Backend (валидация):
- `frontend/src/app/actions/authActions.ts` — проверяет токен на сервере
- `frontend/src/lib/turnstile-server.ts` — утилита для серверной валидации

### 3.2 Как это работает?

1. **Пользователь открывает страницу регистрации** (`/register`)
2. **Turnstile виджет загружается** автоматически (если `NEXT_PUBLIC_TURNSTILE_SITE_KEY` установлен)
3. **Cloudflare анализирует поведение** пользователя в фоновом режиме
4. **При отправке формы** токен отправляется на сервер
5. **Сервер проверяет токен** через Cloudflare API (`verifyTurnstileToken`)
6. **Если токен валиден** — регистрация продолжается
7. **Если токен невалиден** — возвращается ошибка "CAPTCHA verification failed"

### 3.3 Тестирование

#### Локально (с тестовыми ключами):
```bash
cd frontend
npm run dev
```
Откройте `http://localhost:3000/register` — капча будет всегда проходить.

#### На продакшене (с реальными ключами):
1. Задеплойте на Vercel с реальными ключами
2. Откройте `https://yourdomain.com/register`
3. Попробуйте зарегистрироваться — Turnstile должен появиться
4. Проверьте, что регистрация работает только после прохождения капчи

---

## Шаг 4: Мониторинг и аналитика

### 4.1 Cloudflare Dashboard
1. Перейдите в [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Выберите **Turnstile** → ваш сайт
3. Вы увидите статистику:
   - Количество запросов
   - Процент успешных проверок
   - Заблокированные боты

### 4.2 Логи в приложении
Проверьте логи Vercel для отладки:
```bash
vercel logs
```

Ищите сообщения:
- `[Turnstile] Verification failed` — токен не прошел проверку
- `[Turnstile] TURNSTILE_SECRET_KEY not set` — ключ не установлен

---

## Шаг 5: Дополнительные настройки (опционально)

### 5.1 Настройка внешнего вида
В `frontend/src/components/turnstile.tsx` можно изменить:

```typescript
window.turnstile.render(containerRef.current, {
  sitekey: siteKey,
  theme: "dark",        // "light" | "dark" | "auto"
  size: "normal",       // "normal" | "compact"
  // ... другие опции
});
```

### 5.2 Добавление Turnstile на другие формы
Если нужно защитить другие эндпоинты (например, forgot password):

1. Импортируйте компонент:
```tsx
import { Turnstile } from "@/components/turnstile";
```

2. Добавьте в форму:
```tsx
<Turnstile
  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
  onVerify={(token) => setCaptchaToken(token)}
  onExpire={() => setCaptchaToken(null)}
/>
```

3. Добавьте валидацию на сервере:
```typescript
import { verifyTurnstileToken } from '@/lib/turnstile-server';

const captchaOk = await verifyTurnstileToken(captchaToken);
if (!captchaOk) return { error: 'CAPTCHA verification failed' };
```

---

## Troubleshooting

### Проблема: "CAPTCHA verification failed"
**Решение**:
- Проверьте, что `TURNSTILE_SECRET_KEY` установлен в Vercel
- Убедитесь, что домен в Cloudflare совпадает с продакшен доменом
- Проверьте логи Vercel: `vercel logs`

### Проблема: Виджет не отображается
**Решение**:
- Проверьте, что `NEXT_PUBLIC_TURNSTILE_SITE_KEY` установлен
- Откройте DevTools → Console и проверьте ошибки
- Убедитесь, что скрипт Cloudflare загружается: `https://challenges.cloudflare.com/turnstile/v0/api.js`

### Проблема: "Invalid site key"
**Решение**:
- Проверьте, что используете правильный Site Key из Cloudflare Dashboard
- Убедитесь, что домен в Cloudflare совпадает с вашим доменом

---

## Резюме

✅ **Что уже сделано**:
- Turnstile интегрирован в код
- Тестовые ключи настроены для локальной разработки
- Серверная валидация реализована

⚠️ **Что нужно сделать**:
1. Зарегистрировать домен в Cloudflare Turnstile
2. Получить реальные ключи (Site Key и Secret Key)
3. Добавить ключи в Vercel Environment Variables:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAADRJG0feCQv43WrF`
   - `TURNSTILE_SECRET_KEY=0x4AAAAAADRJG8Nun7-S7sLyEqJBmJ5ms1Y`
4. Redeploy приложение на Vercel

🎯 **Результат**:
- Защита от ботов и спама
- Улучшенная безопасность регистрации
- Бесплатно до 1 млн запросов/месяц
- Незаметно для пользователей

---

## Полезные ссылки

- [Cloudflare Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
- [Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
