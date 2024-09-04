import {Claim, Scan} from '@yoroi/types'
import {useMutationWithInvalidations} from '@yoroi/common'
import {UseMutationOptions} from 'react-query'

import {useClaim} from '../provider/ClaimProvider'

export const useClaimTokens = (
  options: UseMutationOptions<Claim.Info, Error, Scan.ActionClaim> = {},
) => {
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
