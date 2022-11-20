import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet, mockYoroiTx, WithModal} from '../../../storybook'
import {Boundary} from '../../components'
import {ConfirmTxWithOS} from './ConfirmTxWithOS'

storiesOf('ConfirmTx/OS', module).add('default', () => (
  <WithModal>
    <Boundary>
      <ConfirmTxWithOS
        wallet={{
          ...mockWallet,
          submitTransaction: async (yoroiSignedTx) => {
            action('onSubmit')(yoroiSignedTx)
            return []
          },
        }}
        unsignedTx={mockYoroiTx}
        onSuccess={action('onSuccess')}
      />
    </Boundary>
  </WithModal>
))
