import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, SwapProvider} from '@yoroi/swap'
import {produce} from 'immer'
import React from 'react'

import {SelectedWalletProvider} from '../../../../../SelectedWallet'
import {mocks as walletMocks} from '../../../../../yoroi-wallets/mocks'
import {SwapFormProvider} from '../../../common/SwapFormProvider'
import {CreateOrder} from './CreateOrder'

storiesOf('Swap Create Order', module) //
  .add('Initial', () => <Initial />)
  .add('Market Order', () => <MarketOrder />)
  .add('Limit Order', () => <LimitOrder />)
  .add('Sell Amount Primary Token', () => <EditSellAmountPrimaryToken />)
  .add('Sell Amount Secondary Token', () => <EditSellAmountSecondaryToken />)
  .add('Sell Amount Unnamed Token', () => <EditSellAmountUnnamedToken />)
  .add('Sell Amount Unnamed Token', () => <EditSellAmountUnnamedToken />)
  .add('Sell Amount icon + big decimals', () => <EditSellAmountIconAndDecimals />)

const Initial = () => {
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager}>
        <SwapFormProvider>
          <CreateOrder />
        </SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}

const MarketOrder = () => {
  const initialState = produce(mockSwapStateDefault, (draft) => {
    draft.orderData.type = 'market'
  })
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
        <SwapFormProvider>
          <CreateOrder />
        </SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}

const LimitOrder = () => {
  const initialState = produce(mockSwapStateDefault, (draft) => {
    draft.orderData.type = 'limit'
  })
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
        <SwapFormProvider>
          <CreateOrder />
        </SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}

const EditSellAmountPrimaryToken = () => {
  const initialState = produce(mockSwapStateDefault, (draft) => {
    draft.orderData.type = 'market'
  })
  return (
    <SelectedWalletProvider wallet={walletMocks.wallet}>
      <SwapProvider swapManager={mockSwapManager} initialState={initialState}>
        <SwapFormProvider>
          <CreateOrder />
        </SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}

const EditSellAmountSecondaryToken = () => {
  return (
    <SelectedWalletProvider wallet={mockWallet}>
      <SwapProvider swapManager={mockSwapManager} initialState={mockSwapStateSecodaryToken}>
        <SwapFormProvider>
          <CreateOrder />
        </SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}

const EditSellAmountUnnamedToken = () => {
  return (
    <SelectedWalletProvider wallet={mockWallet}>
      <SwapProvider swapManager={mockSwapManager} initialState={mockSwapStateUnamedToken}>
        <SwapFormProvider>
          <CreateOrder />
        </SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}

const EditSellAmountIconAndDecimals = () => {
  return (
    <SelectedWalletProvider wallet={mockWallet}>
      <SwapProvider swapManager={mockSwapManager} initialState={mockSwapStateWithIconBigDecimals}>
        <SwapFormProvider>
          <CreateOrder />
        </SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}

const mockWallet = produce(walletMocks.wallet, (draft) => {
  draft.utxos = [
    {
      utxo_id: '1d38bea2d83eec5cca60ca2c1c3cc0db48b8e2e1a632c2d97849adb5357aca05:1',
      tx_hash: '1d38bea2d83eec5cca60ca2c1c3cc0db48b8e2e1a632c2d97849adb5357aca05',
      tx_index: 1,
      receiver:
        'addr_test1qz54nn8wkn4zppe3js5ta9d4t09nyfmjyx2lh5g37tu6dcwr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0q3pj8n4',
      amount: '2000000',
      assets: [
        {
          assetId: '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f.444444',
          policyId: '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f',
          name: '444444',
          amount: '44',
        },
        {
          assetId: '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f.',
          policyId: '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f',
          name: '',
          amount: '1000',
        },
        {
          assetId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c53',
          policyId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e',
          name: '74484f444c53',
          amount: '1234567800000000',
        },
      ],
    },
  ]
})
const mockSwapStateSecodaryToken = produce(mockSwapStateDefault, (draft) => {
  draft.orderData.amounts.sell.tokenId = '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f.444444'
  draft.orderData.type = 'market'
})
const mockSwapStateUnamedToken = produce(mockSwapStateDefault, (draft) => {
  draft.orderData.amounts.sell.tokenId = '2a0879034f23ea48ba28dc1c15b056bd63b8cf0cab9733da92add22f.'
})
const mockSwapStateWithIconBigDecimals = produce(mockSwapStateDefault, (draft) => {
  draft.orderData.amounts.sell = {
    tokenId: '1d129dc9c03f95a863489883914f05a52e13135994a32f0cbeacc65e.74484f444c53',
    quantity: '12301234567',
  }
})
