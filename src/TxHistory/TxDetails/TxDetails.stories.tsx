import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet, QueryProvider, RouteProvider} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {TxDetails} from './TxDetails'

storiesOf('TxDetails', module)
  .add('loading', () => (
    <QueryProvider>
      <RouteProvider params={{id: '31b1abca49857fd50c7959cc019d14c7dc5deaa754ba45372fb21748c411f210'}}>
        <SelectedWalletProvider
          wallet={{
            ...mockWallet,
            getTransactions: () => new Promise(() => null),
          }}
        >
          <TxDetails />
        </SelectedWalletProvider>
      </RouteProvider>
    </QueryProvider>
  ))
  .add('error', () => (
    <QueryProvider>
      <RouteProvider params={{id: '31b1abca49857fd50c7959cc019d14c7dc5deaa754ba45372fb21748c411f210'}}>
        <SelectedWalletProvider
          wallet={{
            ...mockWallet,
            getTransactions: () => Promise.reject(new Error('getTransactions: error message')),
          }}
        >
          <TxDetails />
        </SelectedWalletProvider>
      </RouteProvider>
    </QueryProvider>
  ))
  .add('success', () => (
    <QueryProvider>
      <RouteProvider params={{id: '31b1abca49857fd50c7959cc019d14c7dc5deaa754ba45372fb21748c411f210'}}>
        <SelectedWalletProvider wallet={mockWallet}>
          <TxDetails />
        </SelectedWalletProvider>
      </RouteProvider>
    </QueryProvider>
  ))
