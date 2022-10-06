import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {ConfirmTx} from './ConfirmTx'

storiesOf('ConfirmTx', module)
  .add('Not providing password', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <ConfirmTx
          onSuccess={action('onSuccess')}
          yoroiUnsignedTx={{} as unknown as YoroiUnsignedTx}
          setUseUSB={action('setUseUSB')}
          isProvidingPassword={false}
          useUSB={false}
        />
      </SelectedWalletProvider>
    )
  })
  .add('Providing password', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <ConfirmTx
          onSuccess={action('onSuccess')}
          yoroiUnsignedTx={{} as unknown as YoroiUnsignedTx}
          setUseUSB={action('setUseUSB')}
          isProvidingPassword
          providedPassword="1234567890"
          useUSB={false}
        />
      </SelectedWalletProvider>
    )
  })
  .add('With customized button', () => {
    return (
      <SelectedWalletProvider wallet={mockWallet}>
        <ConfirmTx
          onSuccess={action('onSuccess')}
          yoroiUnsignedTx={{} as unknown as YoroiUnsignedTx}
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
