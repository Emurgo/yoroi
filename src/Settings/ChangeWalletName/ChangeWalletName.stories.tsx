import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {ChangeWalletName} from './ChangeWalletName'

storiesOf('ChangeWalletName', module).add('Default', () => (
  <SelectedWalletProvider wallet={mockWallet}>
    <ChangeWalletName />
  </SelectedWalletProvider>
))
