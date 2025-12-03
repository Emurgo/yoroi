import {useWalletManager} from '@yoroi/wallet-manager/context/WalletManagerProvider'

import * as React from 'react'
import {AppState, AppStateStatus, InteractionManager} from 'react-native'

import {isAndroid} from '~/kernel/constants'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'

import {pushNotificationsManager} from './notification-manager'
import {
  handleNotificationInternalNavigationAction,
  shouldHandleNotificationInternalNavigationAction,
} from './tools'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const runAfterInteractions = (callback: () => Promise<void>): Promise<void> => {
  return new Promise<void>((resolve) => {
    InteractionManager.runAfterInteractions(async () => {
      try {
        await callback()
      } finally {
        resolve()
      }
    })
  })
}

export const PushNotificationNavigationHandler = () => {
  const walletNavigation = useWalletNavigation()
  const {selected} = useWalletManager()
  const isCheckingRef = React.useRef(false)

  React.useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState !== 'active' || isCheckingRef.current) return

      isCheckingRef.current = true

      try {
        const initialDelay = isAndroid ? 3000 : 500
        await delay(initialDelay)

        const shouldHandle =
          await shouldHandleNotificationInternalNavigationAction()

        if (!shouldHandle || !selected.wallet?.id) return

        if (isAndroid) await delay(300)

        await runAfterInteractions(async () => {
          await handleNotificationInternalNavigationAction(
            pushNotificationsManager,
            walletNavigation,
          )
        })
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
