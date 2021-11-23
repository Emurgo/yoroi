import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../SelectedWallet'
import {WalletInterface} from '../../types'
import {ChangePasswordScreen} from './ChangePasswordScreen'

const wallet = {
  changePassword: action('changePassword'),
} as WalletInterface

storiesOf('ChangePasswordScreen', module).add('Default', () => (
  <SelectedWalletProvider wallet={wallet}>
    <ChangePasswordScreen />
  </SelectedWalletProvider>
))
