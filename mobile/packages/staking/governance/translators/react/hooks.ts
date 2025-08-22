import {useMutationWithInvalidations} from '@yoroi/common'

import {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  useQuery,
} from '@tanstack/react-query'

import {CardanoTypes} from '../../../types'
import {GovernanceAction, VoteKind} from '../../manager'
import {StakingKeyState} from '../../types'
import {useGovernance} from './context'

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
      [walletId, manager.network, 'useLatestGovernanceAction'],
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

export const useVotingCertificate = () => {
  const {manager} = useGovernance()
  return ({
    vote,
    stakingKey,
  }: {
    vote: VoteKind
    stakingKey: CardanoTypes.PublicKey
  }) => manager.createVotingCertificate(vote, stakingKey)
}

export const useBech32DRepID = (hexId: string) => {
  const {manager} = useGovernance()

  return manager.convertHexKeyHashToBech32Format(hexId)
}
