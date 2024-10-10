import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {QueryProvider} from '../../../../../../.storybook/decorators'
import {Boundary} from '../../../../../components/Boundary/Boundary'
import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SearchProvider} from '../../../../Search/SearchContext'
import {SwapFormProvider} from '../../../common/SwapFormProvider'
import {OpenOrders, OpenOrdersSkeleton} from './OpenOrders'

storiesOf('Swap Open orders', module)
  .add('Default', () => {
    return (
      <QueryProvider>
        <WalletManagerProviderMock wallet={mocks.wallet}>
          <SearchProvider>
            <SwapProvider swapManager={mockSwapManager}>
              <SwapFormProvider>
                <OpenOrders />
              </SwapFormProvider>
            </SwapProvider>
          </SearchProvider>
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })
  .add('Loading', () => {
    return (
      <QueryProvider>
        <WalletManagerProviderMock wallet={mocks.wallet}>
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
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })
