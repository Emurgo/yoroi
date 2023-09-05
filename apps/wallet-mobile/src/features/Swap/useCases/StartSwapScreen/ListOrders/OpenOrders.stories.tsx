import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {SearchProvider} from '../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {SwapTouchedProvider} from '../CreateOrder/TouchedContext'
import {getMockOpenOrder} from './mocks'
import {OpenOrders} from './OpenOrders'

storiesOf('Swap Open orders', module).add('initial', () => {
  const orders = getMockOpenOrder()
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SearchProvider>
        <SwapProvider swapManager={mockSwapManager}>
          <SwapTouchedProvider>
            <OpenOrders orders={orders} />
          </SwapTouchedProvider>
        </SwapProvider>
      </SearchProvider>
    </SelectedWalletProvider>
  )
})
