# VoteChain — Frontend

Фронтенд для системы голосования на блокчейне.

## Стек

- **React 18 + TypeScript** — UI
- **Vite** — сборщик и dev-сервер
- **Tailwind CSS** — стили
- **wagmi + viem** — взаимодействие с EVM-блокчейном
- **RainbowKit** — подключение кошельков (MetaMask и др.)
- **TanStack Query** — кэширование данных API
- **axios** — HTTP-клиент
- **react-router-dom** — маршрутизация

## Архитектура взаимодействия

```
       ┌────────────┐                ┌────────────┐
       │  Frontend  │ ── REST API ── │  Django    │ ── web3.py ──┐
       │  (React)   │                │  Backend   │              │
       └─────┬──────┘                └────────────┘              │
             │                                                   │
             │ vote() через MetaMask                              ▼
             └──────────────────────────────────────────► Hardhat node
                                                          (VoteChain
                                                           contract)
```

- **Все ЧТЕНИЯ** (списки, детали, результаты, статусы) идут через Django-бэк.
- **Все АДМИНСКИЕ ЗАПИСИ** (создание, whitelist, закрытие) идут через бэк
  — он подписывает их приватным ключом owner.
- **vote()** идёт НАПРЯМУЮ из MetaMask в контракт.
  Это и есть смысл блокчейн-голосования: голос подписывает сам избиратель,
  его никто не может подделать.

## Структура

```
src/
├── components/
│   ├── ui/                  # Базовые компоненты (Button, Card, Input, ...)
│   ├── Layout.tsx           # Общая обёртка (navbar + main + footer)
│   ├── Navbar.tsx           # Верхняя панель навигации
│   └── RequireAdmin.tsx     # Защита админских роутов
├── hooks/
│   └── useIsAdmin.ts        # Хук "подключён ли owner"
├── lib/
│   ├── abi.ts               # ABI контракта + адрес
│   ├── api.ts               # Клиент Django-бэка
│   ├── utils.ts             # Утилиты (cn, shortAddress)
│   └── wagmi.ts             # Конфиг wagmi (сети, кошельки)
├── pages/
│   ├── HomePage.tsx              # Список голосований (публично)
│   ├── ElectionPage.tsx          # Детали + голосование через MetaMask
│   ├── AdminPage.tsx             # Список голосований (админка)
│   ├── CreateElectionPage.tsx    # Создание голосования
│   └── ManageElectionPage.tsx    # Whitelist + закрытие
├── App.tsx                  # Маршруты
├── main.tsx                 # Точка входа, провайдеры
└── index.css                # Tailwind
```

## Быстрый старт

### Предварительные требования

Перед запуском фронта должны работать:
1. `npx hardhat node` (порт 8545)
2. Деплой контракта: `npx hardhat run scripts/deploy.js --network localhost`
3. Django-сервер: `python manage.py runserver` (порт 8000)

### Запуск

```bash
# 1. Установить зависимости (потребуется Node.js 18+)
npm install

# 2. Скопировать .env
cp .env.example .env
# По умолчанию значения подходят для локального hardhat — менять не нужно.

# 3. Запустить dev-сервер
npm run dev
```

Фронт будет доступен на `http://localhost:5173`.

### MetaMask: настройка

1. Установи MetaMask: https://metamask.io
2. Добавь сеть Hardhat:
   - **Имя сети:** `Hardhat Local`
   - **RPC URL:** `http://127.0.0.1:8545`
   - **ChainId:** `31337`
   - **Валюта:** `ETH`
3. Импортируй один из тестовых ключей (см. вывод `npx hardhat node`).
   Owner (для админки): `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

## Сборка для прода

```bash
npm run build
# Готовая статика — в папке dist/
```

В Docker мы её отдадим через nginx (см. следующий этап).
