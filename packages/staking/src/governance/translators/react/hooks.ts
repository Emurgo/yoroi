import {UseMutationOptions, useQuery, UseQueryOptions} from 'react-query'
import {useGovernance} from './context'
import {GovernanceAction, VoteKind} from '../../manager'
import {useMutationWithInvalidations} from '@yoroi/common'
import {CardanoTypes} from '../../../cardanoMobile'

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

export const useDelegationCertificate = (
  variables: {drepID: string; stakingKey: CardanoTypes.PublicKey},
  options: UseQueryOptions<CardanoTypes.Certificate, Error> = {},
) => {
  const {manager} = useGovernance()

  return useQuery({
    queryKey: ['governanceDelegationCertificate', variables.drepID],
    queryFn: async () =>
      await manager.createDelegationCertificate(
        variables.drepID,
        variables.stakingKey,
      ),
    ...options,
  })
}

export const useVotingCertificate = (
  variables: {vote: VoteKind; stakingKey: CardanoTypes.PublicKey},
  options: UseQueryOptions<CardanoTypes.Certificate, Error> = {},
) => {
  const {manager} = useGovernance()

  return useQuery({
    queryKey: ['governanceVotingCertificate', variables.vote],
    queryFn: async () =>
      await manager.createVotingCertificate(
        variables.vote,
        variables.stakingKey,
      ),
    ...options,
  })
}
