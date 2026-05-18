# Cloudflare Turnstile - Quick Start

## ⚡ Быстрая настройка для продакшена

### 1️⃣ Получите ключи Cloudflare (5 минут)

1. Перейдите на [dash.cloudflare.com/turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Нажмите **Add Site**
3. Заполните:
   - **Site name**: `GrantAI Production`
   - **Domain**: Ваш домен (например, `grantai.app`)
   - **Widget Mode**: `Managed`
4. Нажмите **Create**
5. Скопируйте оба ключа:
   - **Site Key** (начинается с `0x4AAAAAAD...`)
   - **Secret Key** (начинается с `0x4AAAAAAD...`)

### 2️⃣ Добавьте ключи в Vercel (2 минуты)

1. Откройте [vercel.com/dashboard](https://vercel.com/dashboard)
2. Выберите проект **GrantAI**
3. **Settings** → **Environment Variables**
4. Добавьте две переменные:

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY = 0x4AAAAAADRJG0feCQv43WrF
TURNSTILE_SECRET_KEY = 0x4AAAAAADRJG8Nun7-S7sLyEqJBmJ5ms1Y
```

5. Выберите **Production** environment
6. Нажмите **Save**

### 3️⃣ Redeploy приложение (1 минута)

```bash
# Через Vercel CLI
vercel --prod

# Или через Dashboard
# Deployments → ... → Redeploy
```

### ✅ Готово!

Turnstile теперь защищает вашу регистрацию от ботов.

---

## 🧪 Проверка конфигурации

### Локально (разработка)

```bash
cd frontend
npm run check:turnstile
```

Вы должны увидеть:
```
✓ NEXT_PUBLIC_TURNSTILE_SITE_KEY
✓ TURNSTILE_SECRET_KEY
📍 Environment: DEVELOPMENT (test keys)
✓ Turnstile is properly configured
```

### На продакшене

1. Откройте `https://yourdomain.com/register`
2. Попробуйте зарегистрироваться
3. Вы должны увидеть виджет Turnstile
4. После прохождения капчи регистрация должна работать

---

## 🔍 Что уже сделано?

✅ **Frontend интеграция**:
- Компонент `<Turnstile />` в `src/components/turnstile.tsx`
- Виджет на странице `/register`
- Автоматическая загрузка скрипта Cloudflare

✅ **Backend валидация**:
- Серверная проверка токена в `src/lib/turnstile-server.ts`
- Интеграция в `registerUser()` action
- Защита от обхода капчи

✅ **Тестовые ключи**:
- Настроены для локальной разработки
- Всегда проходят валидацию
- Не требуют настройки

---

## 🚨 Troubleshooting

### Виджет не отображается?
- Проверьте DevTools Console на ошибки
- Убедитесь, что `NEXT_PUBLIC_TURNSTILE_SITE_KEY` установлен
- Проверьте, что скрипт загружается: Network → `api.js`

### "CAPTCHA verification failed"?
- Проверьте, что `TURNSTILE_SECRET_KEY` установлен в Vercel
- Убедитесь, что домен в Cloudflare совпадает с продакшен доменом
- Проверьте логи: `vercel logs`

### Нужна помощь?
Полная документация: [TURNSTILE_SETUP_GUIDE.md](./TURNSTILE_SETUP_GUIDE.md)

---

## 📊 Мониторинг

После деплоя проверьте статистику в [Cloudflare Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile):
- Количество запросов
- Процент успешных проверок
- Заблокированные боты

---

## 🎯 Результат

- ✅ Защита от ботов и спама
- ✅ Защита от массовой регистрации
- ✅ Бесплатно до 1M запросов/месяц
- ✅ Незаметно для пользователей (без головоломок)
- ✅ Соответствие GDPR (данные не передаются третьим лицам)
