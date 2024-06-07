import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {RenameWallet} from './RenameWallet'

storiesOf('RenameWallet', module).add('Default', () => (
  <WalletManagerProviderMock wallet={mocks.wallet}>
    <RenameWallet />
  </WalletManagerProviderMock>
))
