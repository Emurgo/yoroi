import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks, QueryProvider, RouteProvider} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {TxDetails} from './TxDetails'

storiesOf('TxDetails', module)
  .add('loading', () => (
    <QueryProvider>
      <RouteProvider params={{id: mocks.txid}}>
        <SelectedWalletProvider
          wallet={{
            ...mocks.wallet,
            getTransactions: mocks.getTransactions.loading,
          }}
        >
          <TxDetails />
        </SelectedWalletProvider>
      </RouteProvider>
    </QueryProvider>
  ))
  .add('error', () => (
    <QueryProvider>
      <RouteProvider params={{id: mocks.txid}}>
        <SelectedWalletProvider
          wallet={{
            ...mocks.wallet,
            getTransactions: mocks.getTransactions.error,
          }}
        >
          <TxDetails />
        </SelectedWalletProvider>
      </RouteProvider>
    </QueryProvider>
  ))
  .add('success', () => (
    <QueryProvider>
      <RouteProvider params={{id: mocks.txid}}>
        <SelectedWalletProvider
          wallet={{
            ...mocks.wallet,
            getTransactions: mocks.getTransactions.success,
          }}
        >
          <TxDetails />
        </SelectedWalletProvider>
      </RouteProvider>
    </QueryProvider>
  ))
