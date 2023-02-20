import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../storybook'
import {QueryProvider} from '../../storybook/decorators'
import {SelectedWalletProvider} from '../SelectedWallet'
import {SendProvider} from '../Send/Context/SendContext'
import {TxHistory} from './TxHistory'

storiesOf('V2/TxHistory', module)
  .add('default', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <SendProvider wallet={mocks.wallet}>
            <TxHistory />
          </SendProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })
  .add('1 transaction', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider
          wallet={{
            ...mocks.wallet,
            transactions: {
              [mockTransaction.id]: mockTransaction,
            },
          }}
        >
          <SendProvider
            wallet={{
              ...mocks.wallet,
              transactions: {
                [mockTransaction.id]: mockTransaction,
              },
            }}
          >
            <TxHistory />
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
            <TxHistory />
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
            // walletImplementationId: 'haskell-byron',
          }}
        >
          <SendProvider wallet={mocks.wallet}>
            <TxHistory />
          </SendProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })

const mockTransaction = Object.values(mocks.wallet.transactions)[0]
