import {Exchange} from '@yoroi/types'
import {UseQueryOptions, useQuery} from '@tanstack/react-query'

export const useCreateReferralLink = (
  {
    providerId,
    queries,
    referralLinkCreate,
  }: {
    providerId: string
    queries: Exchange.ReferralUrlQueryStringParams
    referralLinkCreate: Exchange.Manager['referralLink']['create']
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
      referralLinkCreate({providerId, queries}, {signal}),
  })

  return {
    ...query,
    referralLink: query.data ?? '',
  }
}
