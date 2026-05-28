/**
 * Button — универсальная кнопка.
 *
 * Принимает все стандартные атрибуты <button> + наши:
 *   - variant: вид кнопки ('primary' | 'secondary' | 'danger' | 'ghost')
 *   - size:   размер ('sm' | 'md' | 'lg')
 *
 * Пример:
 *   <Button variant="primary" onClick={...}>Создать</Button>
 *   <Button variant="danger" size="sm">Удалить</Button>
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

// Стили для каждого варианта
const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-900',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      // cn объединяет классы. disabled-стили добавляются автоматически.
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
