import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks, WithModal} from '../../../storybook'
import {Boundary} from '../../components'
import {ConfirmTxWithOSAndSubmit} from './ConfirmTxWithOSAndSubmit'

storiesOf('ConfirmTx/ConfirmTxWithOSAndSubmit', module).add('default', () => (
  <WithModal>
    <Boundary>
      <ConfirmTxWithOSAndSubmit
        wallet={{
          ...mocks.wallet,
          submitTransaction: async (yoroiSignedTx) => {
            action('onSubmit')(yoroiSignedTx)
            return []
          },
        }}
        unsignedTx={mocks.yoroiUnsignedTx}
        onSuccess={action('onSuccess')}
      />
    </Boundary>
  </WithModal>
))
