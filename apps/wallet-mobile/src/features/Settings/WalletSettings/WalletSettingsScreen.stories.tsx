import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../Wallet/common/Context'
import {WalletSettingsScreen} from './WalletSettingsScreen'

storiesOf('WalletSettingsScreen', module).add('Default', () => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <WalletSettingsScreen />
  </SelectedWalletProvider>
))
