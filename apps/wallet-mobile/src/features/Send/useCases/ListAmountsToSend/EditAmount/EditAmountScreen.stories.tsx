/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable react/jsx-curly-brace-presence */
import {storiesOf} from '@storybook/react-native'
import {TransferProvider} from '@yoroi/transfer'
import React from 'react'

import {mocks as walletMocks} from '../../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../../AddWallet/common/Context'
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
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <TransferProvider initialState={sendMocks.editingAmount.secondaryToken}>
        <EditAmountScreen />
      </TransferProvider>
    </SelectedWalletProvider>
  )
}

const Editing = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <TransferProvider initialState={sendMocks.editingAmount.initialQuantity}>
        <EditAmountScreen />
      </TransferProvider>
    </SelectedWalletProvider>
  )
}

const Adding = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <TransferProvider initialState={sendMocks.editingAmount.adding}>
        <EditAmountScreen />
      </TransferProvider>
    </SelectedWalletProvider>
  )
}

const InsuficientBalance = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <TransferProvider initialState={sendMocks.editingAmount.insuficientBalance}>
        <EditAmountScreen />
      </TransferProvider>
    </SelectedWalletProvider>
  )
}

const OverSpendable = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <TransferProvider initialState={{}}>
        <EditAmountScreen />
      </TransferProvider>
    </SelectedWalletProvider>
  )
}
