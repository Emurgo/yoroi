import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../WalletManager/context/SelectedWalletContext'
import {RenameWallet} from './RenameWallet'

storiesOf('RenameWallet', module).add('Default', () => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <RenameWallet />
  </SelectedWalletProvider>
))
