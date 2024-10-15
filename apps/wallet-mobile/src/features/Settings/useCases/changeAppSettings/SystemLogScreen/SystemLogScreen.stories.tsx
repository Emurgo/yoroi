import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {SystemLogScreen} from './SystemLogScreen'

storiesOf('Settings SystemLogScreen', module).add('initial', () => (
  <WalletManagerProviderMock wallet={mocks.wallet}>
    <SystemLogScreen />
  </WalletManagerProviderMock>
))
