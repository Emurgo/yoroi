import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModal} from '../../../../../.storybook/decorators'
import {Boundary} from '../../../../components'
import {mocks} from '../../../../yoroi-wallets/mocks'
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
            ...mocks.yoroiUnsignedTx,
            staking: {
              ...mocks.yoroiUnsignedTx.staking,
              withdrawals: [{address: 'withdrawal-address', amounts: {['']: '12356789'}}],
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
            ...mocks.yoroiUnsignedTx,
            staking: {
              ...mocks.yoroiUnsignedTx.staking,
              withdrawals: [{address: 'withdrawal-address', amounts: {['']: '12356789'}}],
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
            ...mocks.yoroiUnsignedTx,
            staking: {
              ...mocks.yoroiUnsignedTx.staking,
              withdrawals: [{address: 'withdrawal-address', amounts: {['']: '12356789'}}],
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
            ...mocks.yoroiUnsignedTx,
            staking: {
              ...mocks.yoroiUnsignedTx.staking,
              deregistrations: [{address: 'deregistration-address', amounts: {['']: '12356789'}}],
              withdrawals: [{address: 'withdrawal-address', amounts: {['']: '12356789'}}],
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
            ...mocks.yoroiUnsignedTx,
            staking: {
              ...mocks.yoroiUnsignedTx.staking,
              deregistrations: [{address: 'deregistration-address', amounts: {['']: '12356789'}}],
            },
          }}
          onSuccess={action('onSuccess')}
          onCancel={action('onCancel')}
        />
      </Boundary>
    </WithModal>
  ))
