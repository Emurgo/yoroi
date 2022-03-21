import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {RemoveWalletScreen} from './RemoveWalletScreen'

storiesOf('RemoveWalletScreen', module).add('Default', () => (
  <SelectedWalletProvider wallet={mockWallet}>
    <RemoveWalletScreen />
  </SelectedWalletProvider>
))
