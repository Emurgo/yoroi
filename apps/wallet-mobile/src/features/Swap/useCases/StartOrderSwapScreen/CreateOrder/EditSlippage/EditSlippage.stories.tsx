import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, SwapProvider} from '@yoroi/swap'
import {produce} from 'immer'
import React from 'react'

import {mocks} from '../../../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SearchProvider} from '../../../../../Search/SearchContext'
import {SwapFormProvider} from '../../../../common/SwapFormProvider'
import {EditSlippage} from './EditSlippage'

storiesOf('Swap Edit Slippage', module)
  .add('initial %', () => {
    return (
      <WalletManagerProviderMock wallet={mocks.wallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager}>
            <SwapFormProvider>
              <EditSlippage />
            </SwapFormProvider>
          </SwapProvider>
        </SearchProvider>
      </WalletManagerProviderMock>
    )
  })
  .add('big %', () => {
    const mockSwapStateBigSlippage = produce(mockSwapStateDefault, (draft) => {
      draft.orderData.slippage = 99.123456789
    })
    return (
      <WalletManagerProviderMock wallet={mocks.wallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager} initialState={mockSwapStateBigSlippage}>
            <SwapFormProvider>
              <EditSlippage />
            </SwapFormProvider>
          </SwapProvider>
        </SearchProvider>
      </WalletManagerProviderMock>
    )
  })
