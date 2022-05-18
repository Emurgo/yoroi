import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet, mockYoroiTx, WithModalProps} from '../../../../storybook'
import {Boundary, Modal} from '../../../components'
import {SelectedWalletProvider} from '../../../SelectedWallet'
import {YoroiAmount} from '../../../yoroi-wallets/types'
import {Staked} from '../../StakePoolInfos'
import {ConfirmTxWithOS} from './ConfirmTxWithOS'

storiesOf('ConfirmWithdrawalTx/os', module)
  .add('withdrawals, no deregistrations', () => {
    const rewardAmount: YoroiAmount = {
      tokenId: '',
      quantity: '12356789',
    }

    return (
      <Boundary>
        <WithModalProps>
          {(modalProps) => (
            <SelectedWalletProvider
              wallet={{
                ...mockWallet,
                createWithdrawalTx: async () => {
                  action('createWithdrawalTx')

                  return {
                    ...mockYoroiTx,
                    staking: {
                      ...mockYoroiTx.staking,
                      withdrawals: {
                        'reward-address': {[rewardAmount.tokenId]: rewardAmount.quantity},
                      },
                    },
                  }
                },
              }}
            >
              <Modal {...modalProps} showCloseIcon>
                <ConfirmTxWithOS
                  shouldDeregister={false}
                  onSuccess={action('onSuccess')}
                  onCancel={action('onCancel')}
                  stakingInfo={
                    {
                      status: 'staked',
                      poolId: 'pool-id',
                      amount: '1234567890',
                      rewards: rewardAmount.quantity,
                    } as Staked
                  }
                />
              </Modal>
            </SelectedWalletProvider>
          )}
        </WithModalProps>
      </Boundary>
    )
  })
  .add('withdrawals, deregistrations', () => {
    const rewardAmount: YoroiAmount = {
      tokenId: '',
      quantity: '12356789',
    }

    return (
      <Boundary>
        <WithModalProps>
          {(modalProps) => (
            <SelectedWalletProvider
              wallet={{
                ...mockWallet,
                createWithdrawalTx: async () => {
                  action('createWithdrawalTx')

                  return {
                    ...mockYoroiTx,
                    staking: {
                      ...mockYoroiTx.staking,
                      withdrawals: {
                        'reward-address': {[rewardAmount.tokenId]: rewardAmount.quantity},
                      },
                      deregistrations: {
                        'reward-address': {[rewardAmount.tokenId]: '2000000'},
                      },
                    },
                  }
                },
              }}
            >
              <Modal {...modalProps} showCloseIcon>
                <ConfirmTxWithOS
                  shouldDeregister={false}
                  onSuccess={action('onSuccess')}
                  onCancel={action('onCancel')}
                  stakingInfo={
                    {
                      status: 'staked',
                      poolId: 'pool-id',
                      amount: '1234567890',
                      rewards: rewardAmount.quantity,
                    } as Staked
                  }
                />
              </Modal>
            </SelectedWalletProvider>
          )}
        </WithModalProps>
      </Boundary>
    )
  })
