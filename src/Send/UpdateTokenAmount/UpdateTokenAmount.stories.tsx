/* eslint-disable react/jsx-curly-brace-presence */
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {mocks} from '../../../storybook'
import {SelectedWalletProvider} from '../../SelectedWallet'
import {Quantity} from '../../yoroi-wallets/types'
import {Quantities} from '../../yoroi-wallets/utils'
import {SendProvider} from '../Context/SendContext'
import {UpdateTokenAmount} from './UpdateTokenAmount'

const primaryTokenInfo = mocks.wallet.primaryTokenInfo
const primaryBalance = mocks.balances[primaryTokenInfo.id]

const tokenInfo = mocks.tokenInfos['1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c53']
const tokenBalance = mocks.balances['1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c53']

const PrimaryToken = () => {
  // ctx initial
  const tokenInfo = primaryTokenInfo
  const balance = primaryBalance
  const reserved = Quantities.atomic(0, tokenInfo.decimals)
  const locked = Quantities.atomic(0, tokenInfo.decimals)

  const [quantity, setQuantity] = React.useState<Quantity>(balance)

  const total = Quantities.sum([quantity, reserved])
  const notEnoughBalance = Quantities.isGreaterThan(total, balance)

  const unlockedBalance = Quantities.diff(balance, locked)
  const cantKeepAssets = !Quantities.isZero(locked) && Quantities.isGreaterThan(total, unlockedBalance)

  const onChange = (newQuantity: Quantity) => {
    setQuantity(newQuantity)
    action(`onChange`)
  }

  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SendProvider wallet={mocks.wallet} initialState={{receiver: 'storybook: receiver uri or address'}}>
        <UpdateTokenAmount
          balance={primaryBalance}
          tokenInfo={primaryTokenInfo}
          onChange={onChange}
          quantity={quantity}
          notEnoughBalance={notEnoughBalance}
          cantKeepAssets={cantKeepAssets}
        />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

const NonPrimary = () => {
  // ctx initial
  const balance = tokenBalance
  const reserved = Quantities.atomic(0, tokenInfo.decimals)
  const locked = Quantities.atomic(0, tokenInfo.decimals)

  const [quantity, setQuantity] = React.useState<Quantity>(balance)

  const total = Quantities.sum([quantity, reserved])
  const notEnoughBalance = Quantities.isGreaterThan(total, balance)

  const unlockedBalance = Quantities.diff(balance, locked)
  const cantKeepAssets = !Quantities.isZero(locked) && Quantities.isGreaterThan(total, unlockedBalance)

  const onChange = (newQuantity: Quantity) => {
    setQuantity(newQuantity)
    action(`onChange`)
  }

  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SendProvider wallet={mocks.wallet} initialState={{receiver: 'storybook: receiver uri or address'}}>
        <UpdateTokenAmount
          balance={tokenBalance}
          tokenInfo={tokenInfo}
          onChange={onChange}
          quantity={quantity}
          notEnoughBalance={notEnoughBalance}
          cantKeepAssets={cantKeepAssets}
        />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

const Editing = () => {
  // ctx initial
  const balance = tokenBalance
  const reserved = Quantities.atomic(0, tokenInfo.decimals)
  const locked = Quantities.atomic(0, tokenInfo.decimals)

  const [quantity, setQuantity] = React.useState<Quantity>(balance)

  const total = Quantities.sum([quantity, reserved])
  const notEnoughBalance = Quantities.isGreaterThan(total, balance)

  const unlockedBalance = Quantities.diff(balance, locked)
  const cantKeepAssets = !Quantities.isZero(locked) && Quantities.isGreaterThan(total, unlockedBalance)

  const onChange = (newQuantity: Quantity) => {
    setQuantity(newQuantity)
    action(`onChange`)
  }

  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SendProvider wallet={mocks.wallet} initialState={{receiver: 'storybook: receiver uri or address'}}>
        <UpdateTokenAmount
          balance={tokenBalance}
          tokenInfo={tokenInfo}
          onChange={onChange}
          quantity={quantity}
          notEnoughBalance={notEnoughBalance}
          cantKeepAssets={cantKeepAssets}
        />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

const Adding = () => {
  // ctx initial
  const balance = tokenBalance
  const reserved = Quantities.atomic(0, tokenInfo.decimals)
  const locked = Quantities.atomic(0, tokenInfo.decimals)

  const [quantity, setQuantity] = React.useState<Quantity>('0')

  const total = Quantities.sum([quantity, reserved])
  const notEnoughBalance = Quantities.isGreaterThan(total, balance)

  const unlockedBalance = Quantities.diff(balance, locked)
  const cantKeepAssets = !Quantities.isZero(locked) && Quantities.isGreaterThan(total, unlockedBalance)

  const onChange = (newQuantity: Quantity) => {
    setQuantity(newQuantity)
    action(`onChange`)
  }

  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SendProvider wallet={mocks.wallet} initialState={{receiver: 'storybook: receiver uri or address'}}>
        <UpdateTokenAmount
          balance={tokenBalance}
          tokenInfo={tokenInfo}
          onChange={onChange}
          quantity={quantity}
          notEnoughBalance={notEnoughBalance}
          cantKeepAssets={cantKeepAssets}
        />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

const InsuficientBalance = () => {
  // ctx initial
  const balance = tokenBalance
  const reserved = Quantities.atomic(0, tokenInfo.decimals)
  const locked = Quantities.atomic(0, tokenInfo.decimals)

  const [quantity, setQuantity] = React.useState<Quantity>(Quantities.sum([balance, '1']))

  const total = Quantities.sum([quantity, reserved])
  const notEnoughBalance = Quantities.isGreaterThan(total, balance)

  const unlockedBalance = Quantities.diff(balance, locked)
  const cantKeepAssets = !Quantities.isZero(locked) && Quantities.isGreaterThan(total, unlockedBalance)

  const onChange = (newQuantity: Quantity) => {
    setQuantity(newQuantity)
    action(`onChange`)
  }

  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SendProvider wallet={mocks.wallet} initialState={{receiver: 'storybook: receiver uri or address'}}>
        <UpdateTokenAmount
          balance={balance}
          tokenInfo={tokenInfo}
          onChange={onChange}
          quantity={quantity}
          notEnoughBalance={notEnoughBalance}
          cantKeepAssets={cantKeepAssets}
        />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

const OverLockedBalance = () => {
  // ctx initial
  const tokenInfo = primaryTokenInfo
  const balance = Quantities.atomic(2.5, tokenInfo.decimals)
  const reserved = Quantities.atomic(0, tokenInfo.decimals)
  const locked = Quantities.atomic(1, tokenInfo.decimals)

  const [quantity, setQuantity] = React.useState<Quantity>(Quantities.atomic(1.6, tokenInfo.decimals))

  const total = Quantities.sum([quantity, reserved])
  const notEnoughBalance = Quantities.isGreaterThan(total, balance)

  const unlockedBalance = Quantities.diff(balance, locked)
  const cantKeepAssets = !Quantities.isZero(locked) && Quantities.isGreaterThan(total, unlockedBalance)

  const onChange = (newQuantity: Quantity) => {
    setQuantity(newQuantity)
    action(`onChange`)
  }

  return (
    <SelectedWalletProvider wallet={mocks.wallet}>
      <SendProvider wallet={mocks.wallet} initialState={{receiver: 'storybook: receiver uri or address'}}>
        <UpdateTokenAmount
          balance={balance}
          tokenInfo={tokenInfo}
          onChange={onChange}
          quantity={quantity}
          notEnoughBalance={notEnoughBalance}
          cantKeepAssets={cantKeepAssets}
        />
      </SendProvider>
    </SelectedWalletProvider>
  )
}

storiesOf('UpdateTokenAmount', module) //
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
