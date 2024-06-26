import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WithModal} from '../../../../../.storybook/decorators'
import {Boundary} from '../../../../components'
import {mocks} from '../../../../yoroi-wallets/mocks'
import {ConfirmTxWithOS} from './ConfirmTxWithOS'

storiesOf('ConfirmWithdrawalTx/OS', module)
  .add('withdrawals, no deregistrations', () => (
    <WithModal>
      <Boundary>
        <ConfirmTxWithOS
          {...commonProps}
          wallet={{
            ...mocks.wallet,
            submitTransaction: mocks.submitTransaction.success,
          }}
          unsignedTx={{
            ...mocks.yoroiUnsignedTx,
            staking: {
              ...mocks.yoroiUnsignedTx.staking,
              withdrawals: [{address: 'withdrawal-address', amounts: {['']: '12356789'}}],
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
            ...mocks.wallet,
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
        />
      </Boundary>
    </WithModal>
  ))

const commonProps = {
  onSuccess: action('onSuccess'),
  onCancel: action('onCancel'),
}
