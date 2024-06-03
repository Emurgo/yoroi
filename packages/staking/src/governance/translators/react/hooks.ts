import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query'
import {useGovernance} from './context'
import {GovernanceAction, VoteKind} from '../../manager'
import {useMutationWithInvalidations} from '@yoroi/common'
import {CardanoTypes} from '../../../types'
import {StakingKeyState} from '../../types'

export const useIsValidDRepID = (
  id: string,
  options: UseQueryOptions<void, Error> = {},
) => {
  const {manager} = useGovernance()
  return useQuery({
    queryKey: ['governanceIsValidDRepID', id],
    queryFn: () => manager.validateDRepID(id),
    ...options,
  })
}

export const useStakingKeyState = (
  stakingKeyHash: string,
  options: UseQueryOptions<StakingKeyState, Error> = {},
) => {
  const {manager} = useGovernance()
  return useQuery({
    queryKey: ['governanceStakingKeyState', stakingKeyHash],
    queryFn: () => manager.getStakingKeyState(stakingKeyHash),
    enabled: stakingKeyHash.length > 0,
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
    queryFn: () => manager.getLatestGovernanceAction(),
    ...options,
  })
}

export const useUpdateLatestGovernanceAction = (
  walletId: string,
  options: UseMutationOptions<void, Error, GovernanceAction> = {},
) => {
  const {manager} = useGovernance()
  const mutation = useMutationWithInvalidations({
    ...options,
    mutationFn: async (action: GovernanceAction) =>
      await manager.setLatestGovernanceAction(action),
    invalidateQueries: [[walletId, 'governanceLatestGovernanceAction']],
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

export const useBech32DRepID = (
  hexId: string,
  options: UseQueryOptions<string, Error> = {},
) => {
  const {manager} = useGovernance()

  return useQuery({
    queryKey: ['governanceGetBech32DRepID', hexId],
    queryFn: () => manager.convertHexKeyHashToBech32Format(hexId),
    ...options,
  })
}
