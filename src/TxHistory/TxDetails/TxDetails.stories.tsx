import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks, QueryProvider, RouteProvider} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {TxDetails} from './TxDetails'

storiesOf('TxDetails', module)
  .add('Default', () => (
    <QueryProvider>
      <RouteProvider params={{id: mockTransaction.id}}>
        <SelectedWalletProvider
          wallet={{
            ...mocks.wallet,
            transactions: {
              [mockTransaction.id]: mockTransaction,
            },
          }}
        >
          <TxDetails />
        </SelectedWalletProvider>
      </RouteProvider>
    </QueryProvider>
  ))
  .add('With memo', () => (
    <QueryProvider>
      <RouteProvider params={{id: mockTransaction.id}}>
        <SelectedWalletProvider
          wallet={{
            ...mocks.wallet,
            transactions: {
              [mockTransaction.id]: {
                ...mockTransaction,
                memo: 'Fake Memo',
              },
            },
          }}
        >
          <TxDetails />
        </SelectedWalletProvider>
      </RouteProvider>
    </QueryProvider>
  ))

const mockTransaction = Object.values(mocks.wallet.transactions)[0]
