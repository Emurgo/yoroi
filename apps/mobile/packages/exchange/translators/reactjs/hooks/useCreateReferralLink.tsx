import {Exchange} from '@yoroi/types'

import {UseSuspenseQueryOptions, useSuspenseQuery} from '@tanstack/react-query'
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
  options?: UseSuspenseQueryOptions<
    URL,
    Error,
    URL,
    [
      'useCreateReferralLink',
      Exchange.ReferralUrlQueryStringParams,
      Exchange.Provider['id'],
    ]
  >,
) => {
  const query = useSuspenseQuery({
    ...options,
    queryKey: ['useCreateReferralLink', queries, providerId],
    queryFn: async ({signal}) =>
      referralLinkCreate({providerId, queries}, {signal, ...fetcherConfig}),
  })

  return {
    ...query,
    referralLink: query.data ?? '',
  }
}
