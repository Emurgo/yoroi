import {linksYoroiParser, useLinks} from '@yoroi/links'

import * as Linking from 'expo-linking'
import * as React from 'react'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {usePendingScanAction} from '~/features/Links/context/PendingScanActionContext'
import {parseScanAction} from '~/features/Scan/common/parsers'
import {isWebCardanoLink} from '~/features/Scan/common/triggerScanActionHelper'
import {logger} from '~/kernel/logger/logger'

export const useDeepLinkWatcher = () => {
  const {actionStarted} = useLinks()
  const {isLoggedIn} = useAuth()
  const {pendingScanAction, setPendingScanAction} = usePendingScanAction()

  const processLink = React.useCallback(
    (url: string) => {
      // Try Yoroi links first (yoroi://)
      const parsedAction = linksYoroiParser(url)
      if (parsedAction != null) {
        if (parsedAction.params?.isSandbox === true && __DEV__ === false) {
          return
        }
        actionStarted({info: parsedAction, isTrusted: false})
        return
      }

      // Try web+cardano:// links
      const isWebCardano = isWebCardanoLink(url)

      if (isWebCardano) {
        try {
          const scanAction = parseScanAction(url)

          // Security: If user is not logged in, store action in context to process after PIN
          if (!isLoggedIn) {
            // Store in context - will be processed by ScanActionHandler after login
            setPendingScanAction(scanAction)
            return
          }

          // User is logged in, process immediately
          setPendingScanAction(scanAction)
        } catch (error) {
          logger.error('useDeepLinkWatcher: web+cardano link parsing failed', {
            error,
            errorMessage:
              error instanceof Error ? error.message : String(error),
            url,
          })
        }
        return
      }
    },
    [actionStarted, isLoggedIn, setPendingScanAction],
  )

  React.useEffect(() => {
    const subscription = Linking.addEventListener('url', ({url}) => {
      if (url !== null) {
        processLink(url)
      }
    })
    return () => {
      subscription?.remove()
    }
  }, [processLink])

  // app is closed - check initial URL on mount
  React.useEffect(() => {
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL()
      if (url !== null) {
        processLink(url)
      }
    }
    getInitialURL()
  }, [processLink])

  // After login, check getInitialURL in case URL was received before login (app restart scenario)
  React.useEffect(() => {
    if (!isLoggedIn) {
      return
    }

    // If context already has a pending action, ScanActionHandler will process it
    // Otherwise, check getInitialURL for app restart scenarios
    if (pendingScanAction) {
      return
    }

    const checkInitialUrlAfterLogin = async () => {
      const url = await Linking.getInitialURL()

      if (url !== null && isWebCardanoLink(url)) {
        try {
          const scanAction = parseScanAction(url)
          setPendingScanAction(scanAction)
        } catch (error) {
          logger.error('useDeepLinkWatcher: error parsing URL after login', {
            error,
            errorMessage:
              error instanceof Error ? error.message : String(error),
            url,
          })
        }
      }
    }
    checkInitialUrlAfterLogin()
  }, [isLoggedIn, pendingScanAction, setPendingScanAction])
}
