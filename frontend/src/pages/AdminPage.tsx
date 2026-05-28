/**
 * AdminPage — главная админ-страница.
 *
 * Показывает:
 *   - Список всех голосований с кнопками "Управлять" и "Закрыть"
 *   - Кнопку "Создать новое голосование"
 */

import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Settings } from 'lucide-react'
import { listElections } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'

export function AdminPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['elections'],
    queryFn: listElections,
  })

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Админ-панель</h1>
          <p className="text-gray-500 mt-1">
            Управление голосованиями (доступно только владельцу контракта)
          </p>
        </div>
        <Link to="/admin/create">
          <Button>
            <Plus className="h-4 w-4" /> Создать голосование
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Spinner /> <span className="ml-2">Загрузка…</span>
        </div>
      )}

      {error && (
        <Alert variant="error" title="Ошибка">
          {error.message}
        </Alert>
      )}

      {data && data.count === 0 && (
        <Alert variant="info" title="Пока нет голосований">
          Создайте первое голосование, нажав кнопку выше.
        </Alert>
      )}

      {data && data.count > 0 && (
        <div className="space-y-3">
          {data.elections.map((e) => (
            <Card key={e.election_id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate">{e.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      ID: {e.election_id} &middot; Голосов: {e.total_votes}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {e.is_open ? (
                      <Badge color="green">Открыто</Badge>
                    ) : (
                      <Badge color="gray">Закрыто</Badge>
                    )}
                    <Link to={`/admin/elections/${e.election_id}`}>
                      <Button variant="secondary" size="sm">
                        <Settings className="h-4 w-4" /> Управлять
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
