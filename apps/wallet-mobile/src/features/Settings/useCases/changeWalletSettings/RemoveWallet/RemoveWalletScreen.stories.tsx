import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {RemoveWalletScreen} from './RemoveWalletScreen'

storiesOf('RemoveWalletScreen', module).add('Default', () => (
  <WalletManagerProviderMock wallet={mocks.wallet}>
    <RemoveWalletScreen />
  </WalletManagerProviderMock>
))
