import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../../../wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../../wallets/mocks/WalletManagerProviderMock'
import {RenameWalletScreen} from './RenameWalletScreen'

storiesOf('RenameWallet', module).add('Default', () => (
  <WalletManagerProviderMock wallet={mocks.wallet}>
    <RenameWalletScreen />
  </WalletManagerProviderMock>
))
