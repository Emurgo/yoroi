import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mockWallet, mockYoroiTx, WithModal} from '../../../storybook'
import {Boundary} from '../../components'
import {ConfirmTxWithHW} from './ConfirmTxWithHW'

storiesOf('ConfirmTx/HW', module)
  // prettier-ignore
  .add('no assets', () => (
    <WithModal>
      <Boundary>
        <ConfirmTxWithHW
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
