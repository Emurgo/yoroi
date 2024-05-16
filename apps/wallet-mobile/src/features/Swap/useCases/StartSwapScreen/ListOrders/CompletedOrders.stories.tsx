import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {QueryProvider} from '../../../../../../.storybook/decorators'
import {Boundary} from '../../../../../components'
import {SearchProvider} from '../../../../../Search/SearchContext'
import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {SelectedWalletProvider} from '../../../../WalletManager/Context/SelectedWalletContext'
import {SwapFormProvider} from '../../../common/SwapFormProvider'
import {CompletedOrders, CompletedOrdersSkeleton} from './CompletedOrders'

storiesOf('Swap Completed orders', module)
  .add('Default', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <SearchProvider>
            <SwapProvider swapManager={mockSwapManager}>
              <SwapFormProvider>
                <CompletedOrders />
              </SwapFormProvider>
            </SwapProvider>
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('Loading', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <SearchProvider>
            <SwapProvider
              swapManager={{
                ...mockSwapManager,
                order: {
                  ...mockSwapManager.order,
                  list: {
                    ...mockSwapManager.order.list,
                    byStatusCompleted: () => new Promise(() => undefined),
                  },
                },
              }}
            >
              <SwapFormProvider>
                <Boundary loading={{fallback: <CompletedOrdersSkeleton />}}>
                  <CompletedOrders />
                </Boundary>
              </SwapFormProvider>
            </SwapProvider>
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
