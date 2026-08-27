# Telegram AI Services Mini App

Полноценное Telegram Mini App для доступа к 13 ИИ-сервисам с системой токенов, платежами и реферальной программой.

## 🚀 Технологии

### Frontend
- **React 18** + **TypeScript**
- **Vite** - сборщик
- **Tailwind CSS** - стили (темная тема)
- **@telegram-apps/sdk** - Telegram WebApp SDK
- **React Router** - роутинг
- **Zustand** - управление состоянием
- **Framer Motion** - анимации
- **Lucide React** - иконки
- **i18next** - интернационализация

### Backend
- **Node.js** + **Express**
- **SQLite** (better-sqlite3) - база данных
- **JWT** - авторизация
- **Axios** - HTTP клиент

## 📁 Структура проекта

```
telegram-ai-mini-app/
├── client/                 # React приложение
│   ├── src/
│   │   ├── components/    # UI компоненты
│   │   ├── pages/         # Страницы приложения
│   │   ├── store/         # Zustand сторы
│   │   ├── lib/           # Утилиты (i18n)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── server/                 # Express API
│   ├── src/
│   │   ├── routes/        # API роуты
│   │   ├── middleware/    # Middleware (auth)
│   │   ├── database.js    # SQLite конфигурация
│   │   └── index.js       # Точка входа
│   ├── package.json
│   └── .env.example
├── .gitignore
├── package.json            # Root package.json (workspaces)
└── README.md
```

## 🛠️ Установка и запуск

### 1. Клонирование и установка зависимостей

```bash
# Установка root зависимостей
npm install

# Установка клиентских зависимостей
cd client && npm install

# Установка серверных зависимостей
cd ../server && npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `server/.env` и заполните реальные значения:

```bash
cd server
cp .env.example .env
```

Обязательные переменные в `server/.env`:

```env
PORT=3001
NODE_ENV=development

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_SECRET=your_webhook_secret

# AI API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
QWEN_API_KEY=your_qwen_key
GEMINI_API_KEY=your_gemini_key
ELEVENLABS_API_KEY=your_elevenlabs_key
SUNO_API_KEY=your_suno_key
RUNWAY_API_KEY=your_runway_key
KLING_API_KEY=your_kling_key
STABILITY_API_KEY=your_stability_key

# Payment
YOOKASSA_SHOP_ID=your_yookassa_shop_id
YOOKASSA_SECRET_KEY=your_yookassa_secret_key
YOOKASSA_TEST_MODE=true
WALLET_PAY_KEY=your_wallet_pay_key

# JWT
JWT_SECRET=your_jwt_secret_key

# Database
DATABASE_PATH=./database.db
```

### 3. Запуск в режиме разработки

```bash
# Запуск и клиента и сервера одновременно
npm run dev
```

Это запустит:
- Frontend на `http://localhost:5173`
- Backend на `http://localhost:3001`

### 4. Сборка для продакшена

```bash
# Сборка клиента
cd client && npm run build

# Запуск сервера
cd ../server && npm start
```

## 🌐 Деплой

### Vercel (Frontend)

1. Создайте аккаунт на [Vercel](https://vercel.com)
2. Подключите репозиторий
3. Настройте:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Добавьте environment variables:
   - `VITE_API_URL`: URL вашего backend (например, `https://your-backend.railway.app`)

### Railway/Render (Backend)

#### Railway:

1. Создайте аккаунт на [Railway](https://railway.app)
2. Создайте новый проект
3. Подключите репозиторий
4. Настройте:
   - **Root Directory**: `server`
   - **Start Command**: `npm start`
5. Добавьте все переменные из `.env.example` в Railway environment variables
6. Деплой будет автоматическим

#### Render:

1. Создайте аккаунт на [Render](https://render.com)
2. Создайте новый Web Service
3. Подключите репозиторий
4. Настройте:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Добавьте environment variables
6. Деплой будет автоматическим

### Telegram Bot Setup

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен и добавьте в `TELEGRAM_BOT_TOKEN`
3. Настройте WebApp:
   - Отправьте `/newapp` BotFather'у
   - Следуйте инструкциям для привязки вашего Mini App URL
4. Установите webhook для платежных уведомлений (опционально)

## 📱 Функционал

### ИИ-Модели (13 штук)

**Текстовые:**
- GPT-4o (5 токенов)
- Claude 3.5 (5 токенов)
- Qwen 2.5 (3 токена)
- Gemini Pro (3 токена)
- Llama 3 (2 токена)
- Mistral (2 токена)

**Генерация картинок:**
- Midjourney (3 токена)
- Stable Diffusion (2 токена)
- Flux (3 токена)

**Озвучка:**
- ElevenLabs (2 токена)

**Видео:**
- Runway (20 токенов)
- Kling (20 токенов)

**Музыка:**
- Suno (5 токенов)

### Страницы приложения

1. **Главная** - каталог всех ИИ-сервисов с фильтрацией по категориям
2. **Чат** - интерфейс диалога с текстовыми ИИ-моделями
3. **Картинки** - генерация изображений с выбором стиля
4. **Аудио** - озвучка текста с выбором голоса
5. **Видео** - генерация видео по описанию
6. **Музыка** - генерация музыки с выбором жанра
7. **Кошелек** - баланс токенов и история транзакций
8. **Пополнение** - 3 способа оплаты (СБП, Telegram Stars, Крипто)
9. **Рефералы** - приглашательная ссылка и статистика
10. **Профиль** - настройки и информация аккаунта

### Система токенов

- **1 токен = 1 запрос** (упрощенная модель)
- Стоимость зависит от ИИ-модели
- Пакеты токенов:
  - Starter: 100 токенов - 99₽
  - Pro: 500 токенов - 399₽
  - Premium: 2000 токенов - 1299₽

### Способы оплаты

1. **СБП** - через YooKassa API
2. **Telegram Stars** - через Bot API
3. **Криптовалюта** - USDT/TON с ручной проверкой

### Реферальная система

- Уникальная ссылка для каждого пользователя
- **+10%** от трат приглашенных в виде токенов
- Бонус 5 токенов для приглашенного
- Статистика и история рефералов в профиле

## 🔐 Безопасность

- Все API ключи хранятся на сервере (никогда в клиенте)
- JWT токены для авторизации
- Валидация Telegram initData
- CORS защита
- SQL инъекции предотвращены (prepared statements)

## 🌍 Интернационализация

Поддержка двух языков:
- Русский (по умолчанию)
- English

Переключение языка в настройках профиля.

## 📝 API Эндпоинты

### Auth
- `POST /api/auth/verify` - верификация Telegram initData

### AI Services
- `POST /api/chat` - текстовый чат
- `POST /api/image` - генерация картинок
- `POST /api/audio` - озвучка текста
- `POST /api/video` - генерация видео
- `POST /api/music` - генерация музыки

### User
- `GET /api/user/balance` - получение баланса
- `GET /api/user/transactions` - история транзакций
- `GET /api/user/referrals` - реферальная информация
- `GET /api/user/profile` - профиль пользователя
- `PUT /api/user/profile` - обновление профиля

### Payment
- `GET /api/payment/packages` - список пакетов
- `POST /api/payment/sbp` - оплата через СБП
- `POST /api/payment/stars` - оплата Telegram Stars
- `POST /api/payment/crypto` - оплата криптой
- `POST /api/payment/webhook/yookassa` - вебхук YooKassa
- `POST /api/payment/webhook/telegram` - вебхук Telegram

## 🐛 Troubleshooting

### Ошибки при установке
```bash
# Очистите кэш npm
npm cache clean --force

# Удалите node_modules и переустановите
rm -rf node_modules client/node_modules server/node_modules
npm install
cd client && npm install
cd ../server && npm install
```

### Проблемы с базой данных
```bash
# Удалите файл базы данных
cd server
rm database.db
# База данных создастся автоматически при следующем запуске
```

### Ошибки TypeScript
```bash
# Убедитесь, что все зависимости установлены
cd client && npm install
```

## 📄 Лицензия

MIT License

## 🤝 Поддержка

Для вопросов и предложений создайте issue в репозитории.
