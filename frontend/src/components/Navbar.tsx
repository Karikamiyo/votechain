/**
 * Navbar — верхняя панель сайта.
 * Содержит:
 *   - Логотип со ссылкой на главную
 *   - Меню навигации (Главная / Админка — только если подключён owner)
 *   - Кнопка подключения кошелька (RainbowKit)
 */

import { Link, NavLink } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Vote } from 'lucide-react'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { isAdmin } = useIsAdmin()

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Логотип */}
        <Link to="/" className="flex items-center gap-2 text-brand-600 font-bold text-lg">
          <Vote className="h-6 w-6" />
          <span>VoteChain</span>
        </Link>

        {/* Меню навигации */}
        <nav className="hidden md:flex items-center gap-1">
          <NavItem to="/">Голосования</NavItem>
          {/*
            NavItem для админки появляется только когда useIsAdmin() === true.
            Это "клиентская защита" — она не заменяет проверку прав
            (которая на самом деле в смарт-контракте: только owner может
            создать/закрыть голосование). Но UX без неё хуже.
          */}
          {isAdmin && <NavItem to="/admin">Админка</NavItem>}
        </nav>

        {/* Кнопка кошелька */}
        <ConnectButton showBalance={false} accountStatus="address" />
      </div>
    </header>
  )
}

// Внутренний компонент: пункт меню с подсветкой активной ссылки
function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      // NavLink сам передаёт isActive в className-функцию
      className={({ isActive }) =>
        cn(
          'px-3 py-2 rounded-md text-sm font-medium transition-colors',
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-gray-700 hover:bg-gray-100',
        )
      }
    >
      {children}
    </NavLink>
  )
}
