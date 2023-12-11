import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from 'react-query'
import {useGovernance} from './context'
import {GovernanceAction, VoteKind} from '../../manager'
import {useMutationWithInvalidations} from '@yoroi/common'
import {CardanoTypes} from '../../../types'

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
  walletId: string,
  options: UseQueryOptions<GovernanceAction | null, Error> = {},
) => {
  const {manager} = useGovernance()

  return useQuery({
    queryKey: [walletId, 'governanceLatestGovernanceAction'],
    queryFn: async () => await manager.getLatestGovernanceAction(),
    ...options,
  })
}

export const useUpdateLatestGovernanceAction = (
  options: UseMutationOptions<void, Error, GovernanceAction> = {},
) => {
  const {manager} = useGovernance()
  const mutation = useMutationWithInvalidations({
    ...options,
    mutationFn: async (action: GovernanceAction) =>
      await manager.setLatestGovernanceAction(action),
    invalidateQueries: ['governanceLatestGovernanceAction'],
  })
  return {
    ...mutation,
    updateLatestGovernanceAction: mutation.mutate,
  }
}

export const useDelegationCertificate = (
  options: UseMutationOptions<
    CardanoTypes.Certificate,
    Error,
    {drepID: string; stakingKey: CardanoTypes.PublicKey}
  > = {},
) => {
  const {manager} = useGovernance()

  const mutation = useMutation({
    mutationKey: ['governanceDelegationCertificate'],
    mutationFn: async (variables) =>
      await manager.createDelegationCertificate(
        variables.drepID,
        variables.stakingKey,
      ),
    ...options,
  })
  return {
    ...mutation,
    createCertificate: mutation.mutate,
  }
}

export const useVotingCertificate = (
  options: UseMutationOptions<
    CardanoTypes.Certificate,
    Error,
    {vote: VoteKind; stakingKey: CardanoTypes.PublicKey}
  > = {},
) => {
  const {manager} = useGovernance()

  const mutation = useMutation({
    mutationKey: ['governanceVotingCertificate'],
    mutationFn: async (variables) =>
      await manager.createVotingCertificate(
        variables.vote,
        variables.stakingKey,
      ),
    ...options,
  })
  return {
    ...mutation,
    createCertificate: mutation.mutate,
  }
}
