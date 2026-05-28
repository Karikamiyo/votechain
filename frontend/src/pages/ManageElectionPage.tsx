/**
 * ManageElectionPage — управление одним голосованием (для админа).
 *
 * Возможности:
 *   - Просмотр данных голосования + результатов
 *   - Добавление адреса в whitelist
 *   - Закрытие голосования
 */

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, UserPlus, Lock } from 'lucide-react'
import { isAddress } from 'viem'
import {
  getElection,
  addToWhitelist,
  closeElection,
} from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'

export function ManageElectionPage() {
  const { id } = useParams<{ id: string }>()
  const electionId = Number(id)

  const electionQuery = useQuery({
    queryKey: ['elections', electionId],
    queryFn: () => getElection(electionId),
    enabled: !isNaN(electionId),
  })

  if (isNaN(electionId)) {
    return (
      <Alert variant="error" title="Некорректный URL">
        Не удалось определить ID голосования.
      </Alert>
    )
  }

  if (electionQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <Spinner /> <span className="ml-2">Загрузка…</span>
      </div>
    )
  }

  if (electionQuery.error) {
    return (
      <Alert variant="error" title="Не найдено">
        {electionQuery.error.message}
      </Alert>
    )
  }

  const election = electionQuery.data!

  return (
    <div className="max-w-3xl">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Назад в админку
      </Link>

      {/* Шапка */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">{election.title}</h1>
          {election.is_open ? (
            <Badge color="green">Открыто</Badge>
          ) : (
            <Badge color="gray">Закрыто</Badge>
          )}
        </div>
        <p className="text-sm text-gray-500">
          ID: {election.election_id} &middot; Всего голосов: {election.total_votes}
        </p>
      </div>

      <div className="space-y-4">
        {/* Whitelist */}
        {election.is_open && <WhitelistForm electionId={electionId} />}

        {/* Закрытие */}
        {election.is_open && <CloseElectionCard electionId={electionId} />}

        {/* Ссылка на публичную страницу */}
        <Card>
          <CardContent className="py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Посмотреть голосование со стороны избирателя
            </p>
            <Link to={`/elections/${electionId}`}>
              <Button variant="secondary" size="sm">
                Открыть публичную страницу
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Форма добавления в whitelist
// ─────────────────────────────────────────────────────────────────────────────
function WhitelistForm({ electionId }: { electionId: number }) {
  const [addr, setAddr] = useState('')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => addToWhitelist(electionId, addr.trim()),
    onSuccess: (data) => {
      setSuccessMsg(data.message)
      setAddr('')
      // Можем сразу инвалидировать статусы избирателей этого голосования
      queryClient.invalidateQueries({
        queryKey: ['elections', electionId, 'voter'],
      })
    },
  })

  // isAddress из viem проверяет формат Ethereum-адреса.
  // Это нужно, чтобы кнопка была неактивна, пока пользователь не ввёл валидный адрес.
  const isValid = isAddress(addr.trim())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || mutation.isPending) return
    setSuccessMsg(null)
    mutation.mutate()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-brand-600" />
          Добавить избирателя в whitelist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm text-gray-600">
            Только адреса из этого списка смогут проголосовать.
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              className="font-mono"
              disabled={mutation.isPending}
            />
            <Button type="submit" disabled={!isValid || mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Spinner className="h-4 w-4" /> Добавление…
                </>
              ) : (
                'Добавить'
              )}
            </Button>
          </div>
          {/* Подсказки про валидацию */}
          {addr.trim().length > 0 && !isValid && (
            <p className="text-sm text-red-600">
              Некорректный Ethereum-адрес (должен начинаться с 0x и быть длиной 42 символа)
            </p>
          )}
          {mutation.error && (
            <Alert variant="error" title="Не удалось добавить">
              {(mutation.error as Error).message}
            </Alert>
          )}
          {successMsg && (
            <Alert variant="success" title="Адрес добавлен">
              {successMsg}
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Карточка закрытия голосования
// ─────────────────────────────────────────────────────────────────────────────
function CloseElectionCard({ electionId }: { electionId: number }) {
  const [confirming, setConfirming] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => closeElection(electionId),
    onSuccess: () => {
      // Обновляем данные конкретного голосования и общий список
      queryClient.invalidateQueries({ queryKey: ['elections', electionId] })
      queryClient.invalidateQueries({ queryKey: ['elections'] })
      setConfirming(false)
    },
  })

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <Lock className="h-5 w-5" />
          Закрыть голосование
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          После закрытия никто не сможет проголосовать. Это действие необратимо
          (заложено в смарт-контракте).
        </p>

        {!confirming ? (
          <Button variant="danger" onClick={() => setConfirming(true)}>
            Закрыть голосование
          </Button>
        ) : (
          <div className="space-y-3">
            <Alert variant="warning" title="Вы уверены?">
              Это действие нельзя отменить.
            </Alert>
            <div className="flex gap-2">
              <Button
                variant="danger"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Spinner className="h-4 w-4" /> Закрытие…
                  </>
                ) : (
                  'Да, закрыть'
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setConfirming(false)}
                disabled={mutation.isPending}
              >
                Отмена
              </Button>
            </div>
            {mutation.error && (
              <Alert variant="error" title="Ошибка">
                {(mutation.error as Error).message}
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
