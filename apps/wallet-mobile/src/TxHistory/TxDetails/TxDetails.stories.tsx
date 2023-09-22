/* eslint-disable @typescript-eslint/no-explicit-any */
import {storiesOf} from '@storybook/react-native'
import {rootStorage, StorageProvider} from '@yoroi/common'
import React from 'react'

import {QueryProvider, RouteProvider} from '../../../.storybook/decorators'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {mocks} from '../../yoroi-wallets/mocks'
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
  .add('With privacy mode enabled', () => (
    <QueryProvider>
      <RouteProvider params={{id: mockTransaction.id}}>
        <SelectedWalletProvider wallet={mocks.wallet}>
          <StorageProvider
            storage={{
              ...rootStorage,
              join: (key: string) => {
                if (key === 'appSettings/') {
                  const appSettings = rootStorage.join(key)
                  return {
                    ...appSettings,
                    getItem: async (key): Promise<any> => (key === 'privacyMode' ? 'HIDDEN' : appSettings.getItem(key)),
                  }
                }
                return rootStorage
              },
            }}
          >
            <TxDetails />
          </StorageProvider>
        </SelectedWalletProvider>
      </RouteProvider>
    </QueryProvider>
  ))

const mockTransaction = Object.values(mocks.wallet.transactions)[0]
