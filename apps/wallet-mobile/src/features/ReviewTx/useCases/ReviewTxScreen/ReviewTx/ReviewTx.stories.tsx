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
  .add('Only Ada Tx / MINT (mint data and utxos dont match. Fake data)', () => (
    <Component formattedTx={mocks.formattedTxs.onlyAdaOneReceiverMint} />
  ))
  .add('Only Ada Tx / Reference Inputs', () => (
    <Component formattedTx={mocks.formattedTxs.onlyAdaOneReceiverReferenceInputs} />
  ))
  .add('Only Ada Tx / Multi Receiver', () => <Component formattedTx={mocks.formattedTxs.onlyAdaMultiReceiver} />)
  .add('Multi Asset Tx / One Receiver', () => <Component formattedTx={mocks.formattedTxs.multiAssetOneReceiver} />)
  .add('Multi Asset Tx / Multi Receiver', () => <Component formattedTx={mocks.formattedTxs.multiAssetMultiReceiver} />)

const Component = ({formattedTx}: {formattedTx: FormattedTx}) => {
  return <ReviewTx formattedTx={formattedTx} onConfirm={action('onConfirm')} />
}
