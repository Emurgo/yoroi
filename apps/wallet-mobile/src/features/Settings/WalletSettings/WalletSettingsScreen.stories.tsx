import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../SelectedWallet'
import {mocks} from '../../../yoroi-wallets/mocks'
import {WalletSettingsScreen} from './WalletSettingsScreen'

storiesOf('WalletSettingsScreen', module).add('Default', () => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <WalletSettingsScreen />
  </SelectedWalletProvider>
))
