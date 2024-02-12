/* import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {QueryProvider} from '../../.storybook/decorators'
import {SendProvider} from '../features/Send/common/SendContext'
import {SelectedWalletProvider} from '../SelectedWallet'
import {mocks} from '../yoroi-wallets/mocks'
import {TxHistory} from './TxHistory'

storiesOf('V2/TxHistory', module)
  .add('default', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <SendProvider>
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
          <SendProvider>
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
          <SendProvider>
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
            walletImplementationId: 'haskell-byron',
          }}
        >
          <SendProvider>
            <TxHistory />
          </SendProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })

const mockTransaction = Object.values(mocks.wallet.transactions)[0]
 */
