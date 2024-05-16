import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {QueryProvider} from '../../../../../../.storybook/decorators'
import {SearchProvider} from '../../../../../Search/SearchContext'
import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {SelectedWalletProvider} from '../../../../WalletManager/Context/SelectedWalletContext'
import {SwapFormProvider} from '../../../common/SwapFormProvider'
import {ListOrders} from './ListOrders'

storiesOf('Swap List orders', module)
  .add('Default', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <SearchProvider>
            <SwapProvider swapManager={mockSwapManager}>
              <SwapFormProvider>
                <ListOrders />
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
                    byStatusOpen: () => new Promise(() => undefined),
                    byStatusCompleted: () => new Promise(() => undefined),
                  },
                },
              }}
            >
              <SwapFormProvider>
                <ListOrders />
              </SwapFormProvider>
            </SwapProvider>
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
