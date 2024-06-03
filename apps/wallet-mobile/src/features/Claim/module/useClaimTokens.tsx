import {useMutationWithInvalidations} from '@yoroi/common'
import {UseMutationOptions} from '@tanstack/react-query'

import {ScanActionClaim} from '../../Scan/common/types'
import {useClaim} from './ClaimProvider'
import {ClaimToken} from './types'

export const useClaimTokens = (options: UseMutationOptions<ClaimToken, Error, ScanActionClaim> = {}) => {
  const {claimTokens, address} = useClaim()
  const mutation = useMutationWithInvalidations<ClaimToken, Error, ScanActionClaim>({
    ...options,
    mutationFn: claimTokens,
    invalidateQueries: [['useClaimTokens', address]],
  })

  return {
    claimTokens: mutation.mutate,

    ...mutation,
  } as const
}
