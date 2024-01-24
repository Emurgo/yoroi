import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../SelectedWallet'
import {mocks} from '../../../yoroi-wallets/mocks'
import {ChangeWalletName} from './ChangeWalletName'

storiesOf('ChangeWalletName', module).add('Default', () => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <ChangeWalletName />
  </SelectedWalletProvider>
))
