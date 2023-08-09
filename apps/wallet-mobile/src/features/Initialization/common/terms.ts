import {useCallback} from 'react'
import {useMutation, useQuery, useQueryClient} from 'react-query'

import {useStorage} from '../../../yoroi-wallets/storage'
import {CONFIG} from '../../../legacy/config'

export type TermsOfServiceAgreement = {
  version: number
  dateAccepted: string
}

const queryKey = 'termsOfServiceAgreement' as const

export const useTermsOfServiceAgreement = () => {
  const storage = useStorage()
  const query = useQuery({
    queryKey: [queryKey],
    queryFn: async () => storage.join('appSettings/').getItem<TermsOfServiceAgreement>(queryKey),
    suspense: true,
  })

  return query.data
}

export const useAgreeWithTermsOfService = () => {
  const storage = useStorage()
  const queryClient = useQueryClient()

  const mutationFn = useCallback(async () => {
    const version = CONFIG.LATEST_TERMS_AND_CONDITIONS_VERSION
    const date = new Date().toISOString()
    await storage.join('appSettings/').setItem<TermsOfServiceAgreement>(queryKey, {version, dateAccepted: date})
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
