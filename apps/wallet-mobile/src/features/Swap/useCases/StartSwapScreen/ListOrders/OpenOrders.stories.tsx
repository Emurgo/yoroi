import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {QueryProvider} from '../../../../../../.storybook/decorators'
import {Boundary} from '../../../../../components'
import {SearchProvider} from '../../../../../Search/SearchContext'
import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {SelectedWalletProvider} from '../../../../SelectedWallet/Context'
import {SwapFormProvider} from '../../../common/SwapFormProvider'
import {OpenOrders, OpenOrdersSkeleton} from './OpenOrders'

storiesOf('Swap Open orders', module)
  .add('Default', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <SearchProvider>
            <SwapProvider swapManager={mockSwapManager}>
              <SwapFormProvider>
                <OpenOrders />
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
                  },
                },
              }}
            >
              <SwapFormProvider>
                <Boundary loading={{fallback: <OpenOrdersSkeleton />}}>
                  <OpenOrders />
                </Boundary>
              </SwapFormProvider>
            </SwapProvider>
          </SearchProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
