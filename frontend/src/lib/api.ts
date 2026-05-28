/**
 * api.ts — клиент для работы с бэкендом Django.
 *
 * Все функции возвращают типизированные данные.
 * Если бэк вернул ошибку, выбрасываем исключение (его поймает TanStack Query).
 */

import axios, { AxiosError } from 'axios'

// Создаём один экземпляр axios с базовым URL.
// В dev: Vite проксирует /api на http://localhost:8000 (см. vite.config.ts).
// В Docker / preview: nginx тоже проксирует /api на бэк.
// Поэтому baseURL всегда просто '/api'.
const api = axios.create({
  baseURL: '/api',
  timeout: 60_000, // транзакции в блокчейне могут длиться 10-30 сек
})

// --- Типы данных, которые возвращает бэк ---

export interface Election {
  election_id: number
  title: string
  is_open: boolean
  total_votes: number
}

export interface ElectionsListResponse {
  count: number
  elections: Election[]
}

export interface CandidatesResponse {
  election_id: number
  candidates: string[]
}

export interface ResultsResponse {
  election_id: number
  results: { candidate: string; votes: number }[]
}

export interface VoterStatusResponse {
  election_id: number
  address: string
  whitelisted: boolean
  has_voted: boolean
  can_vote: boolean
}

export interface OwnerResponse {
  owner: string
  contract_address: string
  chain_id: number
}

export interface TxResponse {
  message: string
  tx_hash: string
  election_id?: number
}

// --- Преобразование ошибок ---

/**
 * Бэк возвращает JSON вида { "error": "сообщение" } со статусом 4xx или 5xx.
 * Эта функция вытаскивает текст ошибки и выбрасывает обычный Error,
 * чтобы UI мог показать его пользователю.
 */
function unwrapError(error: unknown): never {
  if (error instanceof AxiosError) {
    const msg =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      'Неизвестная ошибка'
    throw new Error(msg)
  }
  throw error
}

// --- API-функции ---

export async function getOwner(): Promise<OwnerResponse> {
  try {
    const { data } = await api.get<OwnerResponse>('/owner/')
    return data
  } catch (e) {
    unwrapError(e)
  }
}

export async function listElections(): Promise<ElectionsListResponse> {
  try {
    const { data } = await api.get<ElectionsListResponse>('/elections/')
    return data
  } catch (e) {
    unwrapError(e)
  }
}

export async function getElection(id: number): Promise<Election> {
  try {
    const { data } = await api.get<Election>(`/elections/${id}/`)
    return data
  } catch (e) {
    unwrapError(e)
  }
}

export async function getCandidates(id: number): Promise<CandidatesResponse> {
  try {
    const { data } = await api.get<CandidatesResponse>(
      `/elections/${id}/candidates/`,
    )
    return data
  } catch (e) {
    unwrapError(e)
  }
}

export async function getResults(id: number): Promise<ResultsResponse> {
  try {
    const { data } = await api.get<ResultsResponse>(
      `/elections/${id}/results/`,
    )
    return data
  } catch (e) {
    unwrapError(e)
  }
}

export async function getVoterStatus(
  id: number,
  address: string,
): Promise<VoterStatusResponse> {
  try {
    const { data } = await api.get<VoterStatusResponse>(
      `/elections/${id}/voters/${address}/status/`,
    )
    return data
  } catch (e) {
    unwrapError(e)
  }
}

export async function createElection(
  title: string,
  candidates: string[],
): Promise<TxResponse> {
  try {
    const { data } = await api.post<TxResponse>('/elections/', {
      title,
      candidates,
    })
    return data
  } catch (e) {
    unwrapError(e)
  }
}

export async function addToWhitelist(
  id: number,
  userAddress: string,
): Promise<TxResponse> {
  try {
    const { data } = await api.post<TxResponse>(
      `/elections/${id}/whitelist/`,
      { userAddress },
    )
    return data
  } catch (e) {
    unwrapError(e)
  }
}

export async function closeElection(id: number): Promise<TxResponse> {
  try {
    const { data } = await api.post<TxResponse>(`/elections/${id}/close/`)
    return data
  } catch (e) {
    unwrapError(e)
  }
}
