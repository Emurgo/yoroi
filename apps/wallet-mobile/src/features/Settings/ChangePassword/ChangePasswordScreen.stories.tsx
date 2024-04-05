import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {mocks} from '../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../Wallet/common/Context'
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
