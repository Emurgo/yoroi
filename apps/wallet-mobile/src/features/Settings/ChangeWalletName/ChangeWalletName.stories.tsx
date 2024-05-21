import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../WalletManager/context/SelectedWalletContext'
import {ChangeWalletName} from './ChangeWalletName'

storiesOf('ChangeWalletName', module).add('Default', () => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <ChangeWalletName />
  </SelectedWalletProvider>
))
