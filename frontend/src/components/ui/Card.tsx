/**
 * Card — белая карточка с тенью и закруглением.
 * Используется для группировки контента (список голосования, форма и т.д.).
 *
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Заголовок</CardTitle>
 *     <CardDescription>Подзаголовок</CardDescription>
 *   </CardHeader>
 *   <CardContent>Контент</CardContent>
 * </Card>
 */

import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...rest }: CardProps) {
  return (
    <div className={cn('p-6 pb-4', className)} {...rest}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...rest }: CardProps) {
  return (
    <h3
      className={cn('text-xl font-semibold text-gray-900', className)}
      {...(rest as HTMLAttributes<HTMLHeadingElement>)}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...rest }: CardProps) {
  return (
    <p
      className={cn('text-sm text-gray-500 mt-1', className)}
      {...(rest as HTMLAttributes<HTMLParagraphElement>)}
    >
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...rest }: CardProps) {
  return (
    <div className={cn('p-6 pt-0', className)} {...rest}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'p-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-2',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
