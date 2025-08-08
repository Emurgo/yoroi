import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Text} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {logger} from '~/kernel/logger/logger'
// import {useLaunchWalletAfterSyncing} from '~/features/WalletManager/hooks/useLaunchWalletAfterSyncing'
// import {useSyncTemporarilyPaused} from '~/features/WalletManager/hooks/useSyncTemporarilyPaused'
import {isEmptyString} from '~/wallets/utils/string'
import {useStrings} from '~/kernel/i18n/useStrings'

/**
 * It requests the global syncing to stop on mounting to favor the sync of a specific wallet
 * and resume the global syncing after the wallet is sync and the screen is unmounted.
 */
export const PreparingWalletScreen = () => {
  const strings = useStrings()
  const {walletId} = useSetupWallet()
  const {palette: p} = useTheme()
  // const isGlobalSyncPaused = useSyncTemporarilyPaused()
  // useLaunchWalletAfterSyncing({isGlobalSyncPaused, walletId})

  if (isEmptyString(walletId)) {
    const error = new Error(
      'PreparingWalletScreen: walletId is empty, reached an invalid state.',
    )
    logger.error(error)
    throw error
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom', 'top']}
      style={[
        a.flex_1,
        a.align_center,
        a.justify_center,
        {backgroundColor: p.bg_color_max},
      ]}
    >
      <Text style={[{color: p.primary_500}, a.text_center, a.heading_2_medium]}>
        {strings.setupWallet.preparingWallet}
      </Text>
    </SafeAreaView>
  )
}
