import {Exchange} from '@yoroi/types'

import {UseMutationOptions, useMutation} from '@tanstack/react-query'
import {AxiosRequestConfig} from 'axios'

export const useCreateReferralLink = (
  {
    providerId,
    queries,
    referralLinkCreate,
    fetcherConfig,
  }: {
    providerId: string
    queries: Exchange.ReferralUrlQueryStringParams
    referralLinkCreate: Exchange.Manager['referralLink']['create']
    fetcherConfig?: AxiosRequestConfig
  },
  options?: UseMutationOptions<
    URL,
    Error,
    void,
    [
      'useCreateReferralLink',
      Exchange.ReferralUrlQueryStringParams,
      Exchange.Provider['id'],
    ]
  >,
) => {
  const mutation = useMutation({
    ...options,
    mutationKey: ['useCreateReferralLink', queries, providerId],
    mutationFn: async () =>
      referralLinkCreate({providerId, queries}, fetcherConfig),
  })

  return {
    ...mutation,
    referralLink: mutation.data ?? '',
    createReferralLink: () => mutation.mutate(),
  }
}
