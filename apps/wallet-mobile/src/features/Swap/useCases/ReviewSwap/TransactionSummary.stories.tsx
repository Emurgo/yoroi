import {storiesOf} from '@storybook/react-native'
import {tokenInfoMocks} from '@yoroi/portfolio'
import {mockSwapManager, mockSwapStateDefault, orderMocks, SwapOrderCalculation, SwapProvider} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
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
  const orderData = {...mocks.confirmTx.orderData, selectedPoolCalculation: calculation}
  return (
    <WalletManagerProviderMock wallet={{...walletMocks.wallet}}>
      <SwapProvider
        initialState={{
          ...mockSwapStateDefault,
          unsignedTx: walletMocks.yoroiUnsignedTx,
          orderData,
        }}
        swapManager={{
          ...mockSwapManager,
        }}
      >
        <SwapFormProvider>
          <TransactionSummary orderData={orderData} />
        </SwapFormProvider>
      </SwapProvider>
    </WalletManagerProviderMock>
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
        quantity: 0n,
        info: {
          ...tokenInfoMocks.ftNameless,
          id: 'token.A',
        },
      },
      buy: {
        quantity: 100000001n,
        info: {
          ...tokenInfoMocks.ftNameless,
          id: 'token.B',
        },
      },
    },
  },
  sides: {
    buy: {
      quantity: 100000001n,
      info: {
        ...tokenInfoMocks.ftNameless,
        id: 'token.B',
      },
    },
    sell: {
      quantity: 7335973n,
      info: {
        ...tokenInfoMocks.ftNameless,
        id: 'token.A',
      },
    },
  },
  cost: {
    ptTotalRequired: {
      quantity: 2950000n,
      info: tokenInfoMocks.primaryETH,
    },
    batcherFee: {
      quantity: 950000n,
      info: tokenInfoMocks.primaryETH,
    },
    deposit: {
      quantity: 2000000n,
      info: tokenInfoMocks.primaryETH,
    },
    frontendFeeInfo: {
      fee: {
        quantity: 0n,
        info: tokenInfoMocks.primaryETH,
      },
    },
    liquidityFee: {
      quantity: 22008n,
      info: {
        ...tokenInfoMocks.ftNameless,
        id: 'token.A',
      },
    },
  },
  buyAmountWithSlippage: {
    quantity: 90000000n,
    info: {
      ...tokenInfoMocks.ftNameless,
      id: 'token.B',
    },
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
      quantity: 529504614n,
      tokenId: 'token.A',
    },
    tokenB: {
      quantity: 7339640354n,
      tokenId: 'token.B',
    },
    ptPriceTokenA: '1',
    ptPriceTokenB: '0.0695404765',
    fee: '0.3',
    provider: 'muesliswap_v2',
    batcherFee: {
      quantity: 950000n,
      tokenId: '.',
    },
    deposit: {
      quantity: 2000000n,
      tokenId: '.',
    },
    poolId: '1',
    lpToken: {
      quantity: 0n,
      tokenId: 'unknown.',
    },
  },
} as const
