import {useQuery} from '@tanstack/react-query'
import {Resolver} from '@yoroi/types'

import {useResolver} from '../provider/ResolverProvider'

export const useResolverCryptoAddresses = ({
  resolve,
  strategy = 'all',
}: {
  resolve: Resolver.Receiver['resolve']
  strategy?: Resolver.Strategy
}) => {
  const {crypto} = useResolver()

  const {data, error, isLoading, isError} = useQuery({
    queryKey: ['resolver', 'crypto-addresses', resolve, strategy],
    queryFn: async ({signal}: {signal?: AbortSignal}) => {
      return await crypto.getCardanoAddresses({resolve, strategy}, {signal})
    },
  })

  return {
    data: data ?? [],
    error,
    isLoading,
    isError,
    cryptoAddresses: data ?? [],
  }
}
