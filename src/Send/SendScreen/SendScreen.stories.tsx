import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {balance, mockWallet} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {SendProvider, useSendContext} from '../Context/SendContext'
import {SendScreen} from './SendScreen'

storiesOf('SendScreen', module)
  .addDecorator((story) => <SelectedWalletProvider wallet={mockWallet}>{story()}</SelectedWalletProvider>)
  .add('Default', () => <SendScreenTest isSendAll={false} />)
  .add('SendAll', () => <SendScreenTest isSendAll={true} />)

const SendScreenTest = ({isSendAll}: Props) => {
  mockWallet.subscribe = () => undefined

  return (
    <SendProvider wallet={mockWallet} balance={balance}>
      <SendScreenWapper isSendAll={isSendAll} />
    </SendProvider>
  )
}

const SendScreenWapper = ({isSendAll}: Props) => {
  const {setSendAll, setSelectedTokenIdentifier} = useSendContext()

  setSelectedTokenIdentifier(Object.keys(balance)[0])

  if (isSendAll) {
    setSendAll(true)
  }

  return <SendScreen />
}

type Props = {
  isSendAll: boolean
}
