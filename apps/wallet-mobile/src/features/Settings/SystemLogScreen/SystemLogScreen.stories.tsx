import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../WalletManager/context/SelectedWalletContext'
import {SystemLogScreen} from './SystemLogScreen'

storiesOf('Settings SystemLogScreen', module).add('initial', () => (
  <SelectedWalletProvider wallet={mocks.wallet}>
    <SystemLogScreen />
  </SelectedWalletProvider>
))
