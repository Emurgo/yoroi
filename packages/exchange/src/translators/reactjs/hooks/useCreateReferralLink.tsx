import {Exchange} from '@yoroi/types'
import {AxiosRequestConfig} from 'axios'
import {UseQueryOptions, useQuery} from 'react-query'

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
  options?: UseQueryOptions<
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
  const query = useQuery({
    suspense: true,
    useErrorBoundary: true,
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
