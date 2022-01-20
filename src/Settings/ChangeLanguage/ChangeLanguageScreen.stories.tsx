import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../SelectedWallet'
import {WalletInterface} from '../../types'
import {ChangeLanguageScreen} from './ChangeLanguageScreen'

const wallet = {
  changePassword: action('changePassword'),
} as WalletInterface

storiesOf('ChangeLanguageScreen', module).add('Default', () => (
  <SelectedWalletProvider wallet={wallet}>
    <ChangeLanguageScreen />
  </SelectedWalletProvider>
))
