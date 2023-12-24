import {UseQueryOptions, useQuery} from 'react-query'
import {Resolver} from '@yoroi/types'
import {WasmModuleProxy} from '@emurgo/cross-csl-core'

import {useResolver} from '../provider/ResolverProvider'

// half of average block time
const tenSeconds = 10 * 1000
export const useResolverCryptoAddresses = (
  {
    resolve,
    strategy = 'all',
    csl,
  }: {
    resolve: Resolver.Receiver['resolve']
    strategy?: Resolver.Strategy
    csl?: WasmModuleProxy
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
      crypto.getCardanoAddresses({resolve, strategy}, csl, {signal}),
  })

  return {
    ...query,
    cryptoAddresses: query.data ?? [],
  }
}
