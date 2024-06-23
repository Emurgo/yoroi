import {storiesOf} from '@storybook/react-native'
import {TransferProvider} from '@yoroi/transfer'
import React from 'react'

import {QueryProvider} from '../../../.storybook/decorators'
import {mocks} from '../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {TxHistory} from './TxHistory'

storiesOf('V2/TxHistory', module)
  .add('default', () => {
    return (
      <QueryProvider>
        <WalletManagerProviderMock wallet={mocks.wallet}>
          <TransferProvider>
            <TxHistory />
          </TransferProvider>
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })
  .add('1 transaction', () => {
    return (
      <QueryProvider>
        <WalletManagerProviderMock
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
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })
  .add('default with API errors', () => {
    const wallet = {
      ...mocks.wallet,
    }

    return (
      <QueryProvider>
        <WalletManagerProviderMock wallet={wallet}>
          <TransferProvider>
            <TxHistory />
          </TransferProvider>
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })
  .add('byron', () => {
    return (
      <QueryProvider>
        <WalletManagerProviderMock
          wallet={{
            ...mocks.wallet,
          }}
        >
          <TransferProvider>
            <TxHistory />
          </TransferProvider>
        </WalletManagerProviderMock>
      </QueryProvider>
    )
  })

const mockTransaction = Object.values(mocks.wallet.transactions)[0]
