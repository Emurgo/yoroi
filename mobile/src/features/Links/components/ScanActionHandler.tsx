/**
 * ScanActionHandler Component
 *
 * Handles scan actions from web+cardano:// deep links.
 * Consumes pendingScanAction from useDeepLinkWatcher and triggers
 * the appropriate action using useTriggerScanAction.
 */
import * as React from 'react'

import {useTriggerScanAction} from '~/features/Scan/common/useTriggerScanAction'

import {useDeepLinkWatcher} from '../hooks/useDeepLinkWatcher'

export const ScanActionHandler = () => {
  const {pendingScanAction, clearPendingScanAction} = useDeepLinkWatcher()
  const triggerScanAction = useTriggerScanAction({insideFeature: 'scan'})

  React.useEffect(() => {
    if (pendingScanAction) {
      triggerScanAction(pendingScanAction)
      clearPendingScanAction()
    }
  }, [pendingScanAction, triggerScanAction, clearPendingScanAction])

  return null
}
