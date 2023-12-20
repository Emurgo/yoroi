import {storiesOf} from '@storybook/react-native'
import {produce} from 'immer'
import React from 'react'

import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {mockExchangeStateDefault} from '../../common/mocks'
import {RampOnOffProvider} from '../../common/RampOnOffProvider'
import {CreateExchange} from './CreateExchange'

storiesOf('RampOnOff CreateExchange', module) //
  .addDecorator((story) => <SelectedWalletProvider wallet={walletMocks.wallet}>{story()}</SelectedWalletProvider>)
  .add('initial', () => <Initial />)
  .add('buy', () => <BuyAda />)
  .add('sell', () => <SellAda />)

const Initial = () => {
  return (
    <RampOnOffProvider>
      <CreateExchange />
    </RampOnOffProvider>
  )
}

const BuyAda = () => {
  const initialState = produce(mockExchangeStateDefault, (draft) => {
    draft.orderType = 'buy'
  })
  return (
    <RampOnOffProvider initialState={initialState}>
      <CreateExchange />
    </RampOnOffProvider>
  )
}

const SellAda = () => {
  const initialState = produce(mockExchangeStateDefault, (draft) => {
    draft.orderType = 'sell'
  })
  return (
    <RampOnOffProvider initialState={initialState}>
      <CreateExchange />
    </RampOnOffProvider>
  )
}
