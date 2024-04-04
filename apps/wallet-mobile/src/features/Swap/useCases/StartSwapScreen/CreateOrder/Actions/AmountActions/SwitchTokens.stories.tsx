import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {SearchProvider} from '../../../../../../../Search/SearchContext'
import {mocks} from '../../../../../../../yoroi-wallets/mocks/wallet'
import {SelectedWalletProvider} from '../../../../../../AddWallet/common/Context'
import {SwapFormProvider} from '../../../../../common/SwapFormProvider'
import {SwitchTokens} from '../AmountActions/SwitchTokens'

storiesOf('Swap Switch Tokens', module).add('only enabled', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SearchProvider>
        <SwapProvider swapManager={mockSwapManager}>
          <SwapFormProvider>
            <View style={styles.container}>
              <SwitchTokens />
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
