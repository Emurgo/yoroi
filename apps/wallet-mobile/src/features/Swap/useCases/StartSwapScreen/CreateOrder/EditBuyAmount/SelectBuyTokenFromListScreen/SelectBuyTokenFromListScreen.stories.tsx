import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, SwapProvider} from '@yoroi/swap'
import React from 'react'

import {SearchProvider} from '../../../../../../../Search/SearchContext'
import {SelectedWalletProvider} from '../../../../../../../SelectedWallet'
import {mocks} from '../../../../../../../yoroi-wallets/mocks/wallet'
import {SwapTouchedProvider} from '../../TouchedContext'
import {SelectBuyTokenFromListScreen} from './SelectBuyTokenFromListScreen'

storiesOf('Swap Select Token To Buy', module)
  .add('initial', () => {
    return (
      <SelectedWalletProvider wallet={mocks.wallet}>
        <SearchProvider>
          <SwapProvider swapManager={mockSwapManager}>
            <SwapTouchedProvider>
              <SelectBuyTokenFromListScreen />
            </SwapTouchedProvider>
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
            <SwapTouchedProvider>
              <SelectBuyTokenFromListScreen />
            </SwapTouchedProvider>
          </SwapProvider>
        </SearchProvider>
      </SelectedWalletProvider>
    )
  })
