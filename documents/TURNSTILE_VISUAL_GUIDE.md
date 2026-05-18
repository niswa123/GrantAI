# Cloudflare Turnstile - Визуальный гид

## 🎨 Как выглядит Turnstile?

### Режим: Managed (рекомендуется)

В режиме **Managed** Cloudflare автоматически решает, показывать ли челлендж пользователю.

#### Для обычных пользователей (90%+ случаев):
```
┌─────────────────────────────────────────┐
│  ✓ Verification complete                │
│                                          │
│  [Cloudflare logo]                       │
└─────────────────────────────────────────┘
```
**Время**: < 1 секунда  
**Действия пользователя**: Нет (автоматически)

#### Для подозрительных пользователей (редко):
```
┌─────────────────────────────────────────┐
│  Verify you are human                   │
│                                          │
│  [Interactive challenge]                 │
│                                          │
│  [Cloudflare logo]                       │
└─────────────────────────────────────────┘
```
**Время**: 3-5 секунд  
**Действия пользователя**: Простой клик или задание

---

## 📱 Интеграция в форму регистрации

### Desktop (1920x1080)

```
┌────────────────────────────────────────────────────────────┐
│                                                             │
│                    [GrantAI Logo]                           │
│                                                             │
│                  Create an account                          │
│         Start automating your R&D tax credits today        │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  [Sign up with Google]                             │   │
│  │  [Sign up with GitHub]                             │   │
│  │                                                     │   │
│  │  ─────────────── Or ───────────────                │   │
│  │                                                     │   │
│  │  Work Email                                        │   │
│  │  [name@company.com                    ]            │   │
│  │                                                     │   │
│  │  Password                                          │   │
│  │  [••••••••                            ]            │   │
│  │                                                     │   │
│  │  Confirm Password                                  │   │
│  │  [••••••••                            ]            │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────┐     │   │
│  │  │  ✓ Verification complete                 │     │   │
│  │  │                                           │     │   │
│  │  │  [Cloudflare Turnstile]                  │     │   │
│  │  └──────────────────────────────────────────┘     │   │
│  │                                                     │   │
│  │  [        Create Account        ]                  │   │
│  │                                                     │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│         Already have an account? Sign in instead           │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Mobile (375x667)

```
┌─────────────────────────┐
│                         │
│    [GrantAI Logo]       │
│                         │
│   Create an account     │
│                         │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │ [Sign up Google]    │ │
│ │ [Sign up GitHub]    │ │
│ │                     │ │
│ │ ──── Or ────        │ │
│ │                     │ │
│ │ Work Email          │ │
│ │ [name@company.com]  │ │
│ │                     │ │
│ │ Password            │ │
│ │ [••••••••]          │ │
│ │                     │ │
│ │ Confirm Password    │ │
│ │ [••••••••]          │ │
│ │                     │ │
│ │ ┌─────────────────┐ │ │
│ │ │ ✓ Verified      │ │ │
│ │ │ [Cloudflare]    │ │ │
│ │ └─────────────────┘ │ │
│ │                     │ │
│ │ [Create Account]    │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│  Already have account?  │
│      Sign in instead    │
│                         │
└─────────────────────────┘
```

---

## 🎭 Различные состояния виджета

### 1. Загрузка (Loading)
```
┌─────────────────────────────────────────┐
│  [Spinner animation]                    │
│                                          │
│  Verifying...                            │
└─────────────────────────────────────────┘
```

### 2. Успешная проверка (Success)
```
┌─────────────────────────────────────────┐
│  ✓ Verification complete                │
│                                          │
│  [Cloudflare logo]                       │
└─────────────────────────────────────────┘
```

### 3. Ошибка (Error)
```
┌─────────────────────────────────────────┐
│  ⚠ Verification failed                  │
│                                          │
│  [Try again]                             │
└─────────────────────────────────────────┘
```

### 4. Истёк срок (Expired)
```
┌─────────────────────────────────────────┐
│  ⟳ Verification expired                 │
│                                          │
│  [Verify again]                          │
└─────────────────────────────────────────┘
```

---

## 🌈 Темы оформления

### Dark Theme (используется в GrantAI)
```
┌─────────────────────────────────────────┐
│  Background: #1a1a1a                    │
│  Text: #ffffff                           │
│  Border: #333333                         │
│  Accent: #06b6d4 (cyan)                  │
└─────────────────────────────────────────┘
```

### Light Theme
```
┌─────────────────────────────────────────┐
│  Background: #ffffff                    │
│  Text: #000000                           │
│  Border: #e5e5e5                         │
│  Accent: #0066ff (blue)                  │
└─────────────────────────────────────────┘
```

### Auto Theme
Автоматически переключается между dark/light в зависимости от системных настроек.

---

## 📐 Размеры виджета

### Normal (по умолчанию)
- **Ширина**: 300px
- **Высота**: 65px
- **Использование**: Desktop и tablet

### Compact
- **Ширина**: 150px
- **Высота**: 140px
- **Использование**: Узкие формы, sidebar

### Flexible
- **Ширина**: 100% (адаптивная)
- **Высота**: Автоматическая
- **Использование**: Mobile, responsive дизайн

---

## 🎬 Анимации

### Появление виджета
```
Opacity: 0 → 1 (300ms ease-out)
Transform: translateY(10px) → translateY(0)
```

### Проверка
```
[Spinner] → [Checkmark]
Duration: 500-2000ms
```

### Ошибка
```
[Shake animation]
Duration: 300ms
```

---

## 🔄 User Flow с Turnstile

### Сценарий 1: Обычный пользователь (Happy Path)

```
1. User opens /register
   ↓
2. Form loads with Turnstile widget
   ↓
3. Turnstile automatically verifies (< 1s)
   ↓ ✓ Verification complete
4. User fills email & password
   ↓
5. User clicks "Create Account"
   ↓
6. Form submits successfully
   ↓
7. User redirected to /check-email
```

**Время**: ~30 секунд (включая заполнение формы)  
**Friction**: Минимальный (капча незаметна)

### Сценарий 2: Подозрительный пользователь

```
1. User opens /register
   ↓
2. Form loads with Turnstile widget
   ↓
3. Turnstile shows challenge (3-5s)
   ↓ [Interactive challenge]
4. User completes challenge
   ↓ ✓ Verification complete
5. User fills email & password
   ↓
6. User clicks "Create Account"
   ↓
7. Form submits successfully
   ↓
8. User redirected to /check-email
```

**Время**: ~35-40 секунд  
**Friction**: Низкий (простой челлендж)

### Сценарий 3: Бот (Blocked)

```
1. Bot opens /register
   ↓
2. Form loads with Turnstile widget
   ↓
3. Turnstile detects bot behavior
   ↓ ✗ Verification failed
4. Bot tries to submit form
   ↓
5. Frontend: "Please complete the CAPTCHA"
   ↓
6. Bot tries to bypass (sends without token)
   ↓
7. Backend: "CAPTCHA verification failed"
   ↓
8. Registration blocked ✓
```

**Результат**: Бот заблокирован  
**Защита**: Многоуровневая (frontend + backend)

---

## 🎨 Кастомизация CSS

### Базовые стили (уже применены)

```css
/* Контейнер виджета */
.cf-turnstile {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
}

/* Интеграция с формой */
.turnstile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
}

/* Hint текст */
.turnstile-hint {
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}
```

### Адаптивность

```css
/* Mobile */
@media (max-width: 640px) {
  .cf-turnstile {
    transform: scale(0.9);
    transform-origin: center;
  }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  .cf-turnstile {
    transform: scale(0.95);
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .cf-turnstile {
    transform: scale(1);
  }
}
```

---

## 📊 Сравнение с другими капчами

### Turnstile vs reCAPTCHA

| Критерий | Turnstile | reCAPTCHA |
|----------|-----------|-----------|
| **UX** | ⭐⭐⭐⭐⭐ Незаметно | ⭐⭐⭐ Головоломки |
| **Скорость** | < 1s | 2-5s |
| **Цена** | Бесплатно (1M/мес) | Бесплатно (1M/мес) |
| **Privacy** | ✓ GDPR compliant | ⚠️ Google tracking |
| **Интеграция** | ✓ Простая | ✓ Простая |
| **Точность** | ⭐⭐⭐⭐⭐ Высокая | ⭐⭐⭐⭐ Высокая |

### Turnstile vs hCaptcha

| Критерий | Turnstile | hCaptcha |
|----------|-----------|-----------|
| **UX** | ⭐⭐⭐⭐⭐ Незаметно | ⭐⭐⭐ Головоломки |
| **Скорость** | < 1s | 3-7s |
| **Цена** | Бесплатно (1M/мес) | Бесплатно (1M/мес) |
| **Privacy** | ✓ GDPR compliant | ✓ Privacy-focused |
| **Интеграция** | ✓ Простая | ✓ Простая |
| **Точность** | ⭐⭐⭐⭐⭐ Высокая | ⭐⭐⭐⭐ Высокая |

**Вывод**: Turnstile предлагает лучший UX при сохранении высокой точности.

---

## 🎯 Best Practices

### ✅ DO (Рекомендуется)

1. **Используйте dark theme** для соответствия дизайну
2. **Размещайте перед кнопкой submit** для видимости
3. **Показывайте hint текст** если капча не пройдена
4. **Валидируйте на сервере** всегда
5. **Логируйте ошибки** для мониторинга

### ❌ DON'T (Не рекомендуется)

1. **Не скрывайте виджет** (display: none)
2. **Не пропускайте серверную валидацию**
3. **Не используйте один токен дважды**
4. **Не показывайте капчу после submit** (слишком поздно)
5. **Не игнорируйте ошибки** (логируйте всё)

---

## 📱 Примеры кода

### Базовая интеграция (уже реализовано)

```tsx
import { Turnstile } from "@/components/turnstile";

<Turnstile
  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
  onVerify={(token) => setCaptchaToken(token)}
  onExpire={() => setCaptchaToken(null)}
  onError={() => setCaptchaToken(null)}
  className="rounded-xl overflow-hidden"
/>
```

### С кастомным дизайном

```tsx
<div className="turnstile-wrapper">
  <Turnstile
    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
    onVerify={(token) => {
      setCaptchaToken(token);
      setShowHint(false);
    }}
    onExpire={() => {
      setCaptchaToken(null);
      setShowHint(true);
    }}
    className="custom-turnstile"
  />
  {showHint && (
    <p className="text-xs text-slate-500 mt-2">
      Complete the verification to continue
    </p>
  )}
</div>
```

### С loading state

```tsx
const [isVerifying, setIsVerifying] = useState(true);

<Turnstile
  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
  onVerify={(token) => {
    setCaptchaToken(token);
    setIsVerifying(false);
  }}
/>

{isVerifying && (
  <p className="text-xs text-slate-400">
    Verifying you're human...
  </p>
)}
```

---

## 🎉 Заключение

Cloudflare Turnstile предоставляет:
- ✅ Лучший UX среди всех капч
- ✅ Высокую точность защиты
- ✅ Простую интеграцию
- ✅ Бесплатное использование
- ✅ GDPR compliance

**Результат**: Защищённая регистрация без ущерба для пользовательского опыта! 🛡️

---

**Последнее обновление**: 2026-05-19
