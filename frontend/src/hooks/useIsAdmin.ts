/**
 * useIsAdmin — хук возвращает true, если подключённый MetaMask-адрес
 * совпадает с owner контракта (берём адрес owner через бэк).
 *
 * Хуки в React начинаются с "use" и могут вызываться только внутри компонентов.
 * Они "подключают" компонент к какому-то источнику данных или эффекту.
 */

import { useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'
import { getOwner } from '@/lib/api'
import { sameAddress } from '@/lib/utils'

export function useOwner() {
  // useQuery — хук TanStack Query.
  // Он запоминает результат и не делает повторных запросов.
  return useQuery({
    queryKey: ['owner'],
    queryFn: getOwner,
    // owner контракта не меняется — кэш на час
    staleTime: 60 * 60 * 1000,
  })
}

export function useIsAdmin() {
  const { address } = useAccount() // адрес из MetaMask, может быть undefined
  const { data: ownerData, isLoading } = useOwner()

  return {
    isAdmin: sameAddress(address, ownerData?.owner),
    isLoading,
    ownerAddress: ownerData?.owner,
    contractAddress: ownerData?.contract_address,
  }
}
