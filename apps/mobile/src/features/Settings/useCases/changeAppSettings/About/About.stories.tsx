import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../../../wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../wallets/mocks/WalletManagerProviderMock'
import {About} from './About'

storiesOf('About', module).add('Default', () => (
  <WalletManagerProviderMock wallet={mocks.wallet}>
    <About />
  </WalletManagerProviderMock>
))
