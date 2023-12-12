import {UseQueryOptions, useQuery} from 'react-query'
import {Resolver} from '@yoroi/types'

import {useResolver} from '../provider/ResolverProvider'

export const useResolverCryptoAddresses = (
  {
    resolve,
    strategy = 'all',
  }: {resolve: Resolver.Receiver['resolve']; strategy?: Resolver.Strategy},
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
    ...options,
    queryFn: () => crypto.getCardanoAddresses(resolve, strategy),
  })

  return {
    ...query,
    cryptoAddresses: query.data ?? [],
  }
}
