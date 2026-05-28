/**
 * Input — простое текстовое поле с базовыми стилями.
 * Принимает все стандартные атрибуты <input>.
 */

import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...rest }: InputProps) {
  return (
    <input
      className={cn(
        'w-full px-3 py-2 rounded-md border border-gray-300',
        'text-gray-900 placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
        'disabled:bg-gray-100 disabled:cursor-not-allowed',
        className,
      )}
      {...rest}
    />
  )
}
