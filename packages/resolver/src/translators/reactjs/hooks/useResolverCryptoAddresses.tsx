import {useQuery, UseQueryOptions} from '@tanstack/react-query'
import {Resolver} from '@yoroi/types'

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
    queryKey: ['useResolverCryptoAddresses', resolve],
    queryFn: async ({signal}: {signal?: AbortSignal}) => {
      return await crypto.getCardanoAddresses({resolve, strategy}, {signal})
    },
    staleTime: 0,
    gcTime: 0,
    ...options,
  })

  return {
    ...query,
    cryptoAddresses: query.data ?? [],
  }
}
