/**
 * ScanActionHandler Component
 *
 * Handles scan actions from web+cardano:// deep links.
 * Consumes pendingScanAction from context and triggers
 * the appropriate action using useTriggerScanAction.
 *
 * This component doesn't require a wallet to be selected - it navigates to
 * the appropriate screens, which are wrapped in WithWalletOpened and will
 * handle wallet selection if needed.
 */
import * as React from 'react'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {usePendingScanAction} from '~/features/Links/context/PendingScanActionContext'
import {useTriggerScanAction} from '~/features/Scan/common/useTriggerScanAction'
import {logger} from '~/kernel/logger/logger'

export const ScanActionHandler = () => {
  const {isLoggedIn} = useAuth()
  const {pendingScanAction, clearPendingScanAction} = usePendingScanAction()
  const triggerScanAction = useTriggerScanAction({insideFeature: 'scan'})

  // Track the last processed action to prevent infinite loops
  // Use a ref to store a unique identifier for the action
  const lastProcessedActionRef = React.useRef<string | null>(null)
  const isProcessingRef = React.useRef(false)

  // Store functions in refs to avoid stale closures while preventing infinite loops
  const triggerScanActionRef = React.useRef(triggerScanAction)
  const clearPendingScanActionRef = React.useRef(clearPendingScanAction)

  // Update refs when functions change
  React.useEffect(() => {
    triggerScanActionRef.current = triggerScanAction
    clearPendingScanActionRef.current = clearPendingScanAction
  }, [triggerScanAction, clearPendingScanAction])

  React.useEffect(() => {
    // Create a unique identifier for this action
    const actionId = pendingScanAction
      ? `${pendingScanAction.action}-${JSON.stringify(pendingScanAction)}`
      : null

    // Only process actions when user is logged in (security requirement)
    // Prevent processing if:
    // 1. No pending action
    // 2. User is not logged in
    // 3. We're already processing an action
    // 4. This is the same action we just processed
    if (
      pendingScanAction &&
      isLoggedIn &&
      !isProcessingRef.current &&
      actionId !== lastProcessedActionRef.current
    ) {
      isProcessingRef.current = true
      lastProcessedActionRef.current = actionId

      try {
        triggerScanActionRef.current(pendingScanAction)
        clearPendingScanActionRef.current()
        // Reset processing flag after a short delay to allow navigation to complete
        setTimeout(() => {
          isProcessingRef.current = false
        }, 1000)
      } catch (error) {
        logger.error('ScanActionHandler: error triggering scan action', {
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          action: pendingScanAction.action,
        })
        isProcessingRef.current = false
        // Don't clear the action on error - let user retry
      }
    } else if (!pendingScanAction) {
      // Reset tracking when there's no pending action
      lastProcessedActionRef.current = null
      isProcessingRef.current = false
    }
  }, [pendingScanAction, isLoggedIn]) // Only depend on pendingScanAction and isLoggedIn

  return null
}
