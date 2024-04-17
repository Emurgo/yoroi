import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../WalletManager/Context/SelectedWalletContext'
import {RemoveWalletScreen} from './RemoveWalletScreen'

storiesOf('RemoveWalletScreen', module).add('Default', () => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <RemoveWalletScreen />
  </SelectedWalletProvider>
))
