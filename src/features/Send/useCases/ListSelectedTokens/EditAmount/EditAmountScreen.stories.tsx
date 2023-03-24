/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable react/jsx-curly-brace-presence */
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks} from '../../../../../yoroi-wallets/mocks'
import {SendProvider} from '../../../common/SendContext'
import {EditAmountScreen} from './EditAmountScreen'

const PrimaryToken = () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SendProvider initialState={{}}>
        <EditAmountScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

const NonPrimary = () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SendProvider initialState={{}}>
        <EditAmountScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

const Editing = () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SendProvider initialState={{}}>
        <EditAmountScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

const Adding = () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SendProvider initialState={{}}>
        <EditAmountScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

const InsuficientBalance = () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SendProvider initialState={{}}>
        <EditAmountScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

const OverLockedBalance = () => {
  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SendProvider initialState={{}}>
        <EditAmountScreen />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

storiesOf('Send/ListSelectedTokens/EditAmountScreen', module) //
  .add('editing: previous amount as initial', () => {
    return <Editing />
  })
  .add('with error: insuficient balance', () => {
    return <InsuficientBalance />
  })
  .add('with warning: can`t keep assets (min-PT)', () => {
    return <OverLockedBalance />
  })
  .add('primary token: max balance', () => {
    return <PrimaryToken />
  })
  .add('non primary token', () => {
    return <NonPrimary />
  })
  .add('adding: empty initial', () => {
    return <Adding />
  })
