import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../SelectedWallet'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {mocks} from '../../../yoroi-wallets/mocks'
import {ChangePasswordScreen} from './ChangePasswordScreen'

const wallet: YoroiWallet = {
  ...mocks.wallet,
  changePassword: async (...args) => {
    action('changePassword')(...args)
  },
}

storiesOf('ChangePasswordScreen', module).add('Default', () => (
  <SelectedWalletProvider wallet={wallet}>
    <ChangePasswordScreen />
  </SelectedWalletProvider>
))
