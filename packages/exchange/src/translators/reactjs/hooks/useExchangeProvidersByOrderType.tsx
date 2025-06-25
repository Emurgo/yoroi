import {Exchange} from '@yoroi/types'

import {UseSuspenseQueryOptions, useSuspenseQuery} from '@tanstack/react-query'

export const useExchangeProvidersByOrderType = (
  {
    orderType,
    providerListByOrderType,
  }: {
    orderType: Exchange.OrderType
    providerListByOrderType: Exchange.Manager['provider']['list']['byOrderType']
  },
  options?: UseSuspenseQueryOptions<
    ReadonlyArray<[string, Exchange.Provider]>,
    Error,
    ReadonlyArray<[string, Exchange.Provider]>,
    ['useExchangeProvidersByOrderType', Exchange.OrderType]
  >,
) => {
  const query = useSuspenseQuery({
    ...options,
    queryKey: ['useExchangeProvidersByOrderType', orderType],
    queryFn: () => providerListByOrderType(orderType),
  })

  return query.data ?? []
}
