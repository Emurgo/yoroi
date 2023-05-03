import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../SelectedWallet'
import {mocks} from '../yoroi-wallets/mocks'
import {UnusedAddresses, UsedAddresses} from './Addresses'

storiesOf('AddressesList', module)
  .add('unused', () => (
    <SelectedWalletProvider
      wallet={{
        ...mocks.wallet,
        numReceiveAddresses: 20,
        externalAddresses: ['address123', 'address234', 'address345', 'address456'],
        isUsedAddressIndex: {
          address123: true,
          address234: true,
          address345: true,
        },
      }}
    >
      <UnusedAddresses />
    </SelectedWalletProvider>
  ))
  .add('used', () => (
    <SelectedWalletProvider
      wallet={{
        ...mocks.wallet,
        numReceiveAddresses: 20,
        externalAddresses: ['address123', 'address234', 'address345', 'address456'],
        isUsedAddressIndex: {
          address123: true,
          address234: true,
          address345: true,
        },
      }}
    >
      <UsedAddresses />
    </SelectedWalletProvider>
  ))
