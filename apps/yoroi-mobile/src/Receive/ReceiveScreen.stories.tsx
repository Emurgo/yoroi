import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../src/SelectedWallet'
import {mocks} from '../yoroi-wallets/mocks'
import {ReceiveScreen} from './ReceiveScreen'

storiesOf('ReceiveScreen', module).add('Default', () => (
  <SelectedWalletProvider
    wallet={{
      ...mocks.wallet,
      numReceiveAddresses: 20,
      externalAddresses: ['address123', 'address234', 'address345', 'address456'],
      internalAddresses: ['address123', 'address234', 'address345', 'address456'],
      isUsedAddressIndex: {
        address123: true,
        address234: true,
        address345: true,
        address456: false,
      },
    }}
  >
    <ReceiveScreen />
  </SelectedWalletProvider>
))
