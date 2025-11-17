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

  React.useEffect(() => {
    logger.debug('ScanActionHandler: component mounted/updated')
  }, [])

  React.useEffect(() => {
    logger.debug('ScanActionHandler: effect triggered', {
      hasPendingScanAction: !!pendingScanAction,
      isLoggedIn,
      pendingScanAction,
    })

    // Only process actions when user is logged in (security requirement)
    if (pendingScanAction && isLoggedIn) {
      logger.debug('ScanActionHandler: triggering scan action', {
        action: pendingScanAction.action,
        pendingScanAction,
      })
      triggerScanAction(pendingScanAction)
      logger.debug('ScanActionHandler: scan action triggered, clearing pending')
      clearPendingScanAction()
    } else if (pendingScanAction && !isLoggedIn) {
      logger.debug(
        'ScanActionHandler: pending action waiting for authentication',
        {action: pendingScanAction.action},
      )
    }
  }, [pendingScanAction, isLoggedIn, triggerScanAction, clearPendingScanAction])

  return null
}
