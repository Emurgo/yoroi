import {Exchange} from '@yoroi/types'
import {UseQueryOptions, useQuery} from 'react-query'

export const useCreateReferralLink = (
  {
    getBaseUrl,
    createReferralUrl,
    isProduction,
    partner,
    queries,
  }: {
    getBaseUrl: Exchange.Api['getBaseUrl']
    createReferralUrl: (
      baseUrl: string,
      queries: Exchange.ReferralUrlQueryStringParams,
    ) => URL
    isProduction: boolean
    partner: string
    queries: Exchange.ReferralUrlQueryStringParams
  },
  options?: UseQueryOptions<URL, Error, URL, ['useGetBaseUrl']>,
) => {
  const query = useQuery({
    useErrorBoundary: true,
    queryKey: ['useGetBaseUrl'],
    ...options,
    queryFn: async ({signal}) => {
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
