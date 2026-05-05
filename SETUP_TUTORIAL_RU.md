# 🚀 Полное руководство по настройке GrantAI

## Содержание
1. [Настройка базы данных](#1-настройка-базы-данных)
2. [Настройка GitHub OAuth](#2-настройка-github-oauth)
3. [Настройка Jira OAuth](#3-настройка-jira-oauth)
4. [Настройка переменных окружения](#4-настройка-переменных-окружения)
5. [Запуск приложения](#5-запуск-приложения)
6. [Проверка работы](#6-проверка-работы)

---

## 1. Настройка базы данных

### Шаг 1.1: Откройте терминал

Откройте терминал в корневой папке проекта.

### Шаг 1.2: Перейдите в папку backend

```bash
cd backend
```

### Шаг 1.3: Запустите миграции базы данных

```bash
npx prisma migrate dev
```

**Что вы увидите:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma

✔ Generated Prisma Client
✔ The migration has been applied successfully
```

### Шаг 1.4: Сгенерируйте Prisma Client

```bash
npx prisma generate
```

**Что вы увидите:**
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

✅ **База данных настроена!** Созданы таблицы:
- `integrations` - для GitHub/Jira интеграций
- `company_members` - для команд
- `activity_logs` - для логов активности
- `submissions` - для отправок в государственные органы

---

## 2. Настройка GitHub OAuth

### Шаг 2.1: Откройте GitHub

Перейдите по ссылке: https://github.com/settings/developers

### Шаг 2.2: Создайте новое OAuth приложение

1. Нажмите **"OAuth Apps"** в левом меню
2. Нажмите кнопку **"New OAuth App"**

### Шаг 2.3: Заполните форму

Заполните следующие поля:

| Поле | Что вставить |
|------|--------------|
| **Application name** | `GrantAI` (или любое другое имя) |
| **Homepage URL** | `http://localhost:3001` |
| **Application description** | `R&D Tax Credit Analysis Platform` (необязательно) |
| **Authorization callback URL** | `http://localhost:3000/api/integrations/github/callback` |

⚠️ **ВАЖНО:** URL callback должен быть **точно** таким: `http://localhost:3000/api/integrations/github/callback`

### Шаг 2.4: Зарегистрируйте приложение

Нажмите кнопку **"Register application"**

### Шаг 2.5: Получите Client ID

После регистрации вы увидите страницу с **Client ID**. 

📋 **Скопируйте Client ID** и сохраните его в блокноте:

```
Client ID: Ghp_xxxxxxxxxxxxxxxxxxxx
```

### Шаг 2.6: Создайте Client Secret

1. Нажмите кнопку **"Generate a new client secret"**
2. GitHub покажет секрет **только один раз**

📋 **НЕМЕДЛЕННО скопируйте Client Secret** и сохраните в блокноте:

```
Client Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **ВАЖНО:** Если вы потеряете секрет, придется создавать новый!

✅ **GitHub OAuth настроен!** У вас есть:
- ✅ Client ID
- ✅ Client Secret

---

## 3. Настройка Jira OAuth

### Шаг 3.1: Откройте Atlassian Developer Console

Перейдите по ссылке: https://developer.atlassian.com/console/myapps/

### Шаг 3.2: Создайте новое приложение

1. Нажмите кнопку **"Create"**
2. Выберите **"OAuth 2.0 integration"**

### Шаг 3.3: Заполните основную информацию

| Поле | Что вставить |
|------|--------------|
| **Name** | `GrantAI` |
| **Description** | `R&D Tax Credit Analysis Platform` (необязательно) |

Нажмите **"Create"**

### Шаг 3.4: Настройте Callback URL

1. Перейдите на вкладку **"Settings"** (слева)
2. Найдите раздел **"Callback URL"**
3. Нажмите **"Add"**
4. Вставьте: `http://localhost:3000/api/integrations/jira/callback`
5. Нажмите **"Save changes"**

⚠️ **ВАЖНО:** URL должен быть **точно** таким: `http://localhost:3000/api/integrations/jira/callback`

### Шаг 3.5: Настройте разрешения (Permissions)

1. Перейдите на вкладку **"Permissions"** (слева)
2. Нажмите **"Add"** → **"Jira API"**
3. Найдите и отметьте следующие разрешения:
   - ☑️ `read:jira-work` - Чтение проектов и задач
   - ☑️ `read:jira-user` - Чтение информации о пользователе
   - ☑️ `offline_access` - Обновление токена
4. Нажмите **"Save"**

### Шаг 3.6: Получите Client ID и Secret

1. Вернитесь на вкладку **"Settings"**
2. Найдите раздел **"Client ID"** и **"Secret"**

📋 **Скопируйте Client ID**:

```
Client ID: xxxxxxxxxxxxxxxxxxxxxxxx
```

📋 **Скопируйте Secret** (нажмите "Show" если скрыт):

```
Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

✅ **Jira OAuth настроен!** У вас есть:
- ✅ Client ID
- ✅ Client Secret
- ✅ Callback URL настроен
- ✅ Разрешения добавлены

---

## 4. Настройка переменных окружения

### Шаг 4.1: Откройте файл .env

Откройте файл `backend/.env` в текстовом редакторе.

Если файла нет, создайте его:

```bash
cd backend
touch .env
```

### Шаг 4.2: Скопируйте базовую конфигурацию

Откройте файл `backend/.env.example` и скопируйте всё его содержимое в `backend/.env`

### Шаг 4.3: Добавьте GitHub credentials

Найдите в файле `.env` строки:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/integrations/github/callback
```

**Замените** `your_github_client_id` и `your_github_client_secret` на ваши значения из Шага 2:

```env
GITHUB_CLIENT_ID=Ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_CALLBACK_URL=http://localhost:3000/api/integrations/github/callback
```

### Шаг 4.4: Добавьте Jira credentials

Найдите в файле `.env` строки:

```env
JIRA_CLIENT_ID=your_jira_client_id
JIRA_CLIENT_SECRET=your_jira_client_secret
JIRA_CALLBACK_URL=http://localhost:3000/api/integrations/jira/callback
```

**Замените** `your_jira_client_id` и `your_jira_client_secret` на ваши значения из Шага 3:

```env
JIRA_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxx
JIRA_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
JIRA_CALLBACK_URL=http://localhost:3000/api/integrations/jira/callback
```

### Шаг 4.5: Проверьте другие переменные

Убедитесь, что в файле `.env` есть:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/grantai_db?schema=public"
JWT_SECRET="your_super_secret_key_min_32_chars"
JWT_EXPIRES_IN="15m"
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
FRONTEND_URL=http://localhost:3001
```

### Шаг 4.6: Сохраните файл

Сохраните файл `backend/.env`

✅ **Переменные окружения настроены!**

---

## 5. Запуск приложения

### Шаг 5.1: Убедитесь, что вы в папке backend

```bash
cd backend
```

### Шаг 5.2: Остановите сервер (если запущен)

Нажмите `Ctrl+C` в терминале, где запущен сервер.

### Шаг 5.3: Запустите сервер

```bash
npm run start:dev
```

**Что вы должны увидеть:**

```
[Nest] 12345  - 05/05/2026, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 05/05/2026, 10:00:00 AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 05/05/2026, 10:00:00 AM     LOG [InstanceLoader] IntegrationsModule dependencies initialized
[Nest] 12345  - 05/05/2026, 10:00:00 AM     LOG [InstanceLoader] TeamModule dependencies initialized
[Nest] 12345  - 05/05/2026, 10:00:00 AM     LOG [InstanceLoader] SubmissionsModule dependencies initialized
[Nest] 12345  - 05/05/2026, 10:00:00 AM     LOG [NestApplication] Nest application successfully started
```

✅ **Сервер запущен!**

---

## 6. Проверка работы

### Шаг 6.1: Получите Company ID

Вам нужен ID компании из базы данных. Выполните:

```bash
# В новом терминале
psql -d grantai_db -c "SELECT id, name FROM companies LIMIT 1;"
```

📋 **Скопируйте ID компании**, например:

```
id: 123e4567-e89b-12d3-a456-426614174000
```

### Шаг 6.2: Проверьте GitHub интеграцию

Откройте браузер и перейдите по ссылке (замените `YOUR_COMPANY_ID` на ваш ID):

```
http://localhost:3000/api/integrations/github/authorize?companyId=YOUR_COMPANY_ID
```

**Пример:**
```
http://localhost:3000/api/integrations/github/authorize?companyId=123e4567-e89b-12d3-a456-426614174000
```

**Что должно произойти:**
1. Вас перенаправит на страницу GitHub
2. GitHub попросит разрешить доступ
3. Нажмите **"Authorize"**
4. Вас перенаправит обратно на `http://localhost:3001/company?integration=github&status=success`

✅ **GitHub интеграция работает!**

### Шаг 6.3: Проверьте Jira интеграцию

Откройте браузер и перейдите по ссылке (замените `YOUR_COMPANY_ID` на ваш ID):

```
http://localhost:3000/api/integrations/jira/authorize?companyId=YOUR_COMPANY_ID
```

**Пример:**
```
http://localhost:3000/api/integrations/jira/authorize?companyId=123e4567-e89b-12d3-a456-426614174000
```

**Что должно произойти:**
1. Вас перенаправит на страницу Atlassian
2. Выберите ваш Jira сайт
3. Нажмите **"Accept"**
4. Вас перенаправит обратно на `http://localhost:3001/company?integration=jira&status=success`

✅ **Jira интеграция работает!**

### Шаг 6.4: Проверьте базу данных

Проверьте, что интеграции сохранились:

```bash
psql -d grantai_db -c "SELECT provider, created_at FROM integrations;"
```

**Вы должны увидеть:**
```
 provider |         created_at
----------+----------------------------
 github   | 2026-05-05 10:15:00
 jira     | 2026-05-05 10:16:00
```

✅ **Всё работает!**

---

## 🎉 Поздравляем!

Вы успешно настроили:
- ✅ База данных с новыми таблицами
- ✅ GitHub OAuth интеграция
- ✅ Jira OAuth интеграция
- ✅ Переменные окружения
- ✅ Сервер запущен и работает

---

## 🆘 Решение проблем

### Проблема: "Integration not found"

**Причина:** OAuth процесс не завершился успешно.

**Решение:**
1. Проверьте, что вы прошли OAuth процесс (Шаг 6.2 или 6.3)
2. Проверьте базу данных: `SELECT * FROM integrations;`
3. Попробуйте заново пройти OAuth

### Проблема: "Invalid client_id or client_secret"

**Причина:** Неправильные credentials в `.env`

**Решение:**
1. Откройте `backend/.env`
2. Проверьте, что Client ID и Secret скопированы правильно
3. Убедитесь, что нет лишних пробелов
4. Перезапустите сервер

### Проблема: "Redirect URI mismatch"

**Причина:** Callback URL не совпадает

**Решение для GitHub:**
1. Откройте https://github.com/settings/developers
2. Выберите ваше приложение
3. Проверьте, что **Authorization callback URL** = `http://localhost:3000/api/integrations/github/callback`
4. Сохраните изменения

**Решение для Jira:**
1. Откройте https://developer.atlassian.com/console/myapps/
2. Выберите ваше приложение
3. Перейдите в Settings
4. Проверьте, что **Callback URL** = `http://localhost:3000/api/integrations/jira/callback`
5. Сохраните изменения

### Проблема: Сервер не запускается

**Решение:**
1. Проверьте, что PostgreSQL запущен
2. Проверьте, что Redis запущен
3. Проверьте `DATABASE_URL` в `.env`
4. Запустите миграции: `npx prisma migrate dev`

---

## 📞 Нужна помощь?

Проверьте документацию:
- `ALL_FEATURES_COMPLETE.md` - Полный обзор
- `GITHUB_JIRA_INTEGRATION_COMPLETE.md` - Детали интеграции
- `backend/INTEGRATIONS_SETUP.md` - Подробная настройка

---

**Удачи! 🚀**
