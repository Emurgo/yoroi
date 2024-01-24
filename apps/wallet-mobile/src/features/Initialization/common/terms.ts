import {useStorage} from '@yoroi/common'
import {useCallback} from 'react'
import {useMutation, useQuery, useQueryClient} from 'react-query'

import {CONFIG} from '../../../legacy/config'

export type LegalAgreement = {
  latestAcceptedAgreementsDate: number
}

const queryKey = 'legalAgreement'

export const useLegalAgreement = () => {
  const storage = useStorage()
  const query = useQuery({
    queryKey: [queryKey],
    queryFn: async () => storage.join('appSettings/').getItem<LegalAgreement>(queryKey),
    suspense: true,
  })

  return query.data
}

export const useAgreeWithLegal = () => {
  const storage = useStorage()
  const queryClient = useQueryClient()

  const mutationFn = useCallback(async () => {
    await storage
      .join('appSettings/')
      .setItem<LegalAgreement>(queryKey, {latestAcceptedAgreementsDate: CONFIG.AGREEMENT_DATE})
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
  const storage = useStorage()
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
