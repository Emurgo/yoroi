/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable react/jsx-curly-brace-presence */
import {storiesOf} from '@storybook/react-native'
import {TransferProvider} from '@yoroi/transfer'
import React from 'react'

import {mocks as walletMocks} from '../../../../../yoroi-wallets/mocks'
import {WalletManagerProviderMock} from '../../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {mocks as sendMocks} from '../../../common/mocks'
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
    <WalletManagerProviderMock wallet={walletMocks.wallet}>
      <TransferProvider initialState={sendMocks.editingAmount.secondaryToken}>
        <EditAmountScreen />
      </TransferProvider>
    </WalletManagerProviderMock>
  )
}

const Editing = () => {
  return (
    <WalletManagerProviderMock wallet={walletMocks.wallet}>
      <TransferProvider initialState={sendMocks.editingAmount.initialQuantity}>
        <EditAmountScreen />
      </TransferProvider>
    </WalletManagerProviderMock>
  )
}

const Adding = () => {
  return (
    <WalletManagerProviderMock wallet={walletMocks.wallet}>
      <TransferProvider initialState={sendMocks.editingAmount.adding}>
        <EditAmountScreen />
      </TransferProvider>
    </WalletManagerProviderMock>
  )
}

const InsuficientBalance = () => {
  return (
    <WalletManagerProviderMock wallet={walletMocks.wallet}>
      <TransferProvider initialState={sendMocks.editingAmount.insuficientBalance}>
        <EditAmountScreen />
      </TransferProvider>
    </WalletManagerProviderMock>
  )
}

const OverSpendable = () => {
  return (
    <WalletManagerProviderMock wallet={walletMocks.wallet}>
      <TransferProvider initialState={{}}>
        <EditAmountScreen />
      </TransferProvider>
    </WalletManagerProviderMock>
  )
}
