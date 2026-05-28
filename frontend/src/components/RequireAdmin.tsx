/**
 * RequireAdmin — компонент-обёртка, которая показывает дочерний контент
 * только если подключённый кошелёк — это owner контракта.
 *
 * Используется так:
 *   <RequireAdmin>
 *     <АдминскаяСтраница/>
 *   </RequireAdmin>
 *
 * Если пользователь не админ — показывается заглушка с объяснением.
 *
 * Это лишь UX-защита: реальная защита в смарт-контракте (onlyOwner).
 * Даже если кто-то обманет фронт и попадёт на админ-страницу,
 * транзакция со стороннего адреса всё равно будет отвергнута контрактом.
 */

import type { ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { Alert } from './ui/Alert'
import { Spinner } from './ui/Spinner'
import { shortAddress } from '@/lib/utils'

interface RequireAdminProps {
  children: ReactNode
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const { isConnected } = useAccount()
  const { isAdmin, isLoading, ownerAddress } = useIsAdmin()

  // Пока подгружается адрес owner — спиннер
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <Spinner /> <span className="ml-2">Проверка прав…</span>
      </div>
    )
  }

  // Кошелёк не подключён вовсе
  if (!isConnected) {
    return (
      <Alert variant="warning" title="Подключите кошелёк">
        Для доступа к админ-панели нужно подключить кошелёк владельца контракта.
        Используйте кнопку «Connect Wallet» в правом верхнем углу.
      </Alert>
    )
  }

  // Подключён, но не админ
  if (!isAdmin) {
    return (
      <Alert variant="error" title="Доступ запрещён">
        Ваш адрес не является владельцем контракта.
        Админ-панель доступна только аккаунту&nbsp;
        <code className="font-mono">{shortAddress(ownerAddress)}</code>.
      </Alert>
    )
  }

  // Всё в порядке — показываем содержимое
  return <>{children}</>
}
