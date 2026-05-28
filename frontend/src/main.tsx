/**
 * main.tsx — это самая первая строчка кода, которая выполняется в браузере.
 * Здесь мы:
 *   1. Импортируем стили (Tailwind + RainbowKit)
 *   2. Берём <div id="root"> из index.html
 *   3. Монтируем туда наше React-приложение
 *   4. Оборачиваем приложение в провайдеры (wagmi, ReactQuery, RainbowKit, Router)
 *
 * Провайдеры — это компоненты, которые "раздают" что-то всем дочерним компонентам.
 * Например, WagmiProvider раздаёт информацию о подключённом кошельке.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'

// Стили RainbowKit обязательны, иначе модалка кошелька будет без оформления
import '@rainbow-me/rainbowkit/styles.css'
// Наши собственные стили (Tailwind)
import './index.css'

import App from './App'
import { wagmiConfig } from './lib/wagmi'

// QueryClient — это "движок" TanStack Query.
// Он кэширует ответы API, чтобы не делать одинаковых запросов.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Не перезапрашивать данные при возврате на вкладку (по умолчанию true).
      // Для блокчейна это разумнее: данные не меняются мгновенно.
      refetchOnWindowFocus: false,
      // Если запрос упал — повторить 1 раз
      retry: 1,
    },
  },
})

// createRoot — современный API React для монтирования в DOM.
const rootElement = document.getElementById('root')!
createRoot(rootElement).render(
  <StrictMode>
    {/*
      Порядок провайдеров важен:
      - WagmiProvider должен быть снаружи (он управляет состоянием кошелька)
      - QueryClientProvider — wagmi на него полагается
      - RainbowKitProvider — UI для подключения кошелька
      - BrowserRouter — маршрутизация
    */}
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({ accentColor: '#2563eb' })}
          locale="ru-RU"
        >
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
