import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, swapManagerMocks, SwapProvider} from '@yoroi/swap'
import {Swap} from '@yoroi/types'
import React from 'react'

import {SearchProvider} from '../../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../../SelectedWallet'
import {mocks} from '../../../../../../yoroi-wallets/mocks/wallet'
import {OpenOrders} from './OpenOrders'

storiesOf('Swap Open orders', module)
  .add('initial', () => {
    return (
      <SelectedWalletProvider wallet={mocks.wallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager}>
            <OpenOrders />
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
  .add('loading', () => {
    const loadingSwapManager = {
      ...mockSwapManager,
      order: {
        ...mockSwapManager.order,
        list: {
          ...mockSwapManager.order.list,
          byStatusOpen: swapManagerMocks.getOrders.loading,
        },
      },
    }
    return (
      <SelectedWalletProvider wallet={mocks.wallet}>
        <SearchProvider>
          <SwapProvider swapManager={loadingSwapManager as Swap.Manager}>
            <OpenOrders />
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
