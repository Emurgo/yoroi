import {Exchange} from '@yoroi/types'
import {UseQueryOptions, useQuery} from 'react-query'

import {ExchangeManager} from '../../../manager'

export const useExchangeReferralLinkCreate = (
  {
    providerId,
    queries,
    providerListByFeature, // instead of consuming the context inside INJECT from useExchange from ui
  }: {
    orderType: Exchange.OrderType
    providerListByFeature: ExchangeManager['provider']['list']['byFeature']
  },
  options?: UseQueryOptions<
    any,
    Error,
    any,
    ['useExchangeProvidersByFeature', string]
  >,
) => {
  const query = useQuery({
    suspense: true,
    useErrorBoundary: true,
    ...options,
    queryKey: ['useExchangeProvidersByFeature', orderType],
    queryFn: () => providerListByFeature(orderType),
  })

  return query
}
