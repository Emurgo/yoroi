import {useMutationWithInvalidations} from '@yoroi/common'
import {Claim, Links} from '@yoroi/types'

import {UseMutationOptions, UseMutationResult} from '@tanstack/react-query'

import {useClaim} from './useClaim'

export const useClaimTokens = (
  options: UseMutationOptions<Claim.Info, Error, Links.CardanoActionClaim> = {},
): UseMutationResult<Claim.Info, Error, Links.CardanoActionClaim> & {
  claimTokens: (variables: Links.CardanoActionClaim) => void
} => {
  const {claimTokens, address} = useClaim()

  const mutation = useMutationWithInvalidations<
    Claim.Info,
    Error,
    Links.CardanoActionClaim
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
