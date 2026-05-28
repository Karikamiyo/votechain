/**
 * Spinner — крутящаяся "лоадер"-иконка.
 * Используется во время запросов к бэку или ожидания транзакции.
 */

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin', className)} />
}
