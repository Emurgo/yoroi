import {storiesOf} from '@storybook/react-native'
import {mockSwapManager, mockSwapStateDefault, orderMocks, SwapOrderCalculation, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks'
import {SelectedWalletProvider} from '../../../AddWallet/common/Context'
import {mocks} from '../../common/mocks'
import {SwapFormProvider} from '../../common/SwapFormProvider'
import {TransactionSummary} from './TransactionSummary'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

storiesOf('TransactionSummary', module) //
  .add('default', () => {
    return (
      <View style={styles.container}>
        <TxSummary calculation={defaultCalculation} />
      </View>
    )
  })
  .add('Price Alert', () => {
    return (
      <View style={styles.container}>
        <TxSummary calculation={priceAlertCalculation} />
      </View>
    )
  })

const TxSummary = ({calculation}: {calculation: SwapOrderCalculation}) => {
  return (
    <SelectedWalletProvider wallet={{...walletMocks.wallet}}>
      <SwapProvider
        initialState={{
          ...mockSwapStateDefault,
          unsignedTx: walletMocks.yoroiUnsignedTx,
          orderData: {...mocks.confirmTx.orderData, selectedPoolCalculation: calculation},
        }}
        swapManager={{
          ...mockSwapManager,
        }}
      >
        <SwapFormProvider>
          <TransactionSummary />
        </SwapFormProvider>
      </SwapProvider>
    </SelectedWalletProvider>
  )
}

const defaultCalculation = orderMocks.mockedOrderCalculations1[0]
const priceAlertCalculation = {
  order: {
    side: 'buy',
    slippage: 10,
    orderType: 'market',
    amounts: {
      sell: {
        quantity: '0',
        tokenId: 'tokenA',
      },
      buy: {
        quantity: '100000001',
        tokenId: 'tokenB',
      },
    },
  },
  sides: {
    buy: {
      quantity: '100000001',
      tokenId: 'tokenB',
    },
    sell: {
      quantity: '7335973',
      tokenId: 'tokenA',
    },
  },
  cost: {
    ptTotalRequired: {
      quantity: '2950000',
      tokenId: '',
    },
    batcherFee: {
      quantity: '950000',
      tokenId: '',
    },
    deposit: {
      quantity: '2000000',
      tokenId: '',
    },
    frontendFeeInfo: {
      fee: {
        tokenId: '',
        quantity: '0',
      },
    },
    liquidityFee: {
      tokenId: 'tokenA',
      quantity: '22008',
    },
  },
  buyAmountWithSlippage: {
    quantity: '90000000',
    tokenId: 'tokenB',
  },
  hasSupply: true,
  prices: {
    base: '0.07214312806368332309',
    market: '0.07214312806368332309',
    actualPrice: '0.08151081111111111111',
    withSlippage: '0.08151081111111111111',
    withFees: '0.08285972917140270829',
    withFeesAndSlippage: '0.09206636666666666667',
    difference: '14.854638820567161388',
    priceImpact: '10.0000000000000000000',
  },
  pool: {
    tokenA: {
      quantity: '529504614',
      tokenId: 'tokenA',
    },
    tokenB: {
      quantity: '7339640354',
      tokenId: 'tokenB',
    },
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3',
    provider: 'muesliswap_v2',
    batcherFee: {
      quantity: '950000',
      tokenId: '',
    },
    deposit: {
      quantity: '2000000',
      tokenId: '',
    },
    poolId: '1',
    lpToken: {
      quantity: '0',
      tokenId: '0',
    },
  },
} as const
