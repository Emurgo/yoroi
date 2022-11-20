import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet, mockYoroiSignedTx, mockYoroiTx, WithModal} from '../../../storybook'
import {Boundary} from '../../components'
import {YoroiWallet} from '../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {ConfirmTxWithPassword} from './ConfirmTxWithPassword'

storiesOf('ConfirmTx/Password', module).add('default', () => {
  const wallet: YoroiWallet = {
    ...mockWallet,
    signTx: async (unsignedTx, rootKey) => {
      action('onSign')(unsignedTx, rootKey)
      return mockYoroiSignedTx
    },
    submitTransaction: async (unsignedTx) => {
      action('onSubmit')(unsignedTx)
      return []
    },
  }
  const unsignedTx: YoroiUnsignedTx = {
    ...mockYoroiTx,
  }

  return (
    <WithModal>
      <Boundary>
        <ConfirmTxWithPassword wallet={wallet} unsignedTx={unsignedTx} onSuccess={action('onSuccess')} />
      </Boundary>
    </WithModal>
  )
})
