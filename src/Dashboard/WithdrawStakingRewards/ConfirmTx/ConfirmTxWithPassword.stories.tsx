import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockKeyStore, mockWallet, mockYoroiSignedTx, mockYoroiTx, WithModal} from '../../../../storybook'
import {Boundary} from '../../../components'
import KeyStore from '../../../legacy/KeyStore'
import {YoroiWallet} from '../../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {ConfirmTxWithPassword} from './ConfirmTxWithPassword'

storiesOf('ConfirmWithdrawalTx/Password', module)
  .add('withdrawals, no deregistrations', () => {
    const wallet: YoroiWallet = {
      ...mockWallet,
      signTx: async (unsignedTx, masterKey) => {
        action('onSign')(unsignedTx, masterKey)
        return mockYoroiSignedTx
      },
      submitTransaction: async (unsignedTx) => {
        action('onSubmit')(unsignedTx)
        return []
      },
    }
    const storage: typeof KeyStore = mockKeyStore({
      getData: async (_keyId, _encryptionMethod, _message, _password, _intl) => {
        action('getData')(_keyId, _encryptionMethod, _message, _password, _intl)
        return 'masterkey'
      },
    })
    const unsignedTx: YoroiUnsignedTx = {
      ...mockYoroiTx,
      staking: {
        ...mockYoroiTx.staking,
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
            storage={storage}
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
      ...mockWallet,
      signTx: async (unsignedTx, masterKey) => {
        action('onSign')(unsignedTx, masterKey)
        return mockYoroiSignedTx
      },
      submitTransaction: async (unsignedTx) => {
        action('onSubmit')(unsignedTx)
        return []
      },
    }
    const storage: typeof KeyStore = mockKeyStore({
      getData: async (_keyId, _encryptionMethod, _message, _password, _intl) => {
        action('getData')(_keyId, _encryptionMethod, _message, _password, _intl)
        return 'masterkey'
      },
    })
    const unsignedTx: YoroiUnsignedTx = {
      ...mockYoroiTx,
      staking: {
        ...mockYoroiTx.staking,
        deregistrations: {
          ...mockYoroiTx.staking.deregistrations,
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
            storage={storage}
            unsignedTx={unsignedTx}
            onSuccess={action('onSuccess')}
            onCancel={action('onCancel')}
          />
        </Boundary>
      </WithModal>
    )
  })
