import * as React from 'react'

import {useAirdropEligibility} from './useAirdropEligibility'

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

    const now = new Date()

    return allocations.some((allocation) => {
      // Check if any thaw is marked as 'redeemable' by backend
      if (allocation.redeemableAmount > 0) {
        return true
      }

      // Also check if any thaw has started but isn't confirmed yet
      // (in case backend hasn't updated status yet)
      return allocation.schedule.thaws.some((thaw) => {
        const thawDate = new Date(thaw.thawing_period_start.replace(/\s/g, ''))
        const hasStarted = thawDate <= now
        const isRedeemable = thaw.status === 'redeemable'
        const isPendingRedeemable =
          thaw.status === 'upcoming' || thaw.status === 'queued'
        const isNotRedeemed =
          thaw.status !== 'confirmed' &&
          thaw.status !== 'confirming' &&
          thaw.status !== 'submitted' &&
          thaw.status !== 'failed'

        return (
          isRedeemable || (hasStarted && isPendingRedeemable && isNotRedeemed)
        )
      })
    })
  }, [allocations, isLoading])

  return {
    hasRedeemableThaws,
    isLoading,
  }
}
