import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../SelectedWallet'
import {mocks} from '../../../yoroi-wallets/mocks'
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
