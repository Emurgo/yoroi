import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {mocks} from '../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {ChangePasswordScreen} from './ChangePasswordScreen'

const wallet: YoroiWallet = {
  ...mocks.wallet,
  changePassword: async (...args) => {
    action('changePassword')(...args)
  },
}

storiesOf('ChangePasswordScreen', module).add('Default', () => (
  <WalletManagerProviderMock wallet={wallet}>
    <ChangePasswordScreen />
  </WalletManagerProviderMock>
))
