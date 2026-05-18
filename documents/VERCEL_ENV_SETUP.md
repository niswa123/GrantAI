# Настройка переменных окружения в Vercel

## Инструкция по добавлению переменных в Vercel

### Шаг 1: Войдите в панель управления Vercel
1. Перейдите на [vercel.com](https://vercel.com)
2. Откройте ваш проект GrantAi

### Шаг 2: Откройте настройки переменных окружения
1. Перейдите в **Settings** (Настройки)
2. Выберите **Environment Variables** (Переменные окружения)

### Шаг 3: Добавьте следующие переменные

#### Обязательные переменные:

| Имя переменной | Значение | Окружение |
|----------------|----------|-----------|
| `DATABASE_URL` | `postgresql://postgres.fhvxqaurwuvlqtqtmvwu:Tatwol4ik123@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `super-secret-grantai-key-12345` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://ваш-домен.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://ваш-preview-домен.vercel.app` | Preview |
| `KIE_API_KEY` | `c265863dc372ef4fe5b1d34c1732a128` | Production, Preview, Development |

#### OAuth провайдеры:

**Google OAuth:**
| Имя переменной | Значение | Окружение |
|----------------|----------|-----------|
| `GOOGLE_CLIENT_ID` | Ваш Google Client ID | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | Ваш Google Client Secret | Production, Preview, Development |

**GitHub OAuth (опционально):**
| Имя переменной | Значение | Окружение |
|----------------|----------|-----------|
| `GITHUB_CLIENT_ID` | Ваш GitHub Client ID | Production, Preview, Development |
| `GITHUB_CLIENT_SECRET` | Ваш GitHub Client Secret | Production, Preview, Development |

### Шаг 4: Важные замечания

⚠️ **NEXTAUTH_URL для продакшена:**
- Замените `https://ваш-домен.vercel.app` на реальный URL вашего приложения
- Например: `https://grantai.vercel.app`

⚠️ **NEXTAUTH_SECRET для продакшена:**
- Рекомендуется сгенерировать новый секретный ключ для продакшена
- Используйте команду: `openssl rand -base64 32`
- Или онлайн генератор: https://generate-secret.vercel.app/32

⚠️ **OAuth Redirect URIs:**
После добавления переменных в Vercel, обновите Redirect URIs в консолях провайдеров:

**Google Cloud Console:**
- Authorized redirect URIs: `https://ваш-домен.vercel.app/api/auth/callback/google`

**GitHub OAuth App:**
- Authorization callback URL: `https://ваш-домен.vercel.app/api/auth/callback/github`

### Шаг 5: Redeploy приложения
После добавления всех переменных:
1. Перейдите в **Deployments**
2. Нажмите на последний деплой
3. Нажмите **Redeploy** для применения новых переменных

---

## Получение OAuth ключей

### Google OAuth
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите **Google+ API**
4. Перейдите в **Credentials** → **Create Credentials** → **OAuth client ID**
5. Выберите **Web application**
6. Добавьте Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (для разработки)
   - `https://ваш-домен.vercel.app/api/auth/callback/google` (для продакшена)
7. Скопируйте Client ID и Client Secret

### GitHub OAuth
1. Перейдите в [GitHub Settings](https://github.com/settings/developers)
2. Нажмите **New OAuth App**
3. Заполните форму:
   - Application name: `GrantAI`
   - Homepage URL: `https://ваш-домен.vercel.app`
   - Authorization callback URL: `https://ваш-домен.vercel.app/api/auth/callback/github`
4. Для разработки создайте отдельное приложение с callback URL: `http://localhost:3000/api/auth/callback/github`
5. Скопируйте Client ID и сгенерируйте Client Secret

---

## Проверка настройки

После деплоя проверьте:
1. ✅ Приложение запускается без ошибок
2. ✅ Кнопки "Sign in with Google/GitHub" отображаются
3. ✅ OAuth авторизация работает корректно
4. ✅ После входа создается сессия пользователя

## Troubleshooting

**Ошибка: "Configuration error"**
- Проверьте, что все обязательные переменные добавлены
- Убедитесь, что NEXTAUTH_URL соответствует домену

**Ошибка: "OAuth callback error"**
- Проверьте Redirect URIs в консолях провайдеров
- Убедитесь, что они точно совпадают с URL в Vercel

**Ошибка: "Invalid client"**
- Проверьте правильность Client ID и Client Secret
- Убедитесь, что нет лишних пробелов в переменных
