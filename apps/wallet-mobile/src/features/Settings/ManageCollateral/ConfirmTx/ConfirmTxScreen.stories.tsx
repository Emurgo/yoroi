import {storiesOf} from '@storybook/react-native'
import {TransferProvider} from '@yoroi/transfer'
import React from 'react'

import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../AddWallet/common/Context'
import {mocks as sendMocks} from '../../../Send/common/mocks'
import {ConfirmTxScreen} from './ConfirmTxScreen'

storiesOf('Confirm Tx', module).add('initial', () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <TransferProvider initialState={sendMocks.confirmTx.success}>
        <ConfirmTxScreen />
      </TransferProvider>
    </SelectedWalletProvider>
  )
})
