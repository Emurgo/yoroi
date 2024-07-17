import {useSetupWallet} from '@yoroi/setup-wallet'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {logger} from '../../../../kernel/logger/logger'
import {isEmptyString} from '../../../../kernel/utils'
import {useLaunchWalletAfterSyncing} from '../../../WalletManager/common/hooks/useLaunchWalletAfterSyncing'
import {useSyncTemporarilyPaused} from '../../../WalletManager/common/hooks/useSyncTemporarilyPaused'
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
    const error = new Error('PreparingWalletScreen: walletId is empty, reached an invalid state.')
    logger.error(error)
    throw error
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom', 'top']} style={styles.root}>
      <Text style={styles.title}>{strings.preparingWallet}</Text>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.align_center,
      ...atoms.justify_center,
      backgroundColor: color.bg_color_high,
    },
    title: {
      color: color.primary_c500,
      ...atoms.text_center,
      ...atoms.heading_2_medium,
    },
  })
  return {styles} as const
}
