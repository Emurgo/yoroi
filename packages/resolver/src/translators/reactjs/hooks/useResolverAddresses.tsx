import {UseQueryOptions, useQuery, useQueryClient} from 'react-query'
import {useResolver} from '../provider/ResolverProvider'
import {Resolver} from '@yoroi/types'

export const useResolverAddresses = (
  {receiver}: {receiver: string},
  options?: UseQueryOptions<Resolver.AddressesResponse>,
) => {
  const {getCryptoAddress} = useResolver()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['resolver', receiver],
    ...options,
    queryFn: () => getCryptoAddress(receiver),
    onSuccess: (...args) => {
      options?.onSuccess?.(...args)
      queryClient.invalidateQueries(['resolver', receiver])
    },
  })

  return {
    ...query,
    addresses: query.data ?? [],
  }
}
