import {Exchange} from '@yoroi/types'
import {UseQueryOptions, useQuery} from '@tanstack/react-query'

export const useExchangeProvidersByOrderType = (
  {
    orderType,
    providerListByOrderType,
  }: {
    orderType: Exchange.OrderType
    providerListByOrderType: Exchange.Manager['provider']['list']['byOrderType']
  },
  options?: UseQueryOptions<
    ReadonlyArray<[string, Exchange.Provider]>,
    Error,
    ReadonlyArray<[string, Exchange.Provider]>,
    ['useExchangeProvidersByOrderType', Exchange.OrderType]
  >,
) => {
  const query = useQuery({
    suspense: true,
    useErrorBoundary: true,
    ...options,
    queryKey: ['useExchangeProvidersByOrderType', orderType],
    queryFn: () => providerListByOrderType(orderType),
  })

  return query.data ?? []
}
