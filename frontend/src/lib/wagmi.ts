/**
 * wagmi.ts — конфигурация подключения к блокчейну.
 *
 * Здесь мы говорим wagmi:
 *   - С какими сетями работаем (локальный hardhat + опционально Polygon Amoy).
 *   - Какие кошельки разрешаем подключать (MetaMask и др. через RainbowKit).
 *
 * wagmi — это React-обёртка над viem (низкоуровневая библиотека для работы с EVM).
 * RainbowKit — это красивая модалка для подключения кошельков, построенная на wagmi.
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'

// Берём адрес RPC из env. Если не задан — используем дефолт.
const RPC_URL = import.meta.env.VITE_RPC_URL || 'http://127.0.0.1:8545'

// Определяем локальную hardhat-сеть. У неё фиксированный chainId = 31337.
// Это нужно, чтобы MetaMask мог автоматически добавить сеть при подключении.
export const hardhatLocal = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: [RPC_URL] },
  },
  testnet: true,
})

// WalletConnect Project ID — нужен только для подключения мобильных кошельков.
// Если оставлен пустым, RainbowKit просто не покажет вариант WalletConnect.
const walletConnectProjectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo'

// getDefaultConfig — упрощённая обёртка от RainbowKit.
// Сама подключает MetaMask, Coinbase Wallet, Rainbow и др.
export const wagmiConfig = getDefaultConfig({
  appName: 'VoteChain',
  projectId: walletConnectProjectId,
  chains: [hardhatLocal],
  // ssr: false по умолчанию, нам ничего не нужно
})
