import {Exchange} from '@yoroi/types'
import {UseQueryOptions, useQuery} from 'react-query'
import {exchangeApiMaker} from '../../../adapters/api'

export const useCreateReferralLink = (
  {
    provider,
    createReferralUrl,
    isProduction,
    partner,
    queries,
  }: {
    provider: Exchange.Provider
    createReferralUrl: (
      baseUrl: string,
      queries: Exchange.ReferralUrlQueryStringParams,
    ) => URL
    isProduction: boolean
    partner: string
    queries: Exchange.ReferralUrlQueryStringParams
  },
  options?: UseQueryOptions<
    URL,
    Error,
    URL,
    [
      'useCreateReferralLink',
      Exchange.ReferralUrlQueryStringParams,
      Exchange.Provider,
    ]
  >,
) => {
  const query = useQuery({
    useErrorBoundary: true,
    queryKey: ['useCreateReferralLink', queries, provider],
    ...options,
    queryFn: async ({signal}) => {
      const {getBaseUrl} = exchangeApiMaker({provider})
      const baseUrl = await getBaseUrl({
        isProduction,
        partner,
        fetcherConfig: {signal},
      })
      const referralUrl = await createReferralUrl(baseUrl, queries)

      return referralUrl
    },
  })

  return {
    ...query,
    referralLink: query.data ?? '',
  }
}
