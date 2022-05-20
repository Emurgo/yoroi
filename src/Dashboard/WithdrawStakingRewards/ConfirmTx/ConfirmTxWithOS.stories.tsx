import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet, mockYoroiTx, WithModalProps} from '../../../../storybook'
import {Boundary, Modal} from '../../../components'
import {SelectedWalletProvider} from '../../../SelectedWallet'
import {YoroiAmount} from '../../../yoroi-wallets/types'
import {ConfirmTxWithOS} from './ConfirmTxWithOS'

storiesOf('ConfirmWithdrawalTx/OS', module)
  .add('withdrawals, no deregistrations', () => {
    const rewardAmount: YoroiAmount = {
      tokenId: '',
      quantity: '12356789',
    }

    return (
      <SelectedWalletProvider
        wallet={{
          ...mockWallet,
          submitTransaction: async (yoroiSignedTx) => {
            action('onSubmit')(yoroiSignedTx)
            return []
          },
        }}
      >
        <WithModalProps>
          {(modalProps) => (
            <Modal {...modalProps} showCloseIcon>
              <Boundary>
                <ConfirmTxWithOS
                  yoroiUnsignedTx={{
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
            </Modal>
          )}
        </WithModalProps>
      </SelectedWalletProvider>
    )
  })
  .add('withdrawals, deregistrations', () => {
    const rewardAmount: YoroiAmount = {
      tokenId: '',
      quantity: '12356789',
    }

    return (
      <SelectedWalletProvider
        wallet={{
          ...mockWallet,
          submitTransaction: async (yoroiSignedTx) => {
            action('onSubmit')(yoroiSignedTx)
            return []
          },
        }}
      >
        <WithModalProps>
          {(modalProps) => (
            <Modal {...modalProps} showCloseIcon>
              <Boundary>
                <ConfirmTxWithOS
                  yoroiUnsignedTx={{
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
            </Modal>
          )}
        </WithModalProps>
      </SelectedWalletProvider>
    )
  })
