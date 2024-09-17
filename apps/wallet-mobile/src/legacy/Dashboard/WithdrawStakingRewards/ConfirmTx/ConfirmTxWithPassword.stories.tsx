import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModal} from '../../../../../.storybook/decorators'
import {Boundary} from '../../../../components/Boundary/Boundary'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {mocks} from '../../../../yoroi-wallets/mocks/wallet'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {ConfirmTxWithPassword} from './ConfirmTxWithPassword'

storiesOf('ConfirmWithdrawalTx/Password', module)
  .add('withdrawals, no deregistrations', () => {
    const wallet: YoroiWallet = {
      ...mocks.wallet,
      signTx: mocks.signTx.success,
      submitTransaction: mocks.submitTransaction.success,
    }
    const unsignedTx: YoroiUnsignedTx = {
      ...mocks.yoroiUnsignedTx,
      staking: {
        ...mocks.yoroiUnsignedTx.staking,
        withdrawals: [{address: 'withdrawal-address', amounts: {['.']: '12356789'}}],
      },
    }

    return (
      <WithModal>
        <Boundary>
          <ConfirmTxWithPassword
            wallet={wallet}
            unsignedTx={unsignedTx}
            onSuccess={action('onSuccess')}
            onCancel={action('onCancel')}
          />
        </Boundary>
      </WithModal>
    )
  })
  .add('withdrawals, deregistrations', () => {
    const wallet: YoroiWallet = {
      ...mocks.wallet,
      signTx: mocks.signTx.success,
      submitTransaction: mocks.submitTransaction.success,
    }
    const unsignedTx: YoroiUnsignedTx = {
      ...mocks.yoroiUnsignedTx,
      staking: {
        ...mocks.yoroiUnsignedTx.staking,
        deregistrations: [{address: 'deregistration-address', amounts: {['.']: '12356789'}}],
        withdrawals: [{address: 'withdrawal-address', amounts: {['.']: '12356789'}}],
      },
    }

    return (
      <WithModal>
        <Boundary>
          <ConfirmTxWithPassword
            wallet={wallet}
            unsignedTx={unsignedTx}
            onSuccess={action('onSuccess')}
            onCancel={action('onCancel')}
          />
        </Boundary>
      </WithModal>
    )
  })
