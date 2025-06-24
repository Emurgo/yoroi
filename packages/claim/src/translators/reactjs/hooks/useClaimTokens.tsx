import {Claim, Scan} from '@yoroi/types'
import {useMutationWithInvalidations} from '@yoroi/common'

import {UseMutationOptions, UseMutationResult} from '@tanstack/react-query'

import {useClaim} from './useClaim'

export const useClaimTokens = (
  options: UseMutationOptions<Claim.Info, Error, Scan.ActionClaim> = {},
): UseMutationResult<Claim.Info, Error, Scan.ActionClaim> & {
  claimTokens: (variables: Scan.ActionClaim) => void
} => {
  const {claimTokens, address} = useClaim()

  const mutation = useMutationWithInvalidations<
    Claim.Info,
    Error,
    Scan.ActionClaim
  >({
    ...options,
    mutationFn: claimTokens,
    invalidateQueries: [['useClaimTokens', address]],
  })

  return {
    ...mutation,
    claimTokens: mutation.mutate,
  } as const
}
