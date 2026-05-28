/**
 * Alert — блок сообщения, обычно для ошибок или важных уведомлений.
 *   <Alert variant="error">Что-то пошло не так</Alert>
 *   <Alert variant="success">Голосование создано</Alert>
 */

import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children?: ReactNode
  className?: string
}

const variantStyles = {
  info: {
    bg: 'bg-blue-50 border-blue-200 text-blue-900',
    Icon: Info,
    iconColor: 'text-blue-500',
  },
  success: {
    bg: 'bg-green-50 border-green-200 text-green-900',
    Icon: CheckCircle2,
    iconColor: 'text-green-500',
  },
  warning: {
    bg: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    Icon: AlertTriangle,
    iconColor: 'text-yellow-500',
  },
  error: {
    bg: 'bg-red-50 border-red-200 text-red-900',
    Icon: AlertCircle,
    iconColor: 'text-red-500',
  },
}

export function Alert({
  variant = 'info',
  title,
  children,
  className,
}: AlertProps) {
  const { bg, Icon, iconColor } = variantStyles[variant]
  return (
    <div
      className={cn(
        'border rounded-md p-4 flex items-start gap-3',
        bg,
        className,
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColor)} />
      <div className="flex-1 text-sm">
        {title && <p className="font-medium">{title}</p>}
        {children && <p className={title ? 'mt-1' : ''}>{children}</p>}
      </div>
    </div>
  )
}
