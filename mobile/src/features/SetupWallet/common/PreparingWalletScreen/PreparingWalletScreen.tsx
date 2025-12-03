import {isEmptyString} from '@yoroi/cardano-wallet/utils/string'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useWalletManager} from '@yoroi/wallet-manager/context/WalletManagerProvider'
import {useLaunchWalletAfterSyncing} from '@yoroi/wallet-manager/hooks/useLaunchWalletAfterSyncing'
import {useSyncTemporarilyPaused} from '@yoroi/wallet-manager/hooks/useSyncTemporarilyPaused'

import * as React from 'react'
import {Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useAuth} from '~/features/Auth/context/AuthProvider'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'

/**
 * It requests the global syncing to stop on mounting to favor the sync of a specific wallet
 * and resume the global syncing after the wallet is sync and the screen is unmounted.
 */
export const PreparingWalletScreen = () => {
  const strings = useStrings()
  const {walletId} = useSetupWallet()
  const {atoms: ta} = useTheme()
  const {walletManager} = useWalletManager()
  const walletNavigation = useWalletNavigation()
  const {isLoggedIn} = useAuth()
  const isGlobalSyncPaused = useSyncTemporarilyPaused()
  const [shouldNavigateAfterSync, setShouldNavigateAfterSync] =
    React.useState(true)
  const [showBackgroundButton, setShowBackgroundButton] = React.useState(false)

  // Only start wallet sync if user is logged in
  // Wallet restoration should not proceed until user is authenticated
  useLaunchWalletAfterSyncing({
    isGlobalSyncPaused: isGlobalSyncPaused && isLoggedIn,
    walletId: isLoggedIn ? walletId : null,
    shouldNavigateAfterSync,
  })

  // If user is not logged in, show message and wait for login
  React.useEffect(() => {
    if (!isLoggedIn && walletId) {
      logger.debug(
        'PreparingWalletScreen: User not logged in, waiting for login before starting wallet restoration',
        {walletId},
      )
    }
  }, [isLoggedIn, walletId])

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowBackgroundButton(true)
    }, 8000) // 8 seconds

    return () => clearTimeout(timer)
  }, [])

  const handleBackgroundSync = () => {
    // Resume global syncing immediately
    walletManager.resumeSyncing()
    // Prevent navigation after sync completes
    setShouldNavigateAfterSync(false)
    // Navigate to wallet selection
    walletNavigation.resetToWalletSelection()
  }

  if (isEmptyString(walletId)) {
    const error = new Error(
      'PreparingWalletScreen: walletId is empty, reached an invalid state.',
    )
    logger.error(error)
    throw error
  }

  // If user is not logged in, show message that login is required
  if (!isLoggedIn) {
    return (
      <SafeAreaView
        style={[a.flex_1, a.align_center, a.justify_center, ta.bg_color_max]}
      >
        <View style={[a.align_center, a.justify_center, a.px_lg]}>
          <Text
            style={[ta.text_primary_max, a.text_center, a.heading_2_medium]}
          >
            {strings.setupWallet.preparingWallet}
          </Text>
          <Space.Height.lg />
          <Text style={[ta.text_gray_max, a.text_center, a.body_1_lg_regular]}>
            Please log in to continue wallet restoration
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      style={[a.flex_1, a.align_center, a.justify_center, ta.bg_color_max]}
    >
      <View style={[a.align_center, a.justify_center]}>
        <Text style={[ta.text_primary_max, a.text_center, a.heading_2_medium]}>
          {strings.setupWallet.preparingWallet}
        </Text>

        {showBackgroundButton && (
          <>
            <Space.Height.lg />
            <Button
              title={strings.setupWallet.continueInBackground}
              type={ButtonType.Secondary}
              onPress={handleBackgroundSync}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  )
}
