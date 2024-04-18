import {storiesOf} from '@storybook/react-native'
import {TransferProvider} from '@yoroi/transfer'
import React from 'react'

import {QueryProvider} from '../../.storybook/decorators'
import {SelectedWalletProvider} from '../features/WalletManager/Context'
import {mocks} from '../yoroi-wallets/mocks'
import {TxHistory} from './TxHistory'

storiesOf('V2/TxHistory', module)
  .add('default', () => {
    return (
      <QueryProvider>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <TransferProvider>
            <TxHistory />
          </TransferProvider>
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
          <TransferProvider>
            <TxHistory />
          </TransferProvider>
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
          <TransferProvider>
            <TxHistory />
          </TransferProvider>
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
          <TransferProvider>
            <TxHistory />
          </TransferProvider>
        </SelectedWalletProvider>
      </QueryProvider>
    )
  })

const mockTransaction = Object.values(mocks.wallet.transactions)[0]
