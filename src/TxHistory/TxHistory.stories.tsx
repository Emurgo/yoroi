import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../storybook'
import {QueryProvider} from '../../storybook/decorators'
import {SelectedWalletProvider} from '../SelectedWallet'
import {SendProvider} from '../Send/Context/SendContext'
import {TxHistory as TxHistoryScreen} from './TxHistory'

storiesOf('V2/TxHistory', module)
  .add('default', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <SendProvider wallet={mocks.wallet}>
            <TxHistoryScreen />
          </SendProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('default with API errors', () => {
    const wallet = {
      ...mocks.wallet,
      fetchCurrentPrice: mocks.fetchCurrentPrice.error,
    }

    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={wallet}>
          <SendProvider wallet={wallet}>
            <TxHistoryScreen />
          </SendProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('byron', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider
          wallet={{
            ...mocks.wallet,
            walletImplementationId: 'haskell-byron',
          }}
        >
          <SendProvider wallet={mocks.wallet}>
            <TxHistoryScreen />
          </SendProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
