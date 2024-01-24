import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks'
import {mockExchangeStateDefault} from '../../../common/mocks'
import {RampOnOffProvider} from '../../../common/RampOnOffProvider'
import {SelectBuyOrSell} from './SelectBuyOrSell'

const Wrapper = ({children}: ViewProps) => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <RampOnOffProvider initialState={mockExchangeStateDefault}>
      <View style={styles.container}>{children}</View>
    </RampOnOffProvider>
  </SelectedWalletProvider>
)

storiesOf('RampOnOff SelectBuyOrSell', module)
  .addDecorator((story) => <Wrapper>{story()}</Wrapper>)
  .add('initial', () => <SelectBuyOrSell />)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
