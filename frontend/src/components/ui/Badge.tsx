/**
 * Badge — маленькая цветная "плашка" для статусов.
 *   <Badge color="green">Открыто</Badge>
 *   <Badge color="red">Закрыто</Badge>
 */

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  color?: 'green' | 'red' | 'gray' | 'blue' | 'yellow'
  children: ReactNode
  className?: string
}

const colorStyles: Record<NonNullable<BadgeProps['color']>, string> = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
}

export function Badge({ color = 'gray', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        colorStyles[color],
        className,
      )}
    >
      {children}
    </span>
  )
}
