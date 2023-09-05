import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks'
import {EditLimitPrice} from './EditLimitPrice'
import {SwapTouchedProvider} from './TouchedContext'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

storiesOf('Swap Edit Limit Price', module)
  .addDecorator((story) => (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SwapTouchedProvider>
        <View style={styles.container}>{story()}</View>
      </SwapTouchedProvider>
    </SelectedWalletProvider>
  ))
  .add('Default', () => <EditLimitPrice />)
