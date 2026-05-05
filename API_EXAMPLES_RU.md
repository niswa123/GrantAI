# 📡 Примеры использования API - Пошаговое руководство

## Содержание
1. [Получение JWT токена](#1-получение-jwt-токена)
2. [Работа с GitHub интеграцией](#2-работа-с-github-интеграцией)
3. [Работа с Jira интеграцией](#3-работа-с-jira-интеграцией)
4. [Управление командой](#4-управление-командой)
5. [Просмотр логов активности](#5-просмотр-логов-активности)
6. [Экспорт заявок](#6-экспорт-заявок)

---

## Подготовка

### Что вам понадобится:

1. **Company ID** - ID вашей компании
2. **JWT Token** - токен авторизации
3. **curl** или **Postman** для тестирования API

### Как получить Company ID:

```bash
psql -d grantai_db -c "SELECT id, name FROM companies WHERE user_id = 'YOUR_USER_ID';"
```

📋 Скопируйте ID, например: `123e4567-e89b-12d3-a456-426614174000`

---

## 1. Получение JWT токена

### Шаг 1.1: Войдите в систему

**Запрос:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ВАШ_EMAIL@example.com",
    "password": "ВАШ_ПАРОЛЬ"
  }'
```

**Замените:**
- `ВАШ_EMAIL@example.com` → ваш email
- `ВАШ_ПАРОЛЬ` → ваш пароль

**Ответ:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "your@example.com"
  }
}
```

📋 **Скопируйте `access_token`** - это ваш JWT токен!

### Шаг 1.2: Сохраните токен

Сохраните токен в переменную (для удобства):

```bash
export JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export COMPANY_ID="123e4567-e89b-12d3-a456-426614174000"
```

**Замените** значения на ваши!

---

## 2. Работа с GitHub интеграцией

### Шаг 2.1: Подключите GitHub (через браузер)

Откройте в браузере:
```
http://localhost:3000/api/integrations/github/authorize?companyId=ВАШ_COMPANY_ID
```

**Замените** `ВАШ_COMPANY_ID` на ваш ID!

Авторизуйтесь на GitHub.

### Шаг 2.2: Получите список репозиториев

**Запрос:**
```bash
curl -X GET "http://localhost:3000/api/integrations/github/repositories?companyId=$COMPANY_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Ответ:**
```json
{
  "repositories": [
    {
      "id": 123456,
      "name": "my-project",
      "full_name": "username/my-project",
      "description": "My awesome project",
      "html_url": "https://github.com/username/my-project",
      "language": "TypeScript",
      "stargazers_count": 42,
      "updated_at": "2026-05-05T10:00:00Z"
    }
  ]
}
```

📋 **Скопируйте `full_name`** репозитория, например: `username/my-project`

### Шаг 2.3: Получите предложения проектов

**Запрос:**
```bash
curl -X GET "http://localhost:3000/api/integrations/github/project-suggestions?companyId=$COMPANY_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Ответ:**
```json
{
  "suggestions": [
    {
      "title": "my-project",
      "description": "My awesome project\n\nPrimary Language: TypeScript\nLast Updated: 05/05/2026",
      "source": "github",
      "sourceId": "123456",
      "metadata": {
        "full_name": "username/my-project",
        "html_url": "https://github.com/username/my-project",
        "language": "TypeScript",
        "stars": 42
      }
    }
  ]
}
```

### Шаг 2.4: Получите детальное описание проекта

**Запрос:**
```bash
curl -X GET "http://localhost:3000/api/integrations/github/repositories/USERNAME/REPO_NAME/description?companyId=$COMPANY_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Замените:**
- `USERNAME` → имя пользователя GitHub
- `REPO_NAME` → название репозитория

**Пример:**
```bash
curl -X GET "http://localhost:3000/api/integrations/github/repositories/john/my-app/description?companyId=$COMPANY_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Ответ:**
```json
{
  "description": "# my-app\n\nMy awesome application\n\n**Language:** TypeScript\n**Stars:** 42\n\n## Project Overview\nThis is a full-stack application...\n\n## Recent Activity\n- Total commits analyzed: 150\n- Latest commit: Add new feature\n- Last updated: 2026-05-05\n\n## Issues\n- Open issues: 5\n- Total issues: 23\n\n**Technical Focus Areas:** bug, feature, enhancement"
}
```

📋 **Скопируйте `description`** - используйте его для создания проекта!

---

## 3. Работа с Jira интеграцией

### Шаг 3.1: Подключите Jira (через браузер)

Откройте в браузере:
```
http://localhost:3000/api/integrations/jira/authorize?companyId=ВАШ_COMPANY_ID
```

**Замените** `ВАШ_COMPANY_ID` на ваш ID!

Авторизуйтесь в Atlassian.

### Шаг 3.2: Получите список проектов

**Запрос:**
```bash
curl -X GET "http://localhost:3000/api/integrations/jira/projects?companyId=$COMPANY_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Ответ:**
```json
{
  "projects": [
    {
      "id": "10000",
      "key": "PROJ",
      "name": "My Project",
      "description": "Project description",
      "projectTypeKey": "software",
      "lead": {
        "displayName": "John Doe"
      }
    }
  ],
  "cloudId": "cloud-id-123"
}
```

📋 **Скопируйте `key`** проекта, например: `PROJ`

### Шаг 3.3: Получите предложения проектов

**Запрос:**
```bash
curl -X GET "http://localhost:3000/api/integrations/jira/project-suggestions?companyId=$COMPANY_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Ответ:**
```json
{
  "suggestions": [
    {
      "title": "PROJ: My Project",
      "description": "Project description\n\nProject Type: software\nProject Lead: John Doe",
      "source": "jira",
      "sourceId": "10000",
      "metadata": {
        "key": "PROJ",
        "projectTypeKey": "software",
        "lead": "John Doe"
      }
    }
  ]
}
```

### Шаг 3.4: Получите детальное описание проекта

**Запрос:**
```bash
curl -X GET "http://localhost:3000/api/integrations/jira/projects/PROJECT_KEY/description?companyId=$COMPANY_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Замените** `PROJECT_KEY` на ключ проекта (например, `PROJ`)

**Пример:**
```bash
curl -X GET "http://localhost:3000/api/integrations/jira/projects/PROJ/description?companyId=$COMPANY_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Ответ:**
```json
{
  "description": "# My Project (PROJ)\n\nProject description\n\n**Project Type:** software\n**Lead:** John Doe\n\n## Project Statistics\n- Total issues: 45\n\n### Issues by Type\n- Story: 20\n- Bug: 15\n- Task: 10\n\n### Issues by Status\n- To Do: 10\n- In Progress: 15\n- Done: 20\n\n**Key Labels:** backend, frontend, api, database, testing"
}
```

---

## 4. Управление командой

### Шаг 4.1: Получите список членов команды

**Запрос:**
```bash
curl -X GET "http://localhost:3000/api/team/companies/$COMPANY_ID/members" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Ответ:**
```json
{
  "members": [
    {
      "id": "member-id-1",
      "company_id": "company-id",
      "user_id": "user-id-1",
      "role": "OWNER",
      "joined_at": "2026-01-01T00:00:00Z",
      "user": {
        "id": "user-id-1",
        "email": "owner@example.com",
        "created_at": "2026-01-01T00:00:00Z"
      }
    }
  ]
}
```

### Шаг 4.2: Пригласите нового члена команды

**Запрос:**
```bash
curl -X POST "http://localhost:3000/api/team/companies/$COMPANY_ID/members" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "НОВЫЙ_EMAIL@example.com",
    "role": "MEMBER"
  }'
```

**Замените:**
- `НОВЫЙ_EMAIL@example.com` → email нового члена команды
- `"MEMBER"` → роль: `"OWNER"`, `"ADMIN"`, `"MEMBER"`, или `"VIEWER"`

**Доступные роли:**
- `OWNER` - Владелец (полный доступ)
- `ADMIN` - Администратор (управление командой)
- `MEMBER` - Участник (редактирование данных)
- `VIEWER` - Наблюдатель (только просмотр)

**Ответ:**
```json
{
  "member": {
    "id": "new-member-id",
    "company_id": "company-id",
    "user_id": "new-user-id",
    "role": "MEMBER",
    "invited_by": "your-user-id",
    "joined_at": "2026-05-05T10:00:00Z",
    "user": {
      "id": "new-user-id",
      "email": "colleague@example.com"
    }
  }
}
```

### Шаг 4.3: Измените роль члена команды

**Запрос:**
```bash
curl -X PUT "http://localhost:3000/api/team/companies/$COMPANY_ID/members/USER_ID/role" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "ADMIN"
  }'
```

**Замените:**
- `USER_ID` → ID пользователя, чью роль хотите изменить
- `"ADMIN"` → новая роль

**Ответ:**
```json
{
  "member": {
    "id": "member-id",
    "role": "ADMIN",
    "updated_at": "2026-05-05T10:05:00Z"
  }
}
```

### Шаг 4.4: Удалите члена команды

**Запрос:**
```bash
curl -X DELETE "http://localhost:3000/api/team/companies/$COMPANY_ID/members/USER_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Замените** `USER_ID` → ID пользователя для удаления

**Ответ:**
```json
{
  "message": "Member removed successfully"
}
```

---

## 5. Просмотр логов активности

### Шаг 5.1: Получите последнюю активность

**Запрос:**
```bash
curl -X GET "http://localhost:3000/api/team/companies/$COMPANY_ID/activity/recent?limit=10" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Ответ:**
```json
{
  "logs": [
    {
      "id": "log-id-1",
      "company_id": "company-id",
      "user_id": "user-id",
      "activity_type": "PROJECT_CREATED",
      "description": "Created project 'New Feature'",
      "entity_type": "project",
      "entity_id": "project-id",
      "created_at": "2026-05-05T10:00:00Z",
      "user": {
        "id": "user-id",
        "email": "user@example.com"
      }
    },
    {
      "id": "log-id-2",
      "activity_type": "USER_INVITED",
      "description": "Invited colleague@example.com as MEMBER",
      "created_at": "2026-05-05T09:55:00Z"
    }
  ]
}
```

### Шаг 5.2: Получите активность с фильтрами

**Запрос:**
```bash
curl -X GET "http://localhost:3000/api/team/companies/$COMPANY_ID/activity?activityType=PROJECT_CREATED&limit=20&offset=0" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Доступные фильтры:**
- `activityType` - тип активности (например, `PROJECT_CREATED`)
- `userId` - ID пользователя
- `entityType` - тип сущности (например, `project`)
- `entityId` - ID сущности
- `startDate` - начальная дата (ISO 8601)
- `endDate` - конечная дата (ISO 8601)
- `limit` - количество записей (по умолчанию 50)
- `offset` - смещение для пагинации

**Пример с датами:**
```bash
curl -X GET "http://localhost:3000/api/team/companies/$COMPANY_ID/activity?startDate=2026-05-01T00:00:00Z&endDate=2026-05-05T23:59:59Z&limit=50" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

### Шаг 5.3: Получите статистику активности

**Запрос:**
```bash
curl -X GET "http://localhost:3000/api/team/companies/$COMPANY_ID/activity/stats?days=30" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Ответ:**
```json
{
  "stats": {
    "total": 150,
    "byType": {
      "PROJECT_CREATED": 25,
      "PROJECT_UPDATED": 40,
      "EXPENSE_CREATED": 30,
      "ANALYSIS_RUN": 15,
      "USER_INVITED": 5
    },
    "byUser": {
      "user-id-1": 80,
      "user-id-2": 70
    },
    "byDay": {
      "2026-05-01": 20,
      "2026-05-02": 25,
      "2026-05-03": 30
    },
    "period": {
      "start": "2026-04-05T00:00:00Z",
      "end": "2026-05-05T00:00:00Z",
      "days": 30
    }
  }
}
```

---

## 6. Экспорт заявок

### Шаг 6.1: Экспортируйте заявку в PDF

**Запрос:**
```bash
curl -X POST "http://localhost:3000/api/submissions/claims/CLAIM_ID/export" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "PDF",
    "country": "NL"
  }'
```

**Замените:**
- `CLAIM_ID` → ID вашей заявки
- `"PDF"` → формат: `"PDF"`, `"XML"`, `"JSON"`, `"CSV"`
- `"NL"` → страна: `"NL"`, `"UK"`, `"FR"`, `"DE"`

**Ответ:**
```json
{
  "submission": {
    "id": "submission-id",
    "claim_id": "claim-id",
    "format": "PDF",
    "status": "DRAFT",
    "file_url": "/downloads/claim-123.pdf",
    "created_at": "2026-05-05T10:00:00Z"
  }
}
```

### Шаг 6.2: Обновите статус отправки

**Запрос:**
```bash
curl -X PUT "http://localhost:3000/api/submissions/SUBMISSION_ID/status" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SUBMITTED",
    "referenceNumber": "WBSO-2026-12345",
    "notes": "Отправлено через портал RVO"
  }'
```

**Замените:**
- `SUBMISSION_ID` → ID отправки
- `"SUBMITTED"` → статус: `"DRAFT"`, `"PENDING"`, `"SUBMITTED"`, `"UNDER_REVIEW"`, `"APPROVED"`, `"REJECTED"`
- `"WBSO-2026-12345"` → номер заявки от государственного органа
- `"Отправлено через портал RVO"` → ваши заметки

**Ответ:**
```json
{
  "submission": {
    "id": "submission-id",
    "status": "SUBMITTED",
    "reference_number": "WBSO-2026-12345",
    "submitted_at": "2026-05-05T10:00:00Z",
    "notes": "Отправлено через портал RVO"
  }
}
```

### Шаг 6.3: Получите историю отправок

**Запрос:**
```bash
curl -X GET "http://localhost:3000/api/submissions/claims/CLAIM_ID" \
  -H "Authorization: Bearer $JWT_TOKEN"
```

**Замените** `CLAIM_ID` → ID заявки

**Ответ:**
```json
{
  "submissions": [
    {
      "id": "submission-1",
      "format": "PDF",
      "status": "SUBMITTED",
      "reference_number": "WBSO-2026-12345",
      "submitted_at": "2026-05-05T10:00:00Z",
      "file_url": "/downloads/claim-123.pdf"
    },
    {
      "id": "submission-2",
      "format": "XML",
      "status": "DRAFT",
      "created_at": "2026-05-04T15:00:00Z"
    }
  ]
}
```

---

## 🎯 Полезные команды

### Сохраните переменные окружения

Создайте файл `api-test.sh`:

```bash
#!/bin/bash

# Ваши данные
export JWT_TOKEN="ВАШ_JWT_ТОКЕН"
export COMPANY_ID="ВАШ_COMPANY_ID"
export API_URL="http://localhost:3000/api"

# Функции для быстрого тестирования
github_repos() {
  curl -X GET "$API_URL/integrations/github/repositories?companyId=$COMPANY_ID" \
    -H "Authorization: Bearer $JWT_TOKEN"
}

team_members() {
  curl -X GET "$API_URL/team/companies/$COMPANY_ID/members" \
    -H "Authorization: Bearer $JWT_TOKEN"
}

recent_activity() {
  curl -X GET "$API_URL/team/companies/$COMPANY_ID/activity/recent?limit=10" \
    -H "Authorization: Bearer $JWT_TOKEN"
}
```

**Использование:**
```bash
chmod +x api-test.sh
source api-test.sh
github_repos
team_members
recent_activity
```

---

## 🆘 Решение проблем

### Ошибка: "Unauthorized"

**Причина:** Неверный или истекший JWT токен

**Решение:**
1. Получите новый токен (Шаг 1.1)
2. Обновите переменную `JWT_TOKEN`

### Ошибка: "Integration not found"

**Причина:** GitHub/Jira не подключен

**Решение:**
1. Подключите интеграцию через браузер (Шаг 2.1 или 3.1)
2. Проверьте: `SELECT * FROM integrations WHERE company_id = 'YOUR_ID';`

### Ошибка: "Forbidden"

**Причина:** Недостаточно прав

**Решение:**
1. Проверьте вашу роль: `GET /team/companies/:companyId/role`
2. Попросите владельца повысить вашу роль

---

**Удачи в использовании API! 🚀**
