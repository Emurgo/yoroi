import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks, WithModal} from '../../../../storybook'
import {Boundary} from '../../../components'
import {ConfirmTxWithOS} from './ConfirmTxWithOS'

storiesOf('ConfirmWithdrawalTx/OS', module)
  .add('withdrawals, no deregistrations', () => (
    <WithModal>
      <Boundary>
        <ConfirmTxWithOS
          {...commonProps}
          wallet={{
            ...mocks.osWallet,
            submitTransaction: mocks.submitTransaction.success,
          }}
          unsignedTx={{
            ...mocks.yoroiUnsignedTx,
            staking: {
              ...mocks.yoroiUnsignedTx.staking,
              withdrawals: {
                'withdrawal-address': {['']: '12356789'},
              },
            },
          }}
        />
      </Boundary>
    </WithModal>
  ))
  .add('withdrawals, deregistrations', () => (
    <WithModal>
      <Boundary>
        <ConfirmTxWithOS
          {...commonProps}
          wallet={{
            ...mocks.osWallet,
            submitTransaction: mocks.submitTransaction.success,
          }}
          unsignedTx={{
            ...mocks.yoroiUnsignedTx,
            staking: {
              ...mocks.yoroiUnsignedTx.staking,
              deregistrations: {
                ...mocks.yoroiUnsignedTx.staking.deregistrations,
                'deregistration-address': {['']: '12356789'},
              },
              withdrawals: {
                ...mocks.yoroiUnsignedTx.staking.withdrawals,
                'withdrawal-address': {['']: '12356789'},
              },
            },
          }}
        />
      </Boundary>
    </WithModal>
  ))

const commonProps = {
  onSuccess: action('onSuccess'),
  onCancel: action('onCancel'),
}
