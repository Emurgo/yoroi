import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {mocks} from '../../common/mocks'
import {SwapFormProvider} from '../../common/SwapFormProvider'
import {TransactionSummary} from './TransactionSummary'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

storiesOf('TransactionSummary', module) //
  .add('default', () => {
    return (
      <View style={styles.container}>
        <TxSummary />
      </View>
    )
  })

const TxSummary = () => {
  return (
    <SelectedWalletProvider wallet={{...walletMocks.wallet}}>
      <SwapProvider
        initialState={{
          ...mockSwapStateDefault,
          unsignedTx: walletMocks.yoroiUnsignedTx,
          orderData: {...mocks.confirmTx.orderData},
        }}
        swapManager={{
          ...mockSwapManager,
        }}
      >
        <SwapFormProvider>
          <TransactionSummary />
        </SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
