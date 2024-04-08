import {storiesOf} from '@storybook/react-native'
import {exchangeDefaultState, ExchangeProvider, successManagerMock} from '@yoroi/exchange'
import {produce} from 'immer'
import React from 'react'

import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../WalletManager/Context'
import {CreateExchangeOrderScreen} from './CreateExchangeOrderScreen'

storiesOf('Exchange CreateExchangeOrderScreen', module) //
  .addDecorator((story) => <SelectedWalletProvider wallet={walletMocks.wallet}>{story()}</SelectedWalletProvider>)
  .add('initial', () => <Initial />)
  .add('buy', () => <BuyAda />)
  .add('sell', () => <SellAda />)

const Initial = () => {
  return (
    <ExchangeProvider manager={successManagerMock} initialState={{...exchangeDefaultState, providerId: 'banxa'}}>
      <CreateExchangeOrderScreen />
    </ExchangeProvider>
  )
}
const BuyAda = () => {
  const initialState = produce(exchangeDefaultState, (draft) => {
    draft.orderType = 'buy'
  })
  return (
    <ExchangeProvider manager={successManagerMock} initialState={{...initialState, providerId: 'banxa'}}>
      <CreateExchangeOrderScreen />
    </ExchangeProvider>
  )
}

const SellAda = () => {
  const initialState = produce(exchangeDefaultState, (draft) => {
    draft.orderType = 'sell'
  })
  return (
    <ExchangeProvider manager={successManagerMock} initialState={{...initialState, providerId: 'banxa'}}>
      <CreateExchangeOrderScreen />
    </ExchangeProvider>
  )
}
