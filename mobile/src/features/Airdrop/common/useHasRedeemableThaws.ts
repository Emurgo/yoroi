import * as React from 'react'

import {useAirdropEligibility} from './useAirdropEligibility'
import {isThawRedeemable} from './utils'

/**
 * Hook to check if there are any redeemable airdrop thaws available
 * Checks both backend 'redeemable' status and thaws that have started but aren't confirmed
 */
export const useHasRedeemableThaws = () => {
  const {allocations, isLoading} = useAirdropEligibility()

  const hasRedeemableThaws = React.useMemo(() => {
    if (isLoading || allocations.length === 0) {
      return false
    }

    return allocations.some((allocation) => {
      // Check if any thaw is marked as 'redeemable' by backend
      if (allocation.redeemableAmount > 0) {
        return true
      }

      // Also check if any thaw has started but isn't confirmed yet
      // (in case backend hasn't updated status yet)
      // Exclude failed and skipped thaws - they cannot be redeemed
      return allocation.schedule.thaws.some((thaw) => {
        const thawStatus = thaw.status
        // Skip failed and skipped thaws - they cannot be redeemed
        if (thawStatus === 'failed' || thawStatus === 'skipped') {
          return false
        }

        return isThawRedeemable(thaw)
      })
    })
  }, [allocations, isLoading])

  return {
    hasRedeemableThaws,
    isLoading,
  }
}
