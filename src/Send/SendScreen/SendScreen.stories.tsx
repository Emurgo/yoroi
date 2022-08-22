import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {mockWallet} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {YoroiWallet} from '../../yoroi-wallets'
import {SendProvider, useSend} from '../Context/SendContext'
import {SendScreen} from './SendScreen'

storiesOf('SendScreen', module)
  .add('Default', () => <SendScreenTest />)
  .add('SendAll', () => <SendScreenTest isSendAll />)

const SendScreenTest = ({isSendAll}: {isSendAll?: boolean}) => {
  const wallet: YoroiWallet = {
    ...mockWallet,
    subscribe: () => action('subscribe'),
  }

  return (
    <SelectedWalletProvider wallet={wallet}>
      <SendProvider key={wallet.id} wallet={wallet}>
        <SendScreenWapper isSendAll={isSendAll} />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

const SendScreenWapper = ({isSendAll = false}: {isSendAll: boolean | undefined}) => {
  const {allTokensSelected} = useSend()

  React.useEffect(() => {
    if (isSendAll === false) return
    allTokensSelected()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <SendScreen />
}
