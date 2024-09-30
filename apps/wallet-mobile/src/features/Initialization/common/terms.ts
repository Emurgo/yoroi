import {useAsyncStorage} from '@yoroi/common'
import {useCallback} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'

import {agreementDate} from '../../../kernel/config'

export type LegalAgreement = {
  latestAcceptedAgreementsDate: number
}

const queryKey = 'legalAgreement'

export const useLegalAgreement = () => {
  const storage = useAsyncStorage()
  const query = useQuery({
    queryKey: [queryKey],
    queryFn: () => storage.join('appSettings/').getItem<LegalAgreement>(queryKey),
    suspense: true,
  })

  return query.data
}

export const useAgreeWithLegal = () => {
  const storage = useAsyncStorage()
  const queryClient = useQueryClient()

  const mutationFn = useCallback(async () => {
    await storage.join('appSettings/').setItem<LegalAgreement>(queryKey, {latestAcceptedAgreementsDate: agreementDate})
  }, [storage])

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries([queryKey]),
  })
  return {
    ...mutation,
    agree: mutation.mutate,
  }
}
export const useResetLegalAgreement = () => {
  const storage = useAsyncStorage()
  const queryClient = useQueryClient()

  const mutationFn = useCallback(async () => {
    await storage.join('appSettings/').removeItem(queryKey)
  }, [storage])

  const mutation = useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries([queryKey]),
  })
  return {
    ...mutation,
    reset: mutation.mutate,
  }
}
