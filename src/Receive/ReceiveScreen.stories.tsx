import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../src/SelectedWallet'
import {mockWallet} from '../../storybook'
import {ReceiveScreen} from './ReceiveScreen'

storiesOf('ReceiveScreen', module).add('Default', () => (
  <SelectedWalletProvider wallet={mockWallet}>
    <ReceiveScreen />
  </SelectedWalletProvider>
))
