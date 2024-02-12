/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable react/jsx-curly-brace-presence */
/* import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../../yoroi-wallets/mocks'
import {mocks as sendMocks} from '../../../common/mocks'
import {SendProvider} from '../../../common/SendContext'
import {EditAmountScreen} from './EditAmountScreen'

storiesOf('Edit Amount', module) //
  .add('editing: previous amount as initial', () => {
    return <Editing />
  })
  .add('with error: insuficient balance', () => {
    return <InsuficientBalance />
  })
  .add('with warning: can`t keep assets (min-PT)', () => {
    return <OverSpendable />
  })
  .add('non primary token', () => {
    return <NonPrimary />
  })
  .add('adding: empty initial', () => {
    return <Adding />
  })

const NonPrimary = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SendProvider initialState={sendMocks.editingAmount.secondaryToken}>
        <EditAmountScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

const Editing = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SendProvider initialState={sendMocks.editingAmount.initialQuantity}>
        <EditAmountScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

const Adding = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SendProvider initialState={sendMocks.editingAmount.adding}>
        <EditAmountScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

const InsuficientBalance = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SendProvider initialState={sendMocks.editingAmount.insuficientBalance}>
        <EditAmountScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

const OverSpendable = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SendProvider initialState={{}}>
        <EditAmountScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
}
 */
