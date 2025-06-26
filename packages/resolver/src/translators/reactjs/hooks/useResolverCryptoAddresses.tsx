import {Resolver} from '@yoroi/types'
import {time} from '@yoroi/common'

import {UseQueryOptions, useQuery} from '@tanstack/react-query'

import {useResolver} from '../provider/ResolverProvider'

export const useResolverCryptoAddresses = (
  {
    resolve,
    strategy = 'all',
  }: {
    resolve: Resolver.Receiver['resolve']
    strategy?: Resolver.Strategy
  },
  options?: UseQueryOptions<
    Resolver.AddressesResponse,
    Error,
    Resolver.AddressesResponse,
    ['useResolverCryptoAddresses', string]
  >,
) => {
  const {crypto} = useResolver()

  const query = useQuery({
    throwOnError: true,
    queryKey: ['useResolverCryptoAddresses', resolve],
    staleTime: 0,
    gcTime: time.seconds(10),
    ...options,
    queryFn: ({signal}) =>
      crypto.getCardanoAddresses({resolve, strategy}, {signal}),
  })

  return {
    ...query,
    cryptoAddresses: query.data ?? [],
  }
}
