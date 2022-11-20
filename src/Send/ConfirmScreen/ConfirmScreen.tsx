import {RouteProp, useRoute} from '@react-navigation/native'
import React from 'react'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary, StatusBar} from '../../components'
import {ConfirmTx} from '../../components/ConfirmTx'
import {TxHistoryRoutes, useWalletNavigation} from '../../navigation'
import {useSelectedWallet} from '../../SelectedWallet'
import {COLORS} from '../../theme'
import {useSend} from '../Context/SendContext'
import {TransferSummary} from './TransferSummary'

export const ConfirmScreen = () => {
  const {yoroiUnsignedTx} = useRoute<RouteProp<TxHistoryRoutes, 'send-confirm'>>().params
  const {resetToTxHistory} = useWalletNavigation()
  const wallet = useSelectedWallet()
  const {resetForm} = useSend()

  const onSuccess = () => {
    resetToTxHistory()
    resetForm()
  }

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.root}>
      <StatusBar type="light" />

      <Boundary>
        <TransferSummary unsignedTx={yoroiUnsignedTx} wallet={wallet} />

        <ConfirmTx onSuccess={onSuccess} unsignedTx={yoroiUnsignedTx} wallet={wallet} />
      </Boundary>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: COLORS.WHITE,
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
})
