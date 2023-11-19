import {useQuery} from 'react-query'
import {useGovernance} from './context'
import {GovernanceAction} from '../../manager'
import {useMutationWithInvalidations} from '@yoroi/common'

export const useIsValidDRepID = (id: string) => {
  const {manager} = useGovernance()
  return useQuery(
    ['governanceIsValidDRepID', id],
    async () => await manager.validateDRepID(id),
  )
}

export const useLatestGovernanceAction = () => {
  const {manager} = useGovernance()
  return useQuery(
    'governanceLatestGovernanceAction',
    async () => await manager.getLatestGovernanceAction(),
  )
}

export const useUpdateLatestGovernanceAction = () => {
  const {manager} = useGovernance()
  return useMutationWithInvalidations({
    mutationFn: async (action: GovernanceAction) =>
      await manager.setLatestGovernanceAction(action),
    invalidateQueries: ['governanceLatestGovernanceAction'],
  })
}
