import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useLaunchWalletAfterSyncing} from '~/features/WalletManager/hooks/useLaunchWalletAfterSyncing'
import {useSyncTemporarilyPaused} from '~/features/WalletManager/hooks/useSyncTemporarilyPaused'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Space} from '~/ui/Space/Space'
import {isEmptyString} from '~/wallets/utils/string'

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
  const isGlobalSyncPaused = useSyncTemporarilyPaused()
  const [shouldNavigateAfterSync, setShouldNavigateAfterSync] =
    React.useState(true)
  const [showBackgroundButton, setShowBackgroundButton] = React.useState(false)

  useLaunchWalletAfterSyncing({
    isGlobalSyncPaused,
    walletId,
    shouldNavigateAfterSync,
  })

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
