import * as React from 'react'
import {AppState, AppStateStatus, InteractionManager} from 'react-native'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {isAndroid} from '~/kernel/constants'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'

import {pushNotificationsManager} from './notification-manager'
import {
  handleNotificationInternalNavigationAction,
  shouldHandleNotificationInternalNavigationAction,
} from './tools'

export const PushNotificationNavigationHandler = () => {
  const walletNavigation = useWalletNavigation()
  const {selected} = useWalletManager()
  const isCheckingRef = React.useRef(false)

  React.useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState !== 'active' || isCheckingRef.current) return

      isCheckingRef.current = true

      try {
        const delay = isAndroid ? 3000 : 500
        await new Promise((resolve) => setTimeout(resolve, delay))

        const shouldHandle =
          await shouldHandleNotificationInternalNavigationAction()

        if (shouldHandle && selected.wallet?.id) {
          await new Promise((resolve) =>
            setTimeout(resolve, isAndroid ? 300 : 0),
          )
          InteractionManager.runAfterInteractions(async () => {
            await handleNotificationInternalNavigationAction(
              pushNotificationsManager,
              walletNavigation,
            )
          })
        }
      } finally {
        isCheckingRef.current = false
      }
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    )

    return () => subscription.remove()
  }, [walletNavigation, selected.wallet?.id])

  return null
}
