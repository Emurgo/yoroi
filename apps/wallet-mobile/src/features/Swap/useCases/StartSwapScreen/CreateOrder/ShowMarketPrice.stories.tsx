import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks'
import {ShowMarketPrice} from './ShowMarketPrice'
import {SwapFormProvider} from './TouchedContext'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

storiesOf('Swap Show Market Price', module)
  .addDecorator((story) => (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SwapFormProvider>
        <View style={styles.container}>{story()}</View>
      </SwapFormProvider>
    </SelectedWalletProvider>
  ))
  .add('Default', () => <ShowMarketPrice />)
