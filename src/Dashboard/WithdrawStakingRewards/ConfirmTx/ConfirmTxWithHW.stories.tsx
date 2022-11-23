import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks, WithModal} from '../../../../storybook'
import {Boundary} from '../../../components'
import {ConfirmTxWithHW} from './ConfirmTxWithHW'

storiesOf('ConfirmWithdrawalTx/HW', module)
  .add('loading', () => (
    <WithModal>
      <Boundary>
        <ConfirmTxWithHW
          wallet={{
            ...mocks.hwWallet,
            signTxWithLedger: mocks.signTxWithLedger.loading,
          }}
          unsignedTx={{
            ...mocks.unsignedYoroiTx,
            staking: {
              ...mocks.unsignedYoroiTx.staking,
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
            ...mocks.hwWallet,
            signTxWithLedger: mocks.signTxWithLedger.error,
          }}
          unsignedTx={{
            ...mocks.unsignedYoroiTx,
            staking: {
              ...mocks.unsignedYoroiTx.staking,
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
            ...mocks.hwWallet,
            signTxWithLedger: mocks.signTxWithLedger.success,
            submitTransaction: mocks.submitTransaction.success,
          }}
          unsignedTx={{
            ...mocks.unsignedYoroiTx,
            staking: {
              ...mocks.unsignedYoroiTx.staking,
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
            ...mocks.hwWallet,
            signTxWithLedger: mocks.signTxWithLedger.success,
            submitTransaction: mocks.submitTransaction.success,
          }}
          unsignedTx={{
            ...mocks.unsignedYoroiTx,
            staking: {
              ...mocks.unsignedYoroiTx.staking,
              deregistrations: {
                ...mocks.unsignedYoroiTx.staking.deregistrations,
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
            ...mocks.hwWallet,
            signTxWithLedger: mocks.signTxWithLedger.success,
            submitTransaction: mocks.submitTransaction.success,
          }}
          unsignedTx={{
            ...mocks.unsignedYoroiTx,
            staking: {
              ...mocks.unsignedYoroiTx.staking,
              deregistrations: {
                ...mocks.unsignedYoroiTx.staking.deregistrations,
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
