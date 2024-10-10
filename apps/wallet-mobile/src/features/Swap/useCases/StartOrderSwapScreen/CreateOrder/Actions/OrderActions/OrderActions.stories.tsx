import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../../../../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SwapFormProvider} from '../../../../../common/SwapFormProvider'
import {OrderActions} from './OrderActions'

storiesOf('Swap Top Action', module).add('initial', () => {
  return (
    <WalletManagerProviderMock wallet={mocks.wallet}>
      <SwapProvider swapManager={mockSwapManager}>
        <SwapFormProvider>
          <View style={styles.container}>
            <OrderActions />
          </View>
        </SwapFormProvider>
      </SwapProvider>
    </WalletManagerProviderMock>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
