import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockHwWallet, mockSignTxWithLedger, mockSubmitTransaction, mockYoroiTx, WithModal} from '../../../../storybook'
import {Boundary} from '../../../components'
import {ConfirmTxWithHW} from './ConfirmTxWithHW'

storiesOf('ConfirmWithdrawalTx/HW', module)
  .add('loading', () => (
    <WithModal>
      <Boundary>
        <ConfirmTxWithHW
          wallet={{
            ...mockHwWallet,
            signTxWithLedger: mockSignTxWithLedger.loading,
          }}
          unsignedTx={{
            ...mockYoroiTx,
            staking: {
              ...mockYoroiTx.staking,
              withdrawals: {
                'withdrawal-address': {['']: '12356789'},
              },
            },
          }}
          onSuccess={action('onSuccess')}
          onCancel={action('onCancel')}
        />
      </Boundary>
    </WithModal>
  ))
  .add('error', () => (
    <WithModal>
      <Boundary>
        <ConfirmTxWithHW
          wallet={{
            ...mockHwWallet,
            signTxWithLedger: mockSignTxWithLedger.error,
          }}
          unsignedTx={{
            ...mockYoroiTx,
            staking: {
              ...mockYoroiTx.staking,
              withdrawals: {
                'withdrawal-address': {['']: '12356789'},
              },
            },
          }}
          onSuccess={action('onSuccess')}
          onCancel={action('onCancel')}
        />
      </Boundary>
    </WithModal>
  ))
  .add('withdrawals, no deregistrations', () => (
    <WithModal>
      <Boundary>
        <ConfirmTxWithHW
          wallet={{
            ...mockHwWallet,
            signTxWithLedger: mockSignTxWithLedger.success,
            submitTransaction: mockSubmitTransaction.success,
          }}
          unsignedTx={{
            ...mockYoroiTx,
            staking: {
              ...mockYoroiTx.staking,
              withdrawals: {
                'withdrawal-address': {['']: '12356789'},
              },
            },
          }}
          onSuccess={action('onSuccess')}
          onCancel={action('onCancel')}
        />
      </Boundary>
    </WithModal>
  ))
  .add('withdrawals, deregistrations', () => (
    <WithModal>
      <Boundary>
        <ConfirmTxWithHW
          wallet={{
            ...mockHwWallet,
            signTxWithLedger: mockSignTxWithLedger.success,
            submitTransaction: mockSubmitTransaction.success,
          }}
          unsignedTx={{
            ...mockYoroiTx,
            staking: {
              ...mockYoroiTx.staking,
              deregistrations: {
                ...mockYoroiTx.staking.deregistrations,
                'deregistration-address': {['']: '12356789'},
              },
              withdrawals: {
                'withdrawal-address': {['']: '12356789'},
              },
            },
          }}
          onSuccess={action('onSuccess')}
          onCancel={action('onCancel')}
        />
      </Boundary>
    </WithModal>
  ))
  .add('no withdrawals, deregistrations', () => (
    <WithModal>
      <Boundary>
        <ConfirmTxWithHW
          wallet={{
            ...mockHwWallet,
            signTxWithLedger: mockSignTxWithLedger.success,
            submitTransaction: mockSubmitTransaction.success,
          }}
          unsignedTx={{
            ...mockYoroiTx,
            staking: {
              ...mockYoroiTx.staking,
              deregistrations: {
                ...mockYoroiTx.staking.deregistrations,
                'deregistration-address': {['']: '12356789'},
              },
            },
          }}
          onSuccess={action('onSuccess')}
          onCancel={action('onCancel')}
        />
      </Boundary>
    </WithModal>
  ))
