import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  useQueryClient,
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
    queryKey: ['governanceIsValidDRepID', id],
    queryFn: () => manager.validateDRepID(id),
    ...options,
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
    queryKey: ['governanceStakingKeyState', stakingKeyHash],
    queryFn: () => manager.getStakingKeyState(stakingKeyHash),
    enabled: stakingKeyHash.length > 0,
    ...options,
  })
}

export const useLatestGovernanceAction = (
  walletId: string,
  options: Partial<UseQueryOptions<GovernanceAction | null, Error>> = {},
) => {
  const {manager} = useGovernance()

  return useQuery({
    queryKey: [walletId, manager.network, 'governanceLatestGovernanceAction'],
    queryFn: () => manager.getLatestGovernanceAction(),
    ...options,
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

export const useDelegationCertificate = (
  options: UseMutationOptions<
    CardanoTypes.Certificate,
    Error,
    {hash: string; type: 'script' | 'key'; stakingKey: CardanoTypes.PublicKey}
  > = {},
) => {
  const {manager} = useGovernance()

  const mutation = useMutation({
    mutationKey: ['governanceDelegationCertificate'],
    mutationFn: async (variables) =>
      await manager.createDelegationCertificate(
        variables.hash,
        variables.type,
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
  options: Partial<UseQueryOptions<string, Error>> = {},
) => {
  const {manager} = useGovernance()

  return useQuery({
    queryKey: ['governanceGetBech32DRepID', hexId],
    queryFn: () => manager.convertHexKeyHashToBech32Format(hexId),
    ...options,
  })
}

// TODO: temporary solution. Import from common when monorepo is ready.
export const useMutationWithInvalidations = <
  TData = unknown,
  TError = unknown,
  TVariables = void,
  TContext = unknown,
>({
  invalidateQueries,
  ...options
}: UseMutationOptions<TData, TError, TVariables, TContext> & {
  invalidateQueries?: Array<QueryKey>
}) => {
  const queryClient = useQueryClient()

  return useMutation<TData, TError, TVariables, TContext>({
    ...options,
    onMutate: (variables) => {
      invalidateQueries?.forEach((key) =>
        queryClient.cancelQueries({queryKey: key}),
      )
      return options?.onMutate?.(variables)
    },
    onSuccess: (data, variables, context) => {
      invalidateQueries?.forEach((key) =>
        queryClient.invalidateQueries({queryKey: key}),
      )
      return options?.onSuccess?.(data, variables, context)
    },
  })
}
