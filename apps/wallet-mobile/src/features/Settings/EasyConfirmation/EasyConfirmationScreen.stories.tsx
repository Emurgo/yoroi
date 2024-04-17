import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../WalletManager/Context/SelectedWalletContext'
import {DisableEasyConfirmationScreen} from './DisableEasyConfirmationScreen'
import {EnableEasyConfirmationScreen} from './EnableEasyConfirmationScreen'

storiesOf('EasyConfirmation Screen', module)
  .add('EnableEasyConfirmation', () => (
    <SelectedWalletProvider
      wallet={{
        ...mocks.wallet,
        isEasyConfirmationEnabled: true,
      }}
    >
      <DisableEasyConfirmationScreen />
    </SelectedWalletProvider>
  ))
  .add('DisableEasyConfirmation', () => (
    <SelectedWalletProvider
      wallet={{
        ...mocks.wallet,
        isEasyConfirmationEnabled: false,
      }}
    >
      <EnableEasyConfirmationScreen />
    </SelectedWalletProvider>
  ))
