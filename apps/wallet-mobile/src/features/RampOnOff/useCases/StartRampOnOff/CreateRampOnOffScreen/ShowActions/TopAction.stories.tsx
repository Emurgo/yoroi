import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {SelectedWalletProvider} from '../../../../../../SelectedWallet'
import {mocks} from '../../../../../../yoroi-wallets/mocks'
import {mockExchangeStateDefault} from '../../../../common/mocks'
import {RampOnOffProvider} from '../../../../common/RampOnOffProvider'
import {TopActions} from './TopActions'

storiesOf('Top Action For RampOnOff', module).add('initial - message', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <RampOnOffProvider initialState={mockExchangeStateDefault}>
        <View style={styles.container}>
          <TopActions />
        </View>
      </RampOnOffProvider>
    </SelectedWalletProvider>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
