import {UseQueryOptions, useQuery} from '@tanstack/react-query'
import {Resolver} from '@yoroi/types'

import {useResolver} from '../provider/ResolverProvider'

// half of average block time
const tenSeconds = 10 * 1000
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
    useErrorBoundary: true,
    queryKey: ['useResolverCryptoAddresses', resolve],
    staleTime: 0,
    cacheTime: tenSeconds,
    ...options,
    queryFn: ({signal}) =>
      crypto.getCardanoAddresses({resolve, strategy}, {signal}),
  })

  return {
    ...query,
    cryptoAddresses: query.data ?? [],
  }
}
