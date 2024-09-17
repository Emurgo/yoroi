import {storiesOf} from '@storybook/react-native'
import {TransferProvider} from '@yoroi/transfer'
import React from 'react'

import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {mocks as sendMocks} from '../../../Send/common/mocks'
import {ConfirmTxScreen} from './ConfirmTxScreen'

storiesOf('Confirm Tx', module).add('initial', () => {
  return (
    <WalletManagerProviderMock wallet={walletMocks.wallet}>
      <TransferProvider initialState={sendMocks.confirmTx.success as never}>
        <ConfirmTxScreen />
      </TransferProvider>
    </WalletManagerProviderMock>
  )
})
