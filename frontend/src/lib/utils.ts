/**
 * cn — утилита для объединения Tailwind-классов.
 * Использует clsx (условные классы) и tailwind-merge (убирает конфликты).
 *
 * Пример:
 *   cn('px-4 py-2', isError && 'bg-red-500', 'px-2')
 *   // → 'py-2 bg-red-500 px-2'  (px-4 → px-2, последний выигрывает)
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Форматирует Ethereum-адрес: 0xf39F...92266
 */
export function shortAddress(address?: string): string {
  if (!address) return ''
  if (address.length < 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Сравнение адресов без учёта регистра.
 * Адреса в Ethereum хранятся в hex и могут быть в разных регистрах
 * (lowercase, checksum). Сравнивать надо через toLowerCase.
 */
export function sameAddress(a?: string, b?: string): boolean {
  if (!a || !b) return false
  return a.toLowerCase() === b.toLowerCase()
}
