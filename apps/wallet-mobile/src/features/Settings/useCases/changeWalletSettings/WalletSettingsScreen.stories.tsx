import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../../wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../wallets/mocks/WalletManagerProviderMock'
import {WalletSettingsScreen} from './WalletSettingsScreen'

storiesOf('WalletSettingsScreen', module).add('Default', () => (
  <WalletManagerProviderMock wallet={mocks.wallet}>
    <WalletSettingsScreen />
  </WalletManagerProviderMock>
))
