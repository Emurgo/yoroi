import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {HaskellShelleyTxSignRequest} from '../../yoroi-wallets'
import {ConfirmTx} from './ConfirmTx'

storiesOf('ConfirmTx', module)
  .add('Not providing password (signAndSubmit)', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <ConfirmTx
          process="signAndSubmit"
          onSuccess={action('onSuccess')}
          txDataSignRequest={{} as unknown as HaskellShelleyTxSignRequest}
          setUseUSB={action('setUseUSB')}
          isProvidingPassword={false}
          useUSB={false}
        />
      </SelectedWalletProvider>
    )
  })
  .add('Not providing password (onlySign)', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <ConfirmTx
          process="onlySign"
          onSuccess={action('onSuccess')}
          txDataSignRequest={{} as unknown as HaskellShelleyTxSignRequest}
          setUseUSB={action('setUseUSB')}
          isProvidingPassword={false}
          useUSB={false}
        />
      </SelectedWalletProvider>
    )
  })
  .add('Providing password (signAndSubmit)', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <ConfirmTx
          process="signAndSubmit"
          onSuccess={action('onSuccess')}
          txDataSignRequest={{} as unknown as HaskellShelleyTxSignRequest}
          setUseUSB={action('setUseUSB')}
          isProvidingPassword
          providedPassword="1234567890"
          useUSB={false}
        />
      </SelectedWalletProvider>
    )
  })
  .add('With customized button (signAndSubmit)', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <ConfirmTx
          process="signAndSubmit"
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
    )
  })
  .add('Only submit', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <ConfirmTx
          process="onlySubmit"
          onSuccess={action('onSuccess')}
          signedTx={{
            base64: '',
            encodedTx: Buffer.from(''),
            id: '',
          }}
          onError={(_err) => action('')}
        />
      </SelectedWalletProvider>
    )
  })
