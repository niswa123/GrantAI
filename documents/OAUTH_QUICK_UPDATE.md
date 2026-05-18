# OAuth Quick Update - Production Callback URLs

## ⚡ Быстрая инструкция (10 минут)

### 1. GitHub Integration (2 мин)
1. [github.com/settings/developers](https://github.com/settings/developers) → OAuth Apps
2. Найти "GrantAI Integration"
3. **Добавить** Callback URL: `https://grantai.com/api/integrations/github/callback`
4. Save

### 2. GitHub Login (2 мин)
1. [github.com/settings/developers](https://github.com/settings/developers) → OAuth Apps
2. Найти "GrantAI Login"
3. **Добавить** Callback URL: `https://grantai.com/api/auth/callback/github`
4. Save

### 3. Google Login (2 мин)
1. [console.cloud.google.com](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Найти OAuth 2.0 Client ID
3. **Добавить** Authorized redirect URI: `https://grantai.com/api/auth/callback/google`
4. Save

### 4. Jira Integration (2 мин)
1. [developer.atlassian.com/console/myapps](https://developer.atlassian.com/console/myapps/)
2. Найти ваше приложение
3. Authorization → OAuth 2.0 (3LO)
4. **Добавить** Callback URL: `https://grantai.com/api/integrations/jira/callback`
5. Save

### 5. Linear Integration (2 мин)
1. [linear.app/settings/api/applications](https://linear.app/settings/api/applications)
2. Найти ваше приложение
3. **Добавить** Callback URL: `https://grantai.com/api/integrations/linear/callback`
4. Save

---

## ⚠️ Важно!

- **НЕ УДАЛЯЙТЕ** localhost URLs!
- **ДОБАВЛЯЙТЕ** production URLs к существующим
- Оба URL должны быть активны одновременно

---

## ✅ Проверка

После обновления откройте:
- `https://grantai.com/login` → Попробуйте GitHub/Google login
- `https://grantai.com/settings/integrations` → Попробуйте подключить интеграции

---

**Полная документация**: [PRODUCTION_OAUTH_SETUP.md](./PRODUCTION_OAUTH_SETUP.md)
