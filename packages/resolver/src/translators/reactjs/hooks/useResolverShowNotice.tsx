import {useQuery, UseQueryOptions} from '@tanstack/react-query'

import {useResolver} from '../provider/ResolverProvider'

export const useResolverShowNotice = (
  options?: UseQueryOptions<boolean, Error>,
) => {
  const {showNotice} = useResolver()

  const query = useQuery({
    queryKey: ['resolver', 'show-notice'],
    queryFn: async () => {
      return await showNotice.read()
    },
    staleTime: 0,
    gcTime: 0,
    ...options,
  })

  return {
    ...query,
    showNotice: query.data ?? false,
  }
}
