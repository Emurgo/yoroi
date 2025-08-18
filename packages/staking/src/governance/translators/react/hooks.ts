import {useMutationWithInvalidations} from '@yoroi/common'

import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query'

import {useGovernance} from './context'
import {GovernanceAction, VoteKind} from '../../manager'
import {CardanoTypes} from '../../../types'
import {StakingKeyState} from '../../types'

export const useIsValidDRepID = (
  id: string,
  options: Partial<UseQueryOptions<void, Error>> = {},
) => {
  const {manager} = useGovernance()
  return useQuery({
    queryKey: ['useIsValidDRepID', id],
    ...options,
    queryFn: () => manager.validateDRepID(id),
  })
}

export const useStakingKeyState = (
  stakingKeyHash: string,
  options: Partial<UseQueryOptions<StakingKeyState, Error>> = {},
) => {
  const {manager} = useGovernance()
  return useQuery({
    gcTime: 0,
    staleTime: 0,
    enabled: stakingKeyHash.length > 0,
    queryKey: ['useStakingKeyState', stakingKeyHash],
    ...options,
    queryFn: () => manager.getStakingKeyState(stakingKeyHash),
  })
}

export const useLatestGovernanceAction = (
  walletId: string,
  options: Partial<UseQueryOptions<GovernanceAction | null, Error>> = {},
) => {
  const {manager} = useGovernance()

  return useQuery({
    queryKey: [walletId, manager.network, 'useLatestGovernanceAction'],
    ...options,
    queryFn: () => manager.getLatestGovernanceAction(),
  })
}

type UpdateLatestGovernanceActionResult = UseMutationResult<
  void,
  Error,
  GovernanceAction
> & {
  updateLatestGovernanceAction: (
    action: GovernanceAction,
    options?: Parameters<
      ReturnType<typeof useMutationWithInvalidations>['mutate']
    >[1],
  ) => void
}

export const useUpdateLatestGovernanceAction = (
  walletId: string,
  options: UseMutationOptions<void, Error, GovernanceAction> = {},
): UpdateLatestGovernanceActionResult => {
  const {manager} = useGovernance()
  const mutation = useMutationWithInvalidations({
    ...options,
    mutationFn: async (action: GovernanceAction) =>
      await manager.setLatestGovernanceAction(action),
    invalidateQueries: [
      [walletId, manager.network, 'governanceLatestGovernanceAction'],
    ],
  })
  return {
    ...mutation,
    updateLatestGovernanceAction: mutation.mutate,
  }
}

export const useDelegationCertificate = () => {
  const {manager} = useGovernance()

  return ({
    hash,
    type,
    stakingKey,
  }: {
    hash: string
    type: 'script' | 'key'
    stakingKey: CardanoTypes.PublicKey
  }) => manager.createDelegationCertificate(hash, type, stakingKey)
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

export const useBech32DRepID = (hexId: string) => {
  const {manager} = useGovernance()

  return manager.convertHexKeyHashToBech32Format(hexId)
}
