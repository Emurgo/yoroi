import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../../../../../../../yoroi-wallets/mocks/wallet'
import {SelectedWalletProvider} from '../../../../../../WalletManager/Context'
import {SwapFormProvider} from '../../../../../common/SwapFormProvider'
import {OrderActions} from '../OrderActions/OrderActions'

storiesOf('Swap Top Action', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SwapProvider swapManager={mockSwapManager}>
        <SwapFormProvider>
          <View style={styles.container}>
            <OrderActions />
          </View>
        </SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
