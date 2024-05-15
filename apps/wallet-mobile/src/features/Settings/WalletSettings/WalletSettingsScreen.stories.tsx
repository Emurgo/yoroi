import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../WalletManager/context/SelectedWalletContext'
import {WalletSettingsScreen} from './WalletSettingsScreen'

storiesOf('WalletSettingsScreen', module).add('Default', () => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <WalletSettingsScreen />
  </SelectedWalletProvider>
))
