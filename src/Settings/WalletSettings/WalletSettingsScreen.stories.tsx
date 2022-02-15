import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet} from '../../../storybook/mockWallet'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {WalletSettingsScreen} from './WalletSettingsScreen'

storiesOf('WalletSettingsScreen', module).add('Default', () => (
  <SelectedWalletProvider wallet={mockWallet}>
    <WalletSettingsScreen />
  </SelectedWalletProvider>
))
