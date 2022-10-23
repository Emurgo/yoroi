import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet} from '../../storybook'
import {SelectedWalletProvider} from '../SelectedWallet'
import {UnusedAddresses, UsedAddresses} from './Addresses'

storiesOf('AddressesList', module)
  .add('unused', () => (
    <SelectedWalletProvider
      wallet={{
        ...mockWallet,
        numReceiveAddresses: 20,
        externalAddresses: ['address123', 'address234', 'address345', 'address456'],
        isUsedAddressIndex: {
          address123: true,
          address234: true,
          address345: true,
          address456: false,
        },
      }}
    >
      <UnusedAddresses />
    </SelectedWalletProvider>
  ))
  .add('used', () => (
    <SelectedWalletProvider
      wallet={{
        ...mockWallet,
        numReceiveAddresses: 20,
        externalAddresses: ['address123', 'address234', 'address345', 'address456'],
        isUsedAddressIndex: {
          address123: true,
          address234: true,
          address345: true,
          address456: false,
        },
      }}
    >
      <UsedAddresses />
    </SelectedWalletProvider>
  ))
