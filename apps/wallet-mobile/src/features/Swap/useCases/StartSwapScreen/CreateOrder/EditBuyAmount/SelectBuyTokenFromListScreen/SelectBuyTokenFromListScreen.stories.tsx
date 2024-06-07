import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {mocks} from '../../../../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SearchProvider} from '../../../../../../Search/SearchContext'
import {SwapFormProvider} from '../../../../../common/SwapFormProvider'
import {SelectBuyTokenFromListScreen} from './SelectBuyTokenFromListScreen'

storiesOf('Swap Select Token To Buy', module)
  .add('initial', () => {
    return (
      <WalletManagerProviderMock wallet={mocks.wallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager}>
            <SwapFormProvider>
              <SelectBuyTokenFromListScreen />
            </SwapFormProvider>
          </SwapProvider>
        </SearchProvider>
      </WalletManagerProviderMock>
    )
  })
  .add('loading tokenInfo', () => {
    const loading = {
      ...mocks.wallet,
      fetchTokenInfo: mocks.fetchTokenInfo.loading,
    }
    return (
      <WalletManagerProviderMock wallet={loading}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager}>
            <SwapFormProvider>
              <SelectBuyTokenFromListScreen />
            </SwapFormProvider>
          </SwapProvider>
        </SearchProvider>
      </WalletManagerProviderMock>
    )
  })
