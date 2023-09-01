import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {SearchProvider} from '../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {SwapTouchedProvider} from '../CreateOrder/TouchedContext'
import {ListOrders} from './ListOrders'

storiesOf('Swap List orders', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SearchProvider>
        <SwapProvider swapManager={mockSwapManager}>
          <SwapTouchedProvider>
            <ListOrders />
          </SwapTouchedProvider>
        </SwapProvider>
      </SearchProvider>
    </SelectedWalletProvider>
  )
})
