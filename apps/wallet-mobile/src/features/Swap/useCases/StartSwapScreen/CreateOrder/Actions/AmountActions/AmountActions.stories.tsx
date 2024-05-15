import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {SearchProvider} from '../../../../../../../Search/SearchContext'
import {mocks} from '../../../../../../../yoroi-wallets/mocks/wallet'
import {SelectedWalletProvider} from '../../../../../../WalletManager/context/SelectedWalletContext'
import {SwapFormProvider} from '../../../../../common/SwapFormProvider'
import {AmountActions} from '../AmountActions/AmountActions'

storiesOf('Swap Amount Actions', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SearchProvider>
        <SwapProvider swapManager={mockSwapManager}>
          <SwapFormProvider>
            <View style={styles.container}>
              <AmountActions />
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
