import {fetchData} from '@yoroi/common'

import {UseQueryOptions, useQuery} from '@tanstack/react-query'

import {HandleDRepInfo, handleApiGetDRepId} from '../../../adapters/handle/api'

export const useResolverDRepId = (
  {
    resolve,
    isMainnet = true,
    enabled = true,
  }: {
    resolve: string
    isMainnet?: boolean
    enabled?: boolean
  },
  options?: UseQueryOptions<
    HandleDRepInfo | null,
    Error,
    HandleDRepInfo | null,
    ['useResolverDRepId', string, boolean]
  >,
) => {
  const getDRepId = handleApiGetDRepId({
    request: fetchData,
    isMainnet,
  })

  const query = useQuery({
    queryKey: ['useResolverDRepId', resolve, isMainnet],
    queryFn: async ({signal}: {signal?: AbortSignal}) => {
      return await getDRepId(resolve, {signal})
    },
    enabled: enabled && resolve.length > 0,
    staleTime: 0,
    gcTime: 0,
    retry: false,
    ...options,
  })

  return {
    ...query,
    drepInfo: query.data ?? null,
  }
}
