import {linksYoroiParser, useLinks} from '@yoroi/links'
import {Scan} from '@yoroi/types'

import * as Linking from 'expo-linking'
import * as React from 'react'

import {parseScanAction} from '~/features/Scan/common/parsers'
import {isWebCardanoLink} from '~/features/Scan/common/triggerScanActionHelper'
import {logger} from '~/kernel/logger/logger'

export const useDeepLinkWatcher = () => {
  const {actionStarted} = useLinks()
  const [pendingScanAction, setPendingScanAction] =
    React.useState<Scan.Action | null>(null)

  const clearPendingScanAction = React.useCallback(() => {
    setPendingScanAction(null)
  }, [])

  const processLink = React.useCallback(
    (url: string) => {
      // Try Yoroi links first (yoroi://)
      const parsedAction = linksYoroiParser(url)
      if (parsedAction != null) {
        if (parsedAction.params?.isSandbox === true && __DEV__ === false) {
          logger.debug('useDeepLinkWatcher: link is sandboxed, ignored')
          return
        }
        logger.debug('useDeepLinkWatcher: parsedAction', {parsedAction})
        actionStarted({info: parsedAction, isTrusted: false})
        return
      }

      // Try web+cardano:// links
      if (isWebCardanoLink(url)) {
        try {
          const scanAction = parseScanAction(url)
          logger.debug('useDeepLinkWatcher: parsed web+cardano link', {
            action: scanAction.action,
          })
          // Store the action to be handled by a component that can use useTriggerScanAction
          setPendingScanAction(scanAction)
        } catch (error) {
          logger.debug('useDeepLinkWatcher: web+cardano link parsing failed', {
            error,
            url,
          })
        }
        return
      }

      logger.debug('useDeepLinkWatcher: link is malformated, ignored', {url})
    },
    [actionStarted],
  )

  React.useEffect(() => {
    const subscription = Linking.addEventListener('url', ({url}) => {
      if (url !== null) processLink(url)
    })
    return () => subscription?.remove()
  }, [processLink])

  // app is closed
  React.useEffect(() => {
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL()
      if (url !== null) processLink(url)
    }
    getInitialURL()
  }, [processLink])

  return {
    pendingScanAction,
    clearPendingScanAction,
  }
}
