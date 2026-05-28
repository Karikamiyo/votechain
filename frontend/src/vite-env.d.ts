/// <reference types="vite/client" />

/**
 * Типы для переменных окружения, доступных через import.meta.env.
 * TypeScript будет подсказывать имена и проверять опечатки.
 */
interface ImportMetaEnv {
  readonly VITE_API_PROXY_TARGET?: string
  readonly VITE_RPC_URL?: string
  readonly VITE_CHAIN_ID?: string
  readonly VITE_CONTRACT_ADDRESS?: string
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
