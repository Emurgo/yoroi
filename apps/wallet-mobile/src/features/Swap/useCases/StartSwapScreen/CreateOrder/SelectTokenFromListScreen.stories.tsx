import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {SearchProvider} from '../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {SelectTokenFromListScreen} from './SelectTokenFromListScreen'

storiesOf('Swap Select Token To Buy List', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SearchProvider>
        <SwapProvider swapManager={mockSwapManager}>
          <SelectTokenFromListScreen />
        </SwapProvider>
      </SearchProvider>
    </SelectedWalletProvider>
  )
})
