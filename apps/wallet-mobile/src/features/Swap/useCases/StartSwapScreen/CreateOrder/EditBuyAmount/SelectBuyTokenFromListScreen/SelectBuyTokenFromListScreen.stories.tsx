import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {SearchProvider} from '../../../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../../../SelectedWallet'
import {mocks} from '../../../../../../../yoroi-wallets/mocks/wallet'
import {SelectBuyTokenFromListScreen} from './SelectBuyTokenFromListScreen'

storiesOf('Swap Select Token To Buy', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SearchProvider>
        <SwapProvider swapManager={mockSwapManager}>
          <SelectBuyTokenFromListScreen />
        </SwapProvider>
      </SearchProvider>
    </SelectedWalletProvider>
  )
})
