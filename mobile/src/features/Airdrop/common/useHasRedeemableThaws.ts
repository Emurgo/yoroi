import * as React from 'react'

import {useAirdropEligibility} from './useAirdropEligibility'

/**
 * Hook to check if there are any redeemable airdrop thaws available
 */
export const useHasRedeemableThaws = () => {
  const {allocations, isLoading} = useAirdropEligibility()

  const hasRedeemableThaws = React.useMemo(() => {
    if (isLoading || allocations.length === 0) {
      return false
    }

    return allocations.some((allocation) => allocation.redeemableAmount > 0)
  }, [allocations, isLoading])

  return {
    hasRedeemableThaws,
    isLoading,
  }
}

