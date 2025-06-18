import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {YoroiWallet} from '../../../../../wallets/cardano/types'
import {mocks} from '../../../../../wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../wallets/mocks/WalletManagerProviderMock'
import {ChangePasswordScreen} from './ChangePasswordScreen'

const wallet: YoroiWallet = {
  ...mocks.wallet,
}

storiesOf('ChangePasswordScreen', module).add('Default', () => (
  <WalletManagerProviderMock wallet={wallet}>
    <ChangePasswordScreen />
  </WalletManagerProviderMock>
))
