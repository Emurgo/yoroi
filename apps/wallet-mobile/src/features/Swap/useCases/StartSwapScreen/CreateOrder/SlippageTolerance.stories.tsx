import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {SearchProvider} from '../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {SlippageTolerance} from './SlippageTolerance'

storiesOf('Swap SlippageTolerance section', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SearchProvider>
        <SwapProvider swapManager={mockSwapManager}>
          <SlippageTolerance />
        </SwapProvider>
      </SearchProvider>
    </SelectedWalletProvider>
  )
})
