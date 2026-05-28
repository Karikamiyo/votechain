# ─── Dockerfile для фронта ──────────────────────────────────────────────────
# Multi-stage build: сначала собираем статику в одном контейнере,
# потом копируем готовый dist/ в маленький nginx.
# Финальный образ ~50 МБ вместо ~1 ГБ (без node_modules).

# ─── Этап 1: сборка ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Зависимости — отдельным слоем.
COPY package.json package-lock.json* ./
RUN npm install --silent --no-audit --no-fund

# Копируем остальное и собираем production-bundle.
COPY . .

# В Docker фронт обращается к API через тот же origin (nginx проксирует),
# поэтому VITE_API_PROXY_TARGET не нужен. А вот RPC_URL нужен — фронт
# обращается напрямую через браузер по URL, доступному ИЗВНЕ docker-сети.
ARG VITE_RPC_URL=http://localhost:8545
ARG VITE_CHAIN_ID=31337
ARG VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
ARG VITE_WALLETCONNECT_PROJECT_ID=

ENV VITE_RPC_URL=$VITE_RPC_URL \
    VITE_CHAIN_ID=$VITE_CHAIN_ID \
    VITE_CONTRACT_ADDRESS=$VITE_CONTRACT_ADDRESS \
    VITE_WALLETCONNECT_PROJECT_ID=$VITE_WALLETCONNECT_PROJECT_ID

RUN npm run build

# ─── Этап 2: раздача через nginx ────────────────────────────────────────────
FROM nginx:1.27-alpine

# Берём собранную статику из первого этапа.
COPY --from=builder /app/dist /usr/share/nginx/html

# Наш собственный конфиг nginx с прокси на бэк.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
