import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, TextInput, View} from 'react-native'

import {SearchProvider} from '../../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../../SelectedWallet'
import {mocks} from '../../../../../../yoroi-wallets/mocks/wallet'
import {SwapFormProvider} from '../../../../common/SwapFormProvider'
import {EditSellAmount} from './EditSellAmount'

storiesOf('Swap Edit Sell Amount', module)
  .add('default', () => {
    const inputRef = React.useRef<TextInput>(null)
    const [value, seValue] = React.useState('')

    return (
      <SelectedWalletProvider wallet={mocks.wallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager}>
            <SwapFormProvider>
              <View style={styles.container}>
                <EditSellAmount
                  value={value}
                  inputRef={inputRef}
                  onChange={(text) => {
                    seValue(text)
                    action('onChange')
                  }}
                />
              </View>
            </SwapFormProvider>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
  .add('with error', () => {
    const inputRef = React.useRef<TextInput>(null)
    const [value, seValue] = React.useState('')

    return (
      <SelectedWalletProvider wallet={mocks.wallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager}>
            <SwapFormProvider>
              <View style={styles.container}>
                <EditSellAmount
                  value={value}
                  inputRef={inputRef}
                  onChange={(text) => {
                    seValue(text)
                    action('onChange')
                  }}
                  error="Fake Error"
                />
              </View>
            </SwapFormProvider>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
