import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks'
import {ExchangeProvider} from '../../../common/ExchangeProvider'
import {mockExchangeStateDefault} from '../../../common/mocks'
import {SelectBuyOrSell} from './SelectBuyOrSell'

const Wrapper = ({children}: ViewProps) => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <ExchangeProvider initialState={mockExchangeStateDefault}>
      <View style={styles.container}>{children}</View>
    </ExchangeProvider>
  </SelectedWalletProvider>
)

storiesOf('Exchange SelectBuyOrSell', module)
  .addDecorator((story) => <Wrapper>{story()}</Wrapper>)
  .add('initial', () => <SelectBuyOrSell />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
