/**
 * CreateElectionPage — форма создания нового голосования.
 *
 * Поля:
 *   - Название
 *   - Список кандидатов (динамический, можно добавлять/удалять)
 *
 * Отправляется на POST /api/elections/ — бэк сам подписывает транзакцию
 * приватным ключом owner. Поэтому отдельной подписи через MetaMask тут нет.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { createElection } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { Link } from 'react-router-dom'

export function CreateElectionPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Состояние формы
  const [title, setTitle] = useState('')
  // Минимум 2 кандидата — стартуем с двух пустых
  const [candidates, setCandidates] = useState<string[]>(['', ''])

  // useMutation — для POST/PUT/DELETE запросов.
  // onSuccess — что сделать после успешного запроса.
  const mutation = useMutation({
    mutationFn: () =>
      createElection(
        title.trim(),
        candidates.map((c) => c.trim()).filter(Boolean),
      ),
    onSuccess: (data) => {
      // Перечитываем список голосований
      queryClient.invalidateQueries({ queryKey: ['elections'] })
      // Переходим на страницу созданного голосования
      if (data.election_id !== undefined) {
        navigate(`/admin/elections/${data.election_id}`)
      } else {
        navigate('/admin')
      }
    },
  })

  // Локальная валидация перед отправкой
  const validCandidates = candidates.map((c) => c.trim()).filter(Boolean)
  const hasDuplicates =
    new Set(validCandidates).size !== validCandidates.length
  const isValid =
    title.trim().length > 0 && validCandidates.length >= 2 && !hasDuplicates

  function updateCandidate(index: number, value: string) {
    setCandidates((prev) => prev.map((c, i) => (i === index ? value : c)))
  }

  function addCandidate() {
    setCandidates((prev) => [...prev, ''])
  }

  function removeCandidate(index: number) {
    // Не разрешаем убирать ниже двух
    if (candidates.length <= 2) return
    setCandidates((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || mutation.isPending) return
    mutation.mutate()
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/admin"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Назад в админку
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Новое голосование</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Название */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Название голосования
              </label>
              <Input
                type="text"
                placeholder="Например: Выборы старосты 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={mutation.isPending}
                maxLength={200}
              />
            </div>

            {/* Кандидаты */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Кандидаты (минимум 2)
              </label>
              <div className="space-y-2">
                {candidates.map((cand, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder={`Кандидат ${index + 1}`}
                      value={cand}
                      onChange={(e) => updateCandidate(index, e.target.value)}
                      disabled={mutation.isPending}
                      maxLength={100}
                    />
                    {/* Кнопка удаления — только если кандидатов больше двух */}
                    {candidates.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="md"
                        onClick={() => removeCandidate(index)}
                        disabled={mutation.isPending}
                        aria-label="Удалить кандидата"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={addCandidate}
                disabled={mutation.isPending}
              >
                <Plus className="h-4 w-4" /> Добавить кандидата
              </Button>
              {/* Подсказки про валидацию */}
              {hasDuplicates && (
                <p className="text-sm text-red-600 mt-2">
                  Имена кандидатов не должны повторяться
                </p>
              )}
            </div>

            {/* Ошибки */}
            {mutation.error && (
              <Alert variant="error" title="Не удалось создать">
                {(mutation.error as Error).message}
              </Alert>
            )}

            {/* Кнопка отправки */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link to="/admin">
                <Button type="button" variant="ghost">
                  Отмена
                </Button>
              </Link>
              <Button type="submit" disabled={!isValid || mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Spinner className="h-4 w-4" /> Создание…
                  </>
                ) : (
                  'Создать'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
