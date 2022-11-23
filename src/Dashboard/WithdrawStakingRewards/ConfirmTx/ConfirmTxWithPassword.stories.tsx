import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks, WithModal} from '../../../../storybook'
import {Boundary} from '../../../components'
import {YoroiWallet} from '../../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {ConfirmTxWithPassword} from './ConfirmTxWithPassword'

storiesOf('ConfirmWithdrawalTx/Password', module)
  .add('withdrawals, no deregistrations', () => {
    const wallet: YoroiWallet = {
      ...mocks.wallet,
      signTx: mocks.signTx.success,
      submitTransaction: mocks.submitTransaction.success,
    }
    const unsignedTx: YoroiUnsignedTx = {
      ...mocks.unsignedYoroiTx,
      staking: {
        ...mocks.unsignedYoroiTx.staking,
        withdrawals: {
          'withdrawal-address': {'': '12356789'},
        },
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
      ...mocks.unsignedYoroiTx,
      staking: {
        ...mocks.unsignedYoroiTx.staking,
        deregistrations: {
          ...mocks.unsignedYoroiTx.staking.deregistrations,
          'deregistration-address': {'': '12356789'},
        },
        withdrawals: {
          'withdrawal-address': {['']: '12356789'},
        },
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
