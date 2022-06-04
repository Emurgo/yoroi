import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet, mockYoroiTx, WithModal} from '../../../../storybook'
import {Boundary} from '../../../components'
import {YoroiAmount} from '../../../yoroi-wallets/types'
import {ConfirmTxWithHW} from './ConfirmTxWithHW'

storiesOf('ConfirmWithdrawalTx/HW', module)
  .add('withdrawals, no deregistrations', () => {
    const rewardAmount: YoroiAmount = {
      tokenId: '',
      quantity: '12356789',
    }

    return (
      <WithModal>
        <Boundary>
          <ConfirmTxWithHW
            wallet={{
              ...mockWallet,
              submitTransaction: async (yoroiSignedTx) => {
                action('onSubmit')(yoroiSignedTx)
                return []
              },
            }}
            unsignedTx={{
              ...mockYoroiTx,
              staking: {
                ...mockYoroiTx.staking,
                withdrawals: {
                  'reward-address': {[rewardAmount.tokenId]: rewardAmount.quantity},
                },
              },
            }}
            onSuccess={action('onSuccess')}
            onCancel={action('onCancel')}
          />
        </Boundary>
      </WithModal>
    )
  })
  .add('withdrawals, deregistrations', () => {
    const rewardAmount: YoroiAmount = {
      tokenId: '',
      quantity: '12356789',
    }

    return (
      <WithModal>
        <Boundary>
          <ConfirmTxWithHW
            wallet={{
              ...mockWallet,
              submitTransaction: async (yoroiSignedTx) => {
                action('onSubmit')(yoroiSignedTx)
                return []
              },
            }}
            unsignedTx={{
              ...mockYoroiTx,
              staking: {
                ...mockYoroiTx.staking,
                deregistrations: {
                  ...mockYoroiTx.staking.deregistrations,
                  'reward-address': {[rewardAmount.tokenId]: rewardAmount.quantity},
                },
              },
            }}
            onSuccess={action('onSuccess')}
            onCancel={action('onCancel')}
          />
        </Boundary>
      </WithModal>
    )
  })
