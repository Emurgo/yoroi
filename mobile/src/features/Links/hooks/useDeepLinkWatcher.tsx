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
  const {
    pendingScanAction,
    setPendingScanAction,
  } = usePendingScanAction()

  const processLink = React.useCallback(
    (url: string) => {
      logger.debug('useDeepLinkWatcher: processLink called', {url})
      
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
      const isWebCardano = isWebCardanoLink(url)
      logger.debug('useDeepLinkWatcher: checking if web+cardano link', {
        url,
        isWebCardano,
      })
      
      if (isWebCardano) {
        try {
          logger.debug('useDeepLinkWatcher: parsing web+cardano link', {url})
          const scanAction = parseScanAction(url)
          logger.debug('useDeepLinkWatcher: parsed web+cardano link successfully', {
            action: scanAction.action,
            scanAction,
          })
          
          // Security: If user is not logged in, store action in context to process after PIN
          if (!isLoggedIn) {
            logger.debug(
              'useDeepLinkWatcher: user not logged in, storing action in context',
              {action: scanAction.action, url, urlLength: url.length},
            )
            // Store in context - will be processed by ScanActionHandler after login
            setPendingScanAction(scanAction)
            return
          }
          
          // User is logged in, process immediately
          logger.debug('useDeepLinkWatcher: user logged in, setting pending action', {
            action: scanAction.action,
          })
          setPendingScanAction(scanAction)
        } catch (error) {
          logger.debug('useDeepLinkWatcher: web+cardano link parsing failed', {
            error,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
            url,
          })
        }
        return
      }

      logger.debug('useDeepLinkWatcher: link is malformated, ignored', {url})
    },
    [actionStarted, isLoggedIn, setPendingScanAction],
  )

  React.useEffect(() => {
    logger.debug('useDeepLinkWatcher: setting up URL listener')
    const subscription = Linking.addEventListener('url', ({url}) => {
      logger.debug('useDeepLinkWatcher: URL event received', {
        url,
        urlLength: url?.length,
        urlEncoded: url ? encodeURIComponent(url) : null,
      })
      if (url !== null) {
        logger.debug('useDeepLinkWatcher: processing URL from event', {
          url,
          urlLength: url.length,
          hasQueryParams: url.includes('?'),
          queryParamsCount: url.split('&').length - 1,
        })
        processLink(url)
      } else {
        logger.debug('useDeepLinkWatcher: URL event received but url is null')
      }
    })
    return () => {
      logger.debug('useDeepLinkWatcher: removing URL listener')
      subscription?.remove()
    }
  }, [processLink])

  // app is closed - check initial URL on mount
  React.useEffect(() => {
    logger.debug('useDeepLinkWatcher: checking initial URL')
    const getInitialURL = async () => {
      const url = await Linking.getInitialURL()
      logger.debug('useDeepLinkWatcher: initial URL retrieved', {url})
      if (url !== null) {
        logger.debug('useDeepLinkWatcher: processing initial URL', {url})
        processLink(url)
      } else {
        logger.debug('useDeepLinkWatcher: no initial URL found')
      }
    }
    getInitialURL()
  }, [processLink])

  // After login, check getInitialURL in case URL was received before login (app restart scenario)
  React.useEffect(() => {
    logger.debug('useDeepLinkWatcher: login state changed', {isLoggedIn})
    if (!isLoggedIn) {
      logger.debug('useDeepLinkWatcher: user not logged in, skipping URL check')
      return
    }

    // If context already has a pending action, ScanActionHandler will process it
    // Otherwise, check getInitialURL for app restart scenarios
    if (pendingScanAction) {
      logger.debug('useDeepLinkWatcher: pending action already in context, ScanActionHandler will process it', {
        action: pendingScanAction.action,
      })
      return
    }

    logger.debug('useDeepLinkWatcher: user logged in, checking getInitialURL for pending URL')
    const checkInitialUrlAfterLogin = async () => {
      const url = await Linking.getInitialURL()
      logger.debug('useDeepLinkWatcher: initial URL after login', {
        url,
        hasUrl: !!url,
        isWebCardano: url ? isWebCardanoLink(url) : false,
      })
      
      if (url !== null && isWebCardanoLink(url)) {
        logger.debug(
          'useDeepLinkWatcher: found web+cardano URL after login, processing',
          {url, urlLength: url.length},
        )
        try {
          const scanAction = parseScanAction(url)
          logger.debug(
            'useDeepLinkWatcher: parsed web+cardano link after login successfully',
            {action: scanAction.action, scanAction},
          )
          logger.debug('useDeepLinkWatcher: setting pending scan action from initial URL')
          setPendingScanAction(scanAction)
        } catch (error) {
          logger.debug(
            'useDeepLinkWatcher: error parsing URL after login',
            {
              error,
              errorMessage: error instanceof Error ? error.message : String(error),
              errorStack: error instanceof Error ? error.stack : undefined,
              url,
            },
          )
        }
      } else {
        logger.debug('useDeepLinkWatcher: no valid initial URL found after login')
      }
    }
    checkInitialUrlAfterLogin()
  }, [isLoggedIn, pendingScanAction, setPendingScanAction])
}
