import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {logger} from '../../../../kernel/logger/logger'
import {isEmptyString} from '../../../../wallets/utils/string'
import {useLaunchWalletAfterSyncing} from '../../../WalletManager/hooks/useLaunchWalletAfterSyncing'
import {useSyncTemporarilyPaused} from '../../../WalletManager/hooks/useSyncTemporarilyPaused'
import {useStrings} from '../useStrings'

/**
 * It requests the global syncing to stop on mounting to favor the sync of a specific wallet
 * and resume the global syncing after the wallet is sync and the screen is unmounted.
 */
export const PreparingWalletScreen = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const {walletId} = useSetupWallet()
  const isGlobalSyncPaused = useSyncTemporarilyPaused()
  useLaunchWalletAfterSyncing({isGlobalSyncPaused, walletId})

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
      style={styles.root}
    >
      <Text style={styles.title}>{strings.preparingWallet}</Text>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {palette: p} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...a.flex_1,
      ...a.align_center,
      ...a.justify_center,
      backgroundColor: p.bg_color_max,
    },
    title: {
      color: p.primary_500,
      ...a.text_center,
      ...a.heading_2_medium,
    },
  })
  return {styles} as const
}
