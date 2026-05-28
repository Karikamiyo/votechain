/**
 * App.tsx — корневой компонент приложения.
 *
 * Здесь описана структура маршрутов (URL-адресов).
 * react-router-dom v6 использует декларативный синтаксис:
 *
 *   <Routes>
 *     <Route path="/" element={<Layout/>}>
 *       <Route index element={<HomePage/>} />
 *       <Route path="elections/:id" element={<ElectionPage/>} />
 *     </Route>
 *   </Routes>
 *
 * "Вложенные" Route рендерятся внутри родителя (там, где у него <Outlet/>).
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { RequireAdmin } from '@/components/RequireAdmin'
import { HomePage } from '@/pages/HomePage'
import { ElectionPage } from '@/pages/ElectionPage'
import { AdminPage } from '@/pages/AdminPage'
import { CreateElectionPage } from '@/pages/CreateElectionPage'
import { ManageElectionPage } from '@/pages/ManageElectionPage'

function App() {
  return (
    <Routes>
      {/* Все основные страницы — внутри общего Layout (с навбаром) */}
      <Route path="/" element={<Layout />}>
        {/* index — это маршрут "по умолчанию" (когда URL = "/") */}
        <Route index element={<HomePage />} />

        {/* :id — параметр URL, читается через useParams() */}
        <Route path="elections/:id" element={<ElectionPage />} />

        {/* Админские страницы — обёрнуты в RequireAdmin */}
        <Route
          path="admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route
          path="admin/create"
          element={
            <RequireAdmin>
              <CreateElectionPage />
            </RequireAdmin>
          }
        />
        <Route
          path="admin/elections/:id"
          element={
            <RequireAdmin>
              <ManageElectionPage />
            </RequireAdmin>
          }
        />

        {/* Любой другой URL → на главную */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
