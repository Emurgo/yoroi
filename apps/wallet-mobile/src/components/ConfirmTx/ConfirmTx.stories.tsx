import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {YoroiUnsignedTx} from '../../yoroi-wallets/types/yoroi'
import {ConfirmTx} from './ConfirmTx'

storiesOf('ConfirmTx', module)
  .add('Not providing password', () => {
    return (
      <WalletManagerProviderMock wallet={mocks.wallet}>
        <ConfirmTx
          onSuccess={action('onSuccess')}
          yoroiUnsignedTx={{} as unknown as YoroiUnsignedTx}
          setUseUSB={action('setUseUSB')}
          isProvidingPassword={false}
          useUSB={false}
        />
      </WalletManagerProviderMock>
    )
  })
  .add('Providing password', () => {
    return (
      <WalletManagerProviderMock wallet={mocks.wallet}>
        <ConfirmTx
          onSuccess={action('onSuccess')}
          yoroiUnsignedTx={{} as unknown as YoroiUnsignedTx}
          setUseUSB={action('setUseUSB')}
          isProvidingPassword
          providedPassword="1234567890"
          useUSB={false}
        />
      </WalletManagerProviderMock>
    )
  })
  .add('With customized button', () => {
    return (
      <WalletManagerProviderMock wallet={mocks.wallet}>
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
      </WalletManagerProviderMock>
    )
  })
