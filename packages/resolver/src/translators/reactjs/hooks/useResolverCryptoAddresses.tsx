import {UseQueryOptions, useQuery} from 'react-query'
import {Resolver} from '@yoroi/types'

import {useResolver} from '../provider/ResolverProvider'

export const useResolverCryptoAddresses = (
  {
    receiver,
    strategy = 'all',
  }: {receiver: string; strategy?: Resolver.Strategy},
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
    queryKey: ['useResolverCryptoAddresses', receiver],
    ...options,
    queryFn: () => crypto.getCardanoAddresses(receiver, strategy),
  })

  return {
    ...query,
    cryptoAddresses: query.data ?? [],
  }
}
