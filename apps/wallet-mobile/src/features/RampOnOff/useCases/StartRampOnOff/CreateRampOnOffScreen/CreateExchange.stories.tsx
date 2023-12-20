import {storiesOf} from '@storybook/react-native'
import {produce} from 'immer'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../../yoroi-wallets/mocks'
import {mockExchangeStateDefault} from '../../../common/mocks'
import {RampOnOffProvider} from '../../../common/RampOnOffProvider'
import CreateExchange from './CreateExchange'

storiesOf('RampOnOff Create Exchange', module) //
  .add('Initial', () => <Initial />)
  .add('Buy Ada', () => <BuyAda />)
  .add('Sell Ada', () => <SellAda />)

const Initial = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <RampOnOffProvider>
        <CreateExchange />
      </RampOnOffProvider>
    </SelectedWalletProvider>
  )
}

const BuyAda = () => {
  const initialState = produce(mockExchangeStateDefault, (draft) => {
    draft.actionType = 'buy'
  })
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <RampOnOffProvider initialState={initialState}>
        <CreateExchange />
      </RampOnOffProvider>
    </SelectedWalletProvider>
  )
}

const SellAda = () => {
  const initialState = produce(mockExchangeStateDefault, (draft) => {
    draft.actionType = 'sell'
  })
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <RampOnOffProvider initialState={initialState}>
        <CreateExchange />
      </RampOnOffProvider>
    </SelectedWalletProvider>
  )
}
