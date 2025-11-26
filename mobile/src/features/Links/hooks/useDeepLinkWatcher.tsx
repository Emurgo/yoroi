import {PendingAction, linksYoroiParser, useLinks} from '@yoroi/links'

import * as Linking from 'expo-linking'
import * as React from 'react'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {isWebCardanoLink} from '~/features/Links/common/helpers'
import {parseCardanoLink} from '~/features/Links/common/parsers'
import {logger} from '~/kernel/logger/logger'

export const useDeepLinkWatcher = () => {
  const {isLoggedIn} = useAuth()
  const {pendingAction, setPendingAction} = useLinks()

  const processLink = React.useCallback(
    (url: string) => {
      // Try Yoroi links first (yoroi://)
      const parsedYoroiAction = linksYoroiParser(url)
      if (parsedYoroiAction != null) {
        if (parsedYoroiAction.params?.isSandbox === true && __DEV__ === false) {
          return
        }
        // Store Yoroi action in pending action context
        const pendingAction: PendingAction = {
          source: 'yoroi',
          action: {info: parsedYoroiAction, isTrusted: false},
        }
        setPendingAction(pendingAction)
        return
      }

      // Try web+cardano:// links
      const isWebCardano = isWebCardanoLink(url)

      if (isWebCardano) {
        try {
          const cardanoAction = parseCardanoLink(url)
          // Store Cardano action in pending action context
          const pendingAction: PendingAction = {
            source: 'cardano',
            action: cardanoAction,
          }
          setPendingAction(pendingAction)
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
    [setPendingAction],
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

    // If context already has a pending action, ActionHandler will process it
    // Otherwise, check getInitialURL for app restart scenarios
    if (pendingAction) {
      return
    }

    const checkInitialUrlAfterLogin = async () => {
      const url = await Linking.getInitialURL()

      if (url !== null) {
        // Try both Yoroi and Cardano links
        const parsedYoroiAction = linksYoroiParser(url)
        if (parsedYoroiAction != null) {
          if (
            parsedYoroiAction.params?.isSandbox === true &&
            __DEV__ === false
          ) {
            return
          }
          const pendingAction: PendingAction = {
            source: 'yoroi',
            action: {info: parsedYoroiAction, isTrusted: false},
          }
          setPendingAction(pendingAction)
          return
        }

        if (isWebCardanoLink(url)) {
          try {
            const cardanoAction = parseCardanoLink(url)
            const pendingAction: PendingAction = {
              source: 'cardano',
              action: cardanoAction,
            }
            setPendingAction(pendingAction)
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
    }
    checkInitialUrlAfterLogin()
  }, [isLoggedIn, pendingAction, setPendingAction, processLink])
}
