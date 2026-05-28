/**
 * HomePage — главная страница со списком всех голосований.
 *
 * Доступна всем (даже без подключения кошелька) — все данные публичные,
 * читаются через бэк, который читает их из блокчейна.
 */

import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Vote, ArrowRight, Plus } from 'lucide-react'
import { listElections } from '@/lib/api'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'

export function HomePage() {
  const { isAdmin } = useIsAdmin()

  // Запрос списка голосований через TanStack Query.
  // queryKey: ['elections'] — уникальный идентификатор кэша.
  // Когда мы создадим новое голосование, мы инвалидируем этот ключ,
  // и список перечитается автоматически.
  const { data, isLoading, error } = useQuery({
    queryKey: ['elections'],
    queryFn: listElections,
  })

  return (
    <div>
      {/* Шапка страницы */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Голосования</h1>
          <p className="text-gray-500 mt-1">
            Все голосования, зарегистрированные в блокчейне
          </p>
        </div>
        {/* Кнопка "Создать" показывается только админу */}
        {isAdmin && (
          <Link to="/admin/create">
            <Button>
              <Plus className="h-4 w-4" /> Создать голосование
            </Button>
          </Link>
        )}
      </div>

      {/* Состояние "загрузка" */}
      {isLoading && (
        <div className="flex items-center justify-center py-12 text-gray-500">
          <Spinner /> <span className="ml-2">Загрузка голосований…</span>
        </div>
      )}

      {/* Состояние "ошибка" */}
      {error && (
        <Alert variant="error" title="Не удалось загрузить голосования">
          {error.message}
        </Alert>
      )}

      {/* Состояние "пусто" */}
      {data && data.count === 0 && (
        <Alert variant="info" title="Пока нет голосований">
          Когда администратор создаст первое голосование, оно появится здесь.
        </Alert>
      )}

      {/* Список голосований — сетка карточек */}
      {data && data.count > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.elections.map((election) => (
            <ElectionCard key={election.election_id} election={election} />
          ))}
        </div>
      )}
    </div>
  )
}

// Карточка одного голосования
function ElectionCard({
  election,
}: {
  election: { election_id: number; title: string; is_open: boolean; total_votes: number }
}) {
  return (
    <Link to={`/elections/${election.election_id}`} className="block group">
      <Card className="h-full hover:shadow-md hover:border-brand-300 transition-all">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 group-hover:text-brand-700">
              {election.title}
            </CardTitle>
            {election.is_open ? (
              <Badge color="green">Открыто</Badge>
            ) : (
              <Badge color="gray">Закрыто</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Vote className="h-4 w-4" />
              <span>{election.total_votes} голос(ов)</span>
            </div>
            <div className="flex items-center gap-1 text-brand-600 group-hover:translate-x-1 transition-transform">
              <span>Подробнее</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400 font-mono">
            ID: {election.election_id}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
