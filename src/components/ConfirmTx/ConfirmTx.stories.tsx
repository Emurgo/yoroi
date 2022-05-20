import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'
import {View} from 'react-native'

import {mockWallet} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {HaskellShelleyTxSignRequest} from '../../yoroi-wallets'
import {ConfirmTx} from './ConfirmTx'

storiesOf('ConfirmTx', module)
  .add('Not providing password', () => {
    return (
      <View style={{padding: 16, borderWidth: 1}}>
        <SelectedWalletProvider wallet={mockWallet}>
          <ConfirmTx
            onSuccess={action('onSuccess')}
            txDataSignRequest={{} as unknown as HaskellShelleyTxSignRequest}
            setUseUSB={action('setUseUSB')}
            isProvidingPassword={false}
            useUSB={false}
          />
        </SelectedWalletProvider>
      </View>
    )
  })
  .add('Providing password', () => {
    return (
      <View style={{padding: 16, borderWidth: 1}}>
        <SelectedWalletProvider wallet={mockWallet}>
          <ConfirmTx
            onSuccess={action('onSuccess')}
            txDataSignRequest={{} as unknown as HaskellShelleyTxSignRequest}
            setUseUSB={action('setUseUSB')}
            isProvidingPassword
            providedPassword="1234567890"
            useUSB={false}
          />
        </SelectedWalletProvider>
      </View>
    )
  })
  .add('With customized button', () => {
    return (
      <View style={{padding: 16, borderWidth: 1}}>
        <SelectedWalletProvider wallet={mockWallet}>
          <ConfirmTx
            onSuccess={action('onSuccess')}
            txDataSignRequest={{} as unknown as HaskellShelleyTxSignRequest}
            setUseUSB={action('setUseUSB')}
            isProvidingPassword
            providedPassword="1234567890"
            useUSB={false}
            buttonProps={{
              title: 'DELEGATE',
              shelleyTheme: true,
            }}
          />
        </SelectedWalletProvider>
      </View>
    )
  })
