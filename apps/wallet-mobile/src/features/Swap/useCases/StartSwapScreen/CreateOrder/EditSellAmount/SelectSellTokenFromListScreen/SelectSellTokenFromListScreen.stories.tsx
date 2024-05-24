import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {mocks} from '../../../../../../../yoroi-wallets/mocks/wallet'
import {SearchProvider} from '../../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../../WalletManager/context/SelectedWalletContext'
import {SwapFormProvider} from '../../../../../common/SwapFormProvider'
import {SelectSellTokenFromListScreen} from './SelectSellTokenFromListScreen'

storiesOf('Swap Select Token To Sell', module)
  .add('initial', () => {
    return (
      <SelectedWalletProvider wallet={mocks.wallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager}>
            <SwapFormProvider>
              <SelectSellTokenFromListScreen />
            </SwapFormProvider>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
  .add('loading tokenInfo', () => {
    const loading = {
      ...mocks.wallet,
      fetchTokenInfo: mocks.fetchTokenInfo.loading,
    }
    return (
      <SelectedWalletProvider wallet={loading}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager}>
            <SwapFormProvider>
              <SelectSellTokenFromListScreen />
            </SwapFormProvider>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
