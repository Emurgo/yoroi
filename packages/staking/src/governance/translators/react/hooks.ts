import {UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'
import {useGovernance} from './context'
import {GovernanceAction} from '../../manager'
import {useMutationWithInvalidations} from '@yoroi/common'

export const useIsValidDRepID = (
  id: string,
  options: UseQueryOptions<void, Error> = {},
) => {
  const {manager} = useGovernance()
  return useQuery({
    queryKey: ['governanceIsValidDRepID', id],
    queryFn: async () => await manager.validateDRepID(id),
    ...options,
  })
}

export const useLatestGovernanceAction = (
  options: UseQueryOptions<GovernanceAction | null, Error> = {},
) => {
  const {manager} = useGovernance()

  return useQuery({
    queryKey: 'governanceLatestGovernanceAction',
    queryFn: async () => await manager.getLatestGovernanceAction(),
    ...options,
  })
}

export const useUpdateLatestGovernanceAction = (
  options: UseMutationOptions<void, Error, GovernanceAction> = {},
) => {
  const {manager} = useGovernance()
  return useMutationWithInvalidations({
    ...options,
    mutationFn: async (action: GovernanceAction) =>
      await manager.setLatestGovernanceAction(action),
    invalidateQueries: ['governanceLatestGovernanceAction'],
  })
}
