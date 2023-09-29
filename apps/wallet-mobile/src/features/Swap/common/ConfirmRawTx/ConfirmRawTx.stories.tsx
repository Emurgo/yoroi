import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {mocks} from '../mocks'
import {SwapFormProvider} from '../SwapFormProvider'
import {ConfirmRawTx} from './ConfirmRawTx'

storiesOf('ConfirmRawTx', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('ConfirmRawTxWithPassword', () => (
    <Provider wallet={walletMocks.wallet}>
      <ConfirmRawTx />
    </Provider>
  ))
  .add('ConfirmRawTxWithOs', () => (
    <Provider wallet={{...walletMocks.wallet, isEasyConfirmationEnabled: true}}>
      <ConfirmRawTx />
    </Provider>
  ))
  .add('ConfirmRawTxWithHw', () => (
    <Provider wallet={{...walletMocks.wallet, isHW: true}}>
      <ConfirmRawTx />
    </Provider>
  ))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

const Provider = ({children, wallet}: {children: React.ReactNode; wallet: YoroiWallet}) => {
  return (
    <SelectedWalletProvider wallet={wallet}>
      <SwapProvider
        initialState={{
          ...mockSwapStateDefault,
          unsignedTx: walletMocks.yoroiUnsignedTx,
          createOrder: {...mocks.confirmTx.createOrder},
        }}
        swapManager={{
          ...mockSwapManager,
        }}
      >
        <SwapFormProvider>{children}</SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}
