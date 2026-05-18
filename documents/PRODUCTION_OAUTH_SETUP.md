# Production OAuth Setup Guide

## 🎯 Проблема

Текущие OAuth приложения настроены на `localhost:3000`. В продакшене это сломает процесс подключения интеграций, так как callback URLs будут указывать на локальный адрес вместо продакшен домена.

## ✅ Решение

Обновить Callback URLs во всех OAuth приложениях на продакшен домен.

---

## 📋 Список OAuth приложений для обновления

### 1. GitHub Integration (для доступа к репозиториям)
- **Текущий Callback URL**: `http://localhost:3000/api/integrations/github/callback`
- **Новый Callback URL**: `https://grantai.com/api/integrations/github/callback`

### 2. GitHub OAuth (для логина)
- **Текущий Callback URL**: `http://localhost:3000/api/auth/callback/github`
- **Новый Callback URL**: `https://grantai.com/api/auth/callback/github`

### 3. Google OAuth (для логина)
- **Текущий Callback URL**: `http://localhost:3000/api/auth/callback/google`
- **Новый Callback URL**: `https://grantai.com/api/auth/callback/google`

### 4. Jira Integration
- **Текущий Callback URL**: `http://localhost:3000/api/integrations/jira/callback`
- **Новый Callback URL**: `https://grantai.com/api/integrations/jira/callback`

### 5. Linear Integration
- **Текущий Callback URL**: `http://localhost:3000/api/integrations/linear/callback`
- **Новый Callback URL**: `https://grantai.com/api/integrations/linear/callback`

---

## 🔧 Пошаговая настройка

### 1. GitHub Integration (Repo Access)

#### Шаг 1: Откройте GitHub Developer Settings
1. Перейдите на [github.com/settings/developers](https://github.com/settings/developers)
2. Выберите **OAuth Apps**
3. Найдите приложение для интеграции (например, "GrantAI Integration")

#### Шаг 2: Обновите Callback URL
1. Нажмите на название приложения
2. Найдите поле **Authorization callback URL**
3. **Добавьте** новый URL (не удаляйте старый!):
   ```
   https://grantai.com/api/integrations/github/callback
   ```
4. Нажмите **Update application**

#### Шаг 3: Проверьте Client ID и Secret
- **Client ID**: `Ov23lijXl39yLZTNA8v5` (уже в `.env`)
- **Client Secret**: `515365a1ca4a60a00273d76be27c483cfb166ac0` (уже в `.env`)

---

### 2. GitHub OAuth (Login)

#### Шаг 1: Откройте GitHub Developer Settings
1. Перейдите на [github.com/settings/developers](https://github.com/settings/developers)
2. Выберите **OAuth Apps**
3. Найдите приложение для логина (например, "GrantAI Login")

#### Шаг 2: Обновите Callback URL
1. Нажмите на название приложения
2. Найдите поле **Authorization callback URL**
3. **Добавьте** новый URL:
   ```
   https://grantai.com/api/auth/callback/github
   ```
4. Нажмите **Update application**

#### Шаг 3: Проверьте Client ID и Secret
- **Client ID**: `Ov23lix3281VDDMI7521` (уже в `.env`)
- **Client Secret**: `5ef66a21343bc82aefd63e0630c142c12c9772b0` (уже в `.env`)

---

### 3. Google OAuth (Login)

#### Шаг 1: Откройте Google Cloud Console
1. Перейдите на [console.cloud.google.com](https://console.cloud.google.com/)
2. Выберите ваш проект
3. Перейдите в **APIs & Services** → **Credentials**

#### Шаг 2: Найдите OAuth 2.0 Client ID
1. Найдите Client ID для GrantAI
2. Нажмите на него для редактирования

#### Шаг 3: Обновите Authorized redirect URIs
1. В разделе **Authorized redirect URIs** нажмите **+ ADD URI**
2. Добавьте:
   ```
   https://grantai.com/api/auth/callback/google
   ```
3. Нажмите **Save**

#### Шаг 4: Проверьте Client ID и Secret
- **Client ID**: `37619333592-pu5rmvt64fdvspo0g0ui45anc4g9na41.apps.googleusercontent.com` (уже в `.env`)
- **Client Secret**: `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` (уже в `.env`)

---

### 4. Jira Integration

#### Шаг 1: Откройте Atlassian Developer Console
1. Перейдите на [developer.atlassian.com/console/myapps](https://developer.atlassian.com/console/myapps/)
2. Найдите ваше приложение для GrantAI

#### Шаг 2: Обновите Callback URL
1. Нажмите на приложение
2. Перейдите в **Authorization** → **OAuth 2.0 (3LO)**
3. В разделе **Callback URL** нажмите **+ Add**
4. Добавьте:
   ```
   https://grantai.com/api/integrations/jira/callback
   ```
5. Нажмите **Save changes**

#### Шаг 3: Проверьте Client ID и Secret
- **Client ID**: `Q2XT5YKX5vbyduUm3zpSCAaSuE6PLj2T` (уже в `.env`)
- **Client Secret**: `ATOAbHYiP7oqZg0WzntBnR-13cmK685qNTDkJurqfgHq5ZWboPZC3J3UTKTn8vXLhVk38768DE7F` (уже в `.env`)

---

### 5. Linear Integration

#### Шаг 1: Откройте Linear Settings
1. Перейдите на [linear.app/settings/api/applications](https://linear.app/settings/api/applications)
2. Найдите ваше приложение для GrantAI

#### Шаг 2: Обновите Callback URL
1. Нажмите на приложение
2. В поле **Callback URLs** добавьте:
   ```
   https://grantai.com/api/integrations/linear/callback
   ```
3. Нажмите **Update application**

#### Шаг 3: Проверьте Client ID и Secret
- **Client ID**: `ce2276175531a230dd06c73f6e9e6b75` (уже в `.env`)
- **Client Secret**: `c2a013ad0dec9b2cc2cf75f1bec0cabe` (уже в `.env`)

---

## 🎯 Важные замечания

### Не удаляйте localhost URLs!

**Почему?** Вам нужно оставить оба URL (localhost и production) для:
- Локальной разработки
- Тестирования на staging
- Возможности быстрого отката

### Правильная конфигурация:

```
Authorized redirect URIs:
✅ http://localhost:3000/api/integrations/github/callback
✅ https://grantai.com/api/integrations/github/callback
```

### Неправильная конфигурация:

```
Authorized redirect URIs:
❌ https://grantai.com/api/integrations/github/callback (только production)
```

---

## 🧪 Тестирование после обновления

### 1. Проверьте GitHub Integration

```bash
# Откройте в браузере
https://grantai.com/settings/integrations

# Нажмите "Connect GitHub"
# Должен открыться GitHub OAuth flow
# После авторизации должен вернуться на grantai.com
```

### 2. Проверьте GitHub Login

```bash
# Откройте в браузере
https://grantai.com/login

# Нажмите "Sign in with GitHub"
# Должен открыться GitHub OAuth flow
# После авторизации должен вернуться на grantai.com/dashboard
```

### 3. Проверьте Google Login

```bash
# Откройте в браузере
https://grantai.com/login

# Нажмите "Sign in with Google"
# Должен открыться Google OAuth flow
# После авторизации должен вернуться на grantai.com/dashboard
```

### 4. Проверьте Jira Integration

```bash
# Откройте в браузере
https://grantai.com/settings/integrations

# Нажмите "Connect Jira"
# Должен открыться Jira OAuth flow
# После авторизации должен вернуться на grantai.com
```

### 5. Проверьте Linear Integration

```bash
# Откройте в браузере
https://grantai.com/settings/integrations

# Нажмите "Connect Linear"
# Должен открыться Linear OAuth flow
# После авторизации должен вернуться на grantai.com
```

---

## 🚨 Troubleshooting

### Ошибка: "redirect_uri_mismatch"

**Причина**: Callback URL не совпадает с настроенным в OAuth приложении.

**Решение**:
1. Проверьте, что URL добавлен в OAuth приложении
2. Убедитесь, что URL точно совпадает (включая протокол https://)
3. Проверьте, что нет лишних слешей в конце

### Ошибка: "invalid_client"

**Причина**: Client ID или Client Secret неверны.

**Решение**:
1. Проверьте Client ID и Secret в OAuth приложении
2. Убедитесь, что они совпадают с `.env` файлом
3. Проверьте, что нет лишних пробелов

### Ошибка: "access_denied"

**Причина**: Пользователь отклонил авторизацию или приложение не имеет нужных прав.

**Решение**:
1. Проверьте scopes в OAuth приложении
2. Убедитесь, что приложение запрашивает правильные разрешения
3. Попробуйте авторизоваться снова

---

## 📊 Checklist

### Перед деплоем

- [ ] GitHub Integration Callback URL обновлен
- [ ] GitHub OAuth Callback URL обновлен
- [ ] Google OAuth Callback URL обновлен
- [ ] Jira Integration Callback URL обновлен
- [ ] Linear Integration Callback URL обновлен
- [ ] Localhost URLs оставлены для разработки
- [ ] Client IDs и Secrets проверены

### После деплоя

- [ ] GitHub Integration работает
- [ ] GitHub Login работает
- [ ] Google Login работает
- [ ] Jira Integration работает
- [ ] Linear Integration работает
- [ ] Нет ошибок в логах Vercel

---

## 📚 Дополнительные ресурсы

### GitHub
- [GitHub OAuth Apps Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [GitHub Developer Settings](https://github.com/settings/developers)

### Google
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

### Jira
- [Atlassian OAuth 2.0 Documentation](https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/)
- [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)

### Linear
- [Linear OAuth Documentation](https://developers.linear.app/docs/oauth)
- [Linear API Settings](https://linear.app/settings/api)

---

## 🎉 Готово!

После выполнения всех шагов ваши OAuth интеграции будут работать на продакшене.

**Следующие шаги**:
1. Задеплойте приложение на Vercel
2. Протестируйте все OAuth flows
3. Проверьте логи на наличие ошибок

**Документация**: [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)

---

**Последнее обновление**: 2026-05-19  
**Версия**: 1.0.0  
**Статус**: ✅ Готово к использованию
