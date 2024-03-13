import {storiesOf} from '@storybook/react-native'
import {produce} from 'immer'
import React from 'react'

import {SelectedWalletProvider} from '../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {ExchangeProvider} from '../../common/ExchangeProvider'
import {mockExchangeStateDefault} from '../../common/mocks'
import {CreateExchangeOrder} from './CreateExchangeOrder'

storiesOf('Exchange CreateExchangeOrder', module) //
  .addDecorator((story) => <SelectedWalletProvider wallet={walletMocks.wallet}>{story()}</SelectedWalletProvider>)
  .add('initial', () => <Initial />)
  .add('buy', () => <BuyAda />)
  .add('sell', () => <SellAda />)

const Initial = () => {
  return (
    <ExchangeProvider>
      <CreateExchangeOrder />
    </ExchangeProvider>
  )
}

const BuyAda = () => {
  const initialState = produce(mockExchangeStateDefault, (draft) => {
    draft.orderType = 'buy'
  })
  return (
    <ExchangeProvider initialState={initialState}>
      <CreateExchangeOrder />
    </ExchangeProvider>
  )
}

const SellAda = () => {
  const initialState = produce(mockExchangeStateDefault, (draft) => {
    draft.orderType = 'sell'
  })
  return (
    <ExchangeProvider initialState={initialState}>
      <CreateExchangeOrder />
    </ExchangeProvider>
  )
}
