import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {balances, mockWallet} from '../../../storybook'
import {PRIMARY_ASSET_CONSTANTS} from '../../legacy/networks'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {YoroiWallet} from '../../yoroi-wallets'
import {SendProvider, useSend} from '../Context/SendContext'
import {SendScreen} from './SendScreen'

storiesOf('SendScreen', module)
  .addDecorator((story) => <SelectedWalletProvider wallet={mockWallet}>{story()}</SelectedWalletProvider>)
  .add('Default', () => <SendScreenTest />)
  .add('SendAll', () => <SendScreenTest isSendAll />)

const SendScreenTest = ({isSendAll}: {isSendAll?: boolean}) => {
  const wallet: YoroiWallet = {
    ...mockWallet,
    subscribe: () => action('subscribe'),
  }

  return (
    <SelectedWalletProvider wallet={wallet}>
      <SendProvider key={wallet.id} wallet={wallet} balances={balances}>
        <SendScreenWapper isSendAll={isSendAll} />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

const SendScreenWapper = ({isSendAll}: {isSendAll?: boolean}) => {
  const {sendActions} = useSend()

  React.useEffect(() => {
    if (isSendAll) {
      sendActions.setSendAll(true)
    }
  }, [sendActions, isSendAll])

  React.useEffect(() => {
    sendActions.setSelectedTokenId(PRIMARY_ASSET_CONSTANTS.CARDANO)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <SendScreen />
}
