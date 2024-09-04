import {useMutationWithInvalidations} from '@yoroi/common'
import {UseMutationOptions} from 'react-query'

import {ScanActionClaim} from '../../Scan/common/types'
import {useClaim} from './ClaimProvider'
import {ClaimInfo} from './types'

export const useClaimTokens = (options: UseMutationOptions<ClaimInfo, Error, ScanActionClaim> = {}) => {
  const {claimTokens, address} = useClaim()

  const mutation = useMutationWithInvalidations<ClaimInfo, Error, ScanActionClaim>({
    ...options,
    mutationFn: claimTokens,
    invalidateQueries: [['useClaimTokens', address]],
  })

  return {
    ...mutation,

    claimTokens: mutation.mutate,
  } as const
}
