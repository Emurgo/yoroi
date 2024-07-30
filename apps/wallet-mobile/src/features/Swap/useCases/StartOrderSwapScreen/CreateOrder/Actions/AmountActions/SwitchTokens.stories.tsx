import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks} from '../../../../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SearchProvider} from '../../../../../../Search/SearchContext'
import {SwapFormProvider} from '../../../../../common/SwapFormProvider'
import {SwitchTokens} from './SwitchTokens'

storiesOf('Swap Switch Tokens', module).add('only enabled', () => {
  return (
    <WalletManagerProviderMock wallet={mocks.wallet}>
      <SearchProvider>
        <SwapProvider swapManager={mockSwapManager}>
          <SwapFormProvider>
            <View style={styles.container}>
              <SwitchTokens />
            </View>
          </SwapFormProvider>
        </SwapProvider>
      </SearchProvider>
    </WalletManagerProviderMock>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
