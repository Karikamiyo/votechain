/**
 * Layout — общий каркас страниц.
 *
 * Содержит:
 *   - Navbar (верхняя панель) — всегда показывается
 *   - <Outlet/> — место, куда react-router вставляет текущую страницу
 *   - Footer
 */

import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* main растягивается на всю высоту, footer прижат к низу */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Outlet — это "слот", куда роутер подставит нужную страницу */}
          <Outlet />
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          VoteChain — учебный проект &middot; голосование на блокчейне
        </div>
      </footer>
    </div>
  )
}
