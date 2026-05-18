# 🔐 OAuth Setup Guide для GrantAI

## 📋 Что нужно сделать

Эта инструкция поможет настроить OAuth аутентификацию через Google и GitHub для GrantAI.

---

## 1️⃣ Google OAuth Setup

### Шаг 1: Создание проекта в Google Cloud Console

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Название проекта: `GrantAI` (или любое другое)

### Шаг 2: Включение Google+ API

1. В меню слева выберите **APIs & Services** → **Library**
2. Найдите **Google+ API**
3. Нажмите **Enable**

### Шаг 3: Создание OAuth Credentials

1. Перейдите в **APIs & Services** → **Credentials**
2. Нажмите **Create Credentials** → **OAuth client ID**
3. Если появится предупреждение о consent screen:
   - Нажмите **Configure Consent Screen**
   - Выберите **External** (для тестирования)
   - Заполните обязательные поля:
     - App name: `GrantAI`
     - User support email: ваш email
     - Developer contact: ваш email
   - Нажмите **Save and Continue**
   - На странице Scopes нажмите **Save and Continue**
   - На странице Test users добавьте свой email
   - Нажмите **Save and Continue**

4. Вернитесь к созданию OAuth client ID:
   - Application type: **Web application**
   - Name: `GrantAI Web Client`
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     https://grant-ai-yquu.vercel.app
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     https://grant-ai-yquu.vercel.app/api/auth/callback/google
     ```

5. Нажмите **Create**
6. **Скопируйте Client ID и Client Secret** — они понадобятся для `.env`

---

## 2️⃣ GitHub OAuth Setup

### Шаг 1: Создание OAuth App

1. Перейдите на [GitHub Developer Settings](https://github.com/settings/developers)
2. Нажмите **New OAuth App**
3. Заполните форму:
   - **Application name**: `GrantAI`
   - **Homepage URL**: `http://localhost:3000` (для разработки)
   - **Authorization callback URL**: 
     ```
     http://localhost:3000/api/auth/callback/github
     ```
   - **Application description** (опционально): `R&D Tax Credit Automation Platform`

4. Нажмите **Register application**

### Шаг 2: Получение Client Secret

1. После создания приложения нажмите **Generate a new client secret**
2. **Скопируйте Client ID и Client Secret** — они понадобятся для `.env`

---

## 3️⃣ Настройка Environment Variables

### Создайте/обновите файл `.env` в папке `frontend/`

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/grantai?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET="generate-a-secure-random-string-here-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AI Engine
KIE_API_KEY="your-kie-ai-api-key"
```

### Генерация NEXTAUTH_SECRET

Выполните в терминале:

```bash
openssl rand -base64 32
```

Или используйте Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 4️⃣ Проверка настройки NextAuth

Убедитесь, что файл `frontend/src/lib/auth.ts` (или `app/api/auth/[...nextauth]/route.ts`) содержит правильную конфигурацию:

```typescript
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  // ... остальная конфигурация
}
```

---

## 5️⃣ Тестирование

1. Запустите приложение:
   ```bash
   cd frontend
   npm run dev
   ```

2. Откройте `http://localhost:3000`

3. Попробуйте войти через Google или GitHub

4. Проверьте консоль на наличие ошибок

---

## 🚨 Troubleshooting

### Ошибка: "redirect_uri_mismatch"
- Убедитесь, что redirect URI в Google/GitHub точно совпадает с тем, что указано в коде
- Проверьте, что нет лишних слешей в конце URL

### Ошибка: "invalid_client"
- Проверьте правильность Client ID и Client Secret в `.env`
- Убедитесь, что `.env` файл находится в правильной директории

### Ошибка: "NEXTAUTH_URL is not set"
- Добавьте `NEXTAUTH_URL` в `.env` файл

---

## 📝 Checklist

- [x] Создан проект в Google Cloud Console
- [x] Включен Google+ API
- [x] Создан OAuth client ID в Google
- [x] Скопированы Google Client ID и Secret
- [x] Создано OAuth приложение в GitHub
- [x] Скопированы GitHub Client ID и Secret
- [x] Создан `.env` файл с всеми переменными
- [x] Сгенерирован NEXTAUTH_SECRET
- [x] Проверена конфигурация NextAuth в коде
- [] Приложение запущено и протестировано

---

## 🎯 Production Deployment

Когда будете деплоить на продакшен:

1. Обновите Authorized redirect URIs в Google и GitHub на продакшен URL
2. Обновите `NEXTAUTH_URL` в production environment variables
3. Используйте безопасное хранилище для секретов (Vercel Env Variables, AWS Secrets Manager, etc.)

---

**Готово!** После выполнения всех шагов OAuth аутентификация будет работать.
