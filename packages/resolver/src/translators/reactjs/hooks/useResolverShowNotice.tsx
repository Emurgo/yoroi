import {useQuery, UseQueryOptions} from '@tanstack/react-query'

import {useResolver} from '../provider/ResolverProvider'

export const useResolverShowNotice = (
  options?: Partial<
    UseQueryOptions<boolean, Error, boolean, ['resolver', 'show-notice']>
  >,
) => {
  const {showNotice} = useResolver()

  const query = useQuery({
    queryKey: ['resolver', 'show-notice'],
    queryFn: showNotice.read,
    staleTime: 0,
    gcTime: 0,
    ...options,
  })

  return {
    ...query,
    showNotice: query.data ?? false,
  }
}
