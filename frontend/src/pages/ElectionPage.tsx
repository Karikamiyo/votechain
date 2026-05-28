/**
 * ElectionPage — детали голосования.
 *
 * Показывает:
 *   - Заголовок, статус, общее число голосов
 *   - Список кандидатов
 *   - Текущие результаты (с прогресс-барами)
 *   - Если пользователь подключён и в whitelist — форму голосования
 *
 * ВАЖНО: vote() вызывается НАПРЯМУЮ из MetaMask, не через бэк.
 * Это и есть смысл блокчейн-голосования — голос подписывает сам избиратель.
 */

import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ArrowLeft, Vote, CheckCircle2 } from 'lucide-react'
import {
  getElection,
  getCandidates,
  getResults,
  getVoterStatus,
} from '@/lib/api'
import { VOTE_CHAIN_ABI, CONTRACT_ADDRESS } from '@/lib/abi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { shortAddress } from '@/lib/utils'

export function ElectionPage() {
  // useParams читает параметр :id из URL
  const { id } = useParams<{ id: string }>()
  const electionId = Number(id)

  // 1. Базовая инфа о голосовании
  const electionQuery = useQuery({
    queryKey: ['elections', electionId],
    queryFn: () => getElection(electionId),
    enabled: !isNaN(electionId),
  })

  // 2. Список кандидатов
  const candidatesQuery = useQuery({
    queryKey: ['elections', electionId, 'candidates'],
    queryFn: () => getCandidates(electionId),
    enabled: !isNaN(electionId),
  })

  // 3. Результаты (обновляем после голосования)
  const resultsQuery = useQuery({
    queryKey: ['elections', electionId, 'results'],
    queryFn: () => getResults(electionId),
    enabled: !isNaN(electionId),
  })

  if (isNaN(electionId)) {
    return (
      <Alert variant="error" title="Некорректный URL">
        Не удалось определить ID голосования.
      </Alert>
    )
  }

  const isLoading =
    electionQuery.isLoading || candidatesQuery.isLoading || resultsQuery.isLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <Spinner /> <span className="ml-2">Загрузка…</span>
      </div>
    )
  }

  if (electionQuery.error) {
    return (
      <Alert variant="error" title="Голосование не найдено">
        {electionQuery.error.message}
      </Alert>
    )
  }

  const election = electionQuery.data!
  const candidates = candidatesQuery.data?.candidates ?? []
  const results = resultsQuery.data?.results ?? []

  return (
    <div>
      {/* Ссылка назад */}
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Все голосования
      </Link>

      {/* Заголовок */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{election.title}</h1>
            {election.is_open ? (
              <Badge color="green">Открыто</Badge>
            ) : (
              <Badge color="gray">Закрыто</Badge>
            )}
          </div>
          <p className="text-gray-500">
            ID: {election.election_id} &middot; Всего голосов: {election.total_votes}
          </p>
        </div>
      </div>

      {/* Форма голосования (только если открыто) */}
      {election.is_open && (
        <VoteSection
          electionId={electionId}
          candidates={candidates}
        />
      )}

      {/* Результаты */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Результаты</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-gray-500">Пока нет данных</p>
          ) : (
            <ResultsList results={results} totalVotes={election.total_votes} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Список результатов с прогресс-барами
// ─────────────────────────────────────────────────────────────────────────────
function ResultsList({
  results,
  totalVotes,
}: {
  results: { candidate: string; votes: number }[]
  totalVotes: number
}) {
  // Сортируем по убыванию голосов
  const sorted = [...results].sort((a, b) => b.votes - a.votes)
  const maxVotes = Math.max(1, ...sorted.map((r) => r.votes))

  return (
    <div className="space-y-3">
      {sorted.map((row) => {
        const percent = totalVotes === 0 ? 0 : (row.votes / totalVotes) * 100
        const barWidth = (row.votes / maxVotes) * 100

        return (
          <div key={row.candidate}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-900">{row.candidate}</span>
              <span className="text-gray-600">
                {row.votes} ({percent.toFixed(1)}%)
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all duration-500"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Секция голосования — большой блок с проверкой статуса и формой
// ─────────────────────────────────────────────────────────────────────────────
function VoteSection({
  electionId,
  candidates,
}: {
  electionId: number
  candidates: string[]
}) {
  const { address, isConnected } = useAccount()

  // Статус избирателя (whitelisted? has_voted?)
  // enabled: !!address — запрос делается, только когда кошелёк подключён.
  const statusQuery = useQuery({
    queryKey: ['elections', electionId, 'voter', address],
    queryFn: () => getVoterStatus(electionId, address!),
    enabled: !!address,
  })

  if (!isConnected) {
    return (
      <Alert variant="info" title="Подключите кошелёк">
        Для голосования нужно подключить MetaMask (кнопка в правом верхнем углу).
      </Alert>
    )
  }

  if (statusQuery.isLoading) {
    return (
      <Card>
        <CardContent className="py-6 flex items-center gap-2 text-gray-500">
          <Spinner /> Проверка статуса…
        </CardContent>
      </Card>
    )
  }

  if (statusQuery.error) {
    return (
      <Alert variant="error">
        Не удалось проверить статус: {statusQuery.error.message}
      </Alert>
    )
  }

  const status = statusQuery.data!

  if (!status.whitelisted) {
    return (
      <Alert variant="warning" title="Адрес не в белом списке">
        Ваш адрес {shortAddress(address)} не добавлен в список разрешённых
        для этого голосования. Обратитесь к администратору.
      </Alert>
    )
  }

  if (status.has_voted) {
    return (
      <Alert variant="success" title="Голос уже учтён">
        Вы уже проголосовали в этом голосовании.
        Изменить голос нельзя — это базовое правило протокола.
      </Alert>
    )
  }

  // Здесь — основная форма голосования
  return <VoteForm electionId={electionId} candidates={candidates} />
}

// ─────────────────────────────────────────────────────────────────────────────
// Форма выбора кандидата + отправка транзакции через MetaMask
// ─────────────────────────────────────────────────────────────────────────────
function VoteForm({
  electionId,
  candidates,
}: {
  electionId: number
  candidates: string[]
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // useWriteContract — хук wagmi для отправки транзакций.
  // writeContract(...) — функция, которая открывает MetaMask и просит подпись.
  // data — хеш транзакции (после подписи).
  // isPending — true пока ждём подписи.
  const {
    writeContract,
    data: txHash,
    isPending: isSigning,
    error: writeError,
    reset,
  } = useWriteContract()

  // useWaitForTransactionReceipt — ждёт майнинга транзакции.
  // После того как блок добывается, isSuccess становится true.
  const {
    isLoading: isMining,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Когда транзакция замайнена — обновляем все связанные данные.
  // Это аналог "refresh", но точечный: ТанSтек Query сам перезапросит API.
  if (isSuccess && txHash) {
    queryClient.invalidateQueries({ queryKey: ['elections', electionId] })
    queryClient.invalidateQueries({ queryKey: ['elections'] })
  }

  function handleVote() {
    if (!selected) return

    // Вызываем функцию контракта vote(electionId, candidate).
    // wagmi сам сериализует аргументы, попросит MetaMask подписать,
    // и отправит транзакцию в сеть.
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: VOTE_CHAIN_ABI,
      functionName: 'vote',
      args: [BigInt(electionId), selected],
    })
  }

  // После успешного голосования
  if (isSuccess) {
    return (
      <Alert variant="success" title="Голос принят!">
        Транзакция подтверждена в блокчейне. Хеш:&nbsp;
        <code className="font-mono break-all">{txHash}</code>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote className="h-5 w-5 text-brand-600" />
          Ваш голос
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Выберите одного кандидата. После подтверждения транзакции
          в MetaMask голос будет необратимо записан в блокчейн.
        </p>

        {/* Список радио-кнопок */}
        <div className="space-y-2 mb-4">
          {candidates.map((name) => (
            <label
              key={name}
              className={`
                flex items-center gap-3 p-3 rounded-md border cursor-pointer
                transition-colors
                ${selected === name
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 hover:bg-gray-50'}
              `}
            >
              <input
                type="radio"
                name="candidate"
                value={name}
                checked={selected === name}
                onChange={() => setSelected(name)}
                className="h-4 w-4 text-brand-600"
              />
              <span className="flex-1">{name}</span>
              {selected === name && (
                <CheckCircle2 className="h-5 w-5 text-brand-600" />
              )}
            </label>
          ))}
        </div>

        {/* Ошибка от MetaMask или контракта */}
        {writeError && (
          <div className="mb-4">
            <Alert variant="error" title="Ошибка">
              {/*
                MetaMask и контракт могут выдавать длинные технические сообщения.
                shortMessage — это удобный короткий вариант от viem/wagmi.
              */}
              {(writeError as any).shortMessage || writeError.message}
            </Alert>
          </div>
        )}

        {/* Кнопка голосования */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleVote}
            disabled={!selected || isSigning || isMining}
          >
            {isSigning && (
              <>
                <Spinner className="h-4 w-4" /> Ожидание подписи…
              </>
            )}
            {isMining && (
              <>
                <Spinner className="h-4 w-4" /> Майнинг транзакции…
              </>
            )}
            {!isSigning && !isMining && 'Проголосовать'}
          </Button>
          {writeError && (
            <Button variant="ghost" onClick={() => reset()}>
              Сбросить
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
