import {UseQueryOptions, useQuery} from '@tanstack/react-query'

import {useResolver} from '../provider/ResolverProvider'

export const useResolverShowNotice = (
  options?: Partial<
    UseQueryOptions<boolean, Error, boolean, ['useResolverShowNotice']>
  >,
) => {
  const {showNotice} = useResolver()

  const query = useQuery({
    queryKey: ['useResolverShowNotice'],
    queryFn: showNotice.read,
    ...options,
  })

  return {
    ...query,
    showNotice: query.data ?? false,
  }
}
