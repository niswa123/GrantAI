# Настройки и Доработка Аутентификации (To-Do)

- [x] **1. Подтверждение пароля**
  - [x] Добавить поле "Confirm Password" на страницу `/register`.
  - [x] Валидация на стороне клиента: проверка совпадения паролей перед отправкой формы.
  - [x] Валидация на сервере (`authActions.ts`): возвращать ошибку, если пароли не совпадают.

- [x] **2. Подтверждение Email**
  - [x] Реализовать отправку письма через Resend (`src/app/actions/emailActions.ts`).
  - [x] Использована существующая модель `VerificationToken` из Prisma-схемы.
  - [x] Создана страница `/verify-email?token=...` для обработки клика по ссылке.
  - [x] Баннер "Please verify your email" добавлен в root layout (с кнопкой повторной отправки).

- [x] **3. Капча (Captcha)**
  - [x] Компонент Cloudflare Turnstile создан (`src/components/turnstile.tsx`) — без сторонних npm-пакетов.
  - [x] Виджет добавлен в форму регистрации — отображается только при наличии `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
  - [x] Серверная проверка токена в `authActions.ts` — активируется при наличии `TURNSTILE_SECRET_KEY`.

---

## Что нужно сделать вручную (конфигурация)

### Для Email (Resend):
1. Зайти на [resend.com](https://resend.com) → создать API-ключ.
2. Установить пакет: `npm install resend`
3. Добавить в `.env`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
   RESEND_FROM_EMAIL=GrantAI <noreply@yourdomain.com>
   ```

### Для Капчи (Cloudflare Turnstile):
1. Зайти на [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile → Add Widget → бесплатно.
2. Добавить в `.env`:
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAxxxxxxxxxxxxxxx
   TURNSTILE_SECRET_KEY=0x4AAAAAAAxxxxxxxxxxxxxxx
   ```
   > Пока ключи не добавлены — капча не показывается и не блокирует регистрацию (безопасная деградация).
