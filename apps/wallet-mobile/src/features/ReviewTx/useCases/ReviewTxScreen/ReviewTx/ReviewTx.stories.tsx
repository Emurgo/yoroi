import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {WalletManagerProviderMock} from '../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {mocks} from '../../../common/mocks'
import {FormattedTx} from '../../../common/types'
import {ReviewTx} from './ReviewTx'

storiesOf('Review Tx Screen', module)
  .addDecorator((story) => <WalletManagerProviderMock>{story()}</WalletManagerProviderMock>)
  .add('Only Ada Tx / One Receiver', () => <Component formattedTx={mocks.formattedTxs.onlyAdaOneReceiver} />)
  .add('Only Ada Tx / Multi Receiver', () => <Component formattedTx={mocks.formattedTxs.onlyAdaMultiReceiver} />)
  .add('Multi Asset Tx / One Receiver', () => <Component formattedTx={mocks.formattedTxs.multiAssetOneReceiver} />)
  .add('Multi Asset Tx / Multi Receiver', () => <Component formattedTx={mocks.formattedTxs.multiAssetMultiReceiver} />)

const Component = ({formattedTx}: {formattedTx: FormattedTx}) => {
  return (
    <ReviewTx
      formattedTx={formattedTx}
      formattedMetadata={undefined}
      operations={undefined}
      details={undefined}
      receiverCustomTitle={undefined}
      onConfirm={action('onConfirm')}
    />
  )
}
