import {makeLimitOrder, makePossibleMarketOrder, useSwap, useSwapCreateOrder, useSwapPoolsByPair} from '@yoroi/swap'
import {Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {KeyboardAvoidingView, Platform, StyleSheet, View, ViewProps} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {Button, Spacer} from '../../../../../components'
import {LoadingOverlay} from '../../../../../components/LoadingOverlay'
import {useMetrics} from '../../../../../metrics/metricsManager'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {isEmptyString} from '../../../../../utils'
import {NotEnoughMoneyToSendError} from '../../../../../yoroi-wallets/cardano/types'
import {useBalance, useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../yoroi-wallets/utils'
import {createYoroiEntry} from '../../../common/helpers'
import {useNavigateTo} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'
import {useSwapTouched} from '../../../common/SwapFormProvider'
import {useSwapTx} from '../../../common/useSwapTx'
import {EditBuyAmount} from './EditBuyAmount/EditBuyAmount'
import {EditLimitPrice} from './EditLimitPrice'
import {ShowPoolActions} from './EditPool/ShowPoolActions'
import {EditSellAmount} from './EditSellAmount/EditSellAmount'
import {EditSlippage} from './EditSlippage/EditSlippage'
import {LimitPriceWarning} from './LimitPriceWarning/LimitPriceWarning'
import {ShowTokenActions} from './ShowTokenActions/ShowTokenActions'
import {TopTokenActions} from './ShowTokenActions/TopTokenActions'

const LIMIT_PRICE_WARNING_THRESHOLD = 0.1 // 10%

export const CreateOrder = () => {
  const strings = useStrings()
  const navigation = useNavigateTo()
  const {orderData, unsignedTxChanged, poolPairsChanged} = useSwap()
  const wallet = useSelectedWallet()
  const {track} = useMetrics()
  const {isBuyTouched, isSellTouched, poolDefaulted} = useSwapTouched()
  const [sellBackendError, setSellBackendError] = React.useState('')

  useSwapPoolsByPair(
    {
      tokenA: orderData.amounts.sell.tokenId,
      tokenB: orderData.amounts.buy.tokenId,
    },
    {
      enabled: isBuyTouched && isSellTouched,
      onSuccess: (pools) => {
        poolPairsChanged(pools)
      },
    },
  )

  const sellTokenInfo = useTokenInfo({
    wallet,
    tokenId: orderData.amounts.sell.tokenId,
  })
  const buyTokenInfo = useTokenInfo({
    wallet,
    tokenId: orderData.amounts.buy.tokenId,
  })
  const [showLimitPriceWarning, setShowLimitPriceWarning] = React.useState(false)

  React.useEffect(() => {
    if (orderData.selectedPoolId === orderData.bestPoolCalculation?.pool.poolId) poolDefaulted()
  }, [orderData.selectedPoolId, orderData.bestPoolCalculation, poolDefaulted])

  const {createUnsignedTx, isLoading} = useSwapTx({
    onSuccess: (yoroiUnsignedTx) => {
      unsignedTxChanged(yoroiUnsignedTx)
      swap()
      setShowLimitPriceWarning(false)
    },
    onError: (error) => {
      if (error instanceof NotEnoughMoneyToSendError) {
        setSellBackendError(strings.notEnoughBalance)
      } else {
        console.error(error)
      }
    },
  })

  const {createOrderData} = useSwapCreateOrder({
    onSuccess: (data: Swap.CreateOrderResponse) => {
      if (data?.contractAddress !== undefined && orderData.selectedPoolCalculation?.pool !== undefined) {
        const {amounts, limitPrice, slippage, selectedPoolCalculation} = orderData
        const entry = createYoroiEntry(
          {
            amounts,
            limitPrice,
            address: data.contractAddress,
            slippage,
            selectedPool: selectedPoolCalculation.pool,
          },
          data.contractAddress,
          wallet,
        )
        const datum = {data: data.datum}
        createUnsignedTx({entry, datum})
      }
    },
    onError: (error) => {
      console.log(error)
    },
  })

  const sellError = useSellError([sellBackendError])
  const buyError = useBuyError()

  const disabled =
    !isBuyTouched ||
    !isSellTouched ||
    Quantities.isZero(orderData.amounts.buy.quantity) ||
    Quantities.isZero(orderData.amounts.sell.quantity) ||
    (orderData.type === 'limit' && orderData.limitPrice !== undefined && Quantities.isZero(orderData.limitPrice)) ||
    !isEmptyString(sellError) ||
    !isEmptyString(buyError)

  const swap = () => {
    if (orderData.selectedPoolCalculation === undefined) return
    track.swapOrderSelected({
      from_asset: [
        {asset_name: sellTokenInfo.name, asset_ticker: sellTokenInfo.ticker, policy_id: sellTokenInfo.group},
      ],
      to_asset: [{asset_name: buyTokenInfo.name, asset_ticker: buyTokenInfo.ticker, policy_id: buyTokenInfo.group}],
      order_type: orderData.type,
      slippage_tolerance: orderData.slippage,
      from_amount: orderData.amounts.sell.quantity,
      to_amount: orderData.amounts.buy.quantity,
      pool_source: orderData.selectedPoolCalculation.pool.provider,
      swap_fees: Number(
        Quantities.denominated(
          orderData.selectedPoolCalculation.pool.batcherFee.quantity,
          Number(wallet.primaryTokenInfo.decimals),
        ),
      ),
    })

    navigation.confirmTx()
  }

  const createSwapOrder = (orderData: Swap.CreateOrderData) => {
    createOrderData({
      amounts: {
        sell: orderData.amounts.sell,
        buy: orderData.amounts.buy,
      },
      address: orderData?.address,
      slippage: orderData.slippage,
      selectedPool: orderData.selectedPool,
    })
  }

  const createUnsignedSwapTx = () => {
    const orderDetails = {
      sell: orderData.amounts.sell,
      buy: orderData.amounts.buy,
      pools: orderData.pools,
      selectedPool: orderData.selectedPoolCalculation?.pool,
      slippage: orderData.slippage,
      address: wallet.externalAddresses[0],
    }

    if (orderDetails.pools === undefined || orderDetails.selectedPool === undefined) return

    if (orderData.type === 'market') {
      const orderResult: Swap.CreateOrderData | undefined = makePossibleMarketOrder(
        orderDetails.sell,
        orderDetails.buy,
        orderDetails.pools,
        orderDetails.slippage,
        orderDetails.address,
      )
      if (orderResult) createSwapOrder(orderResult)
    }

    if (orderData.type === 'limit') {
      const orderResult = makeLimitOrder(
        orderDetails.sell,
        orderDetails.buy,
        orderDetails.selectedPool,
        orderDetails.slippage,
        orderDetails.address,
      )
      createSwapOrder(orderResult)
    }
  }

  const handleOnSwap = () => {
    if (orderData.selectedPoolCalculation === undefined) return
    if (orderData.type === 'limit' && orderData.limitPrice !== undefined) {
      const marketPrice = new BigNumber(orderData.selectedPoolCalculation.prices.market)
      const limitPrice = new BigNumber(orderData.limitPrice)

      if (limitPrice.isGreaterThan(marketPrice.times(1 + LIMIT_PRICE_WARNING_THRESHOLD))) {
        setShowLimitPriceWarning(true)
        return
      }
    }

    createUnsignedSwapTx()
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={120}
      >
        <ScrollView style={styles.scroll}>
          <View style={styles.container}>
            <LimitPriceWarning
              open={showLimitPriceWarning}
              onClose={() => setShowLimitPriceWarning(false)}
              onSubmit={createUnsignedSwapTx}
            />

            <TopTokenActions />

            <EditSellAmount error={sellError} />

            <Spacer height={16} />

            <ShowTokenActions />

            <Spacer height={16} />

            <EditBuyAmount error={buyError} />

            <Spacer height={20} />

            <EditLimitPrice />

            <EditSlippage />

            <ShowPoolActions />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Actions>
        <Button testID="swapButton" shelleyTheme title={strings.swapTitle} onPress={handleOnSwap} disabled={disabled} />
      </Actions>

      <LoadingOverlay loading={isLoading} />
    </View>
  )
}

const Actions = ({style, ...props}: ViewProps) => <View style={[styles.actions, style]} {...props} />

const useSellError = (errors: Array<string> = []): string => {
  const noPoolError = useNoPoolError()
  const notEnoughBalanceError = useNotEnoughBalanceError()

  const allErrors = [noPoolError, notEnoughBalanceError, ...errors]
  const sellError = allErrors.find((error) => !isEmptyString(error))

  return sellError ?? ''
}

const useBuyError = (errors: Array<string> = []): string => {
  const noPoolError = useNoPoolError()
  const notEnoughSupplyError = useNotEnoughSupplyError()

  const allErrors = [noPoolError, notEnoughSupplyError, ...errors]
  const buyError = allErrors.find((error) => !isEmptyString(error))

  return buyError ?? ''
}

const useNotEnoughSupplyError = (): string => {
  const strings = useStrings()
  const {orderData} = useSwap()
  const {isBuyTouched, isSellTouched} = useSwapTouched()
  const pool = orderData.selectedPoolCalculation?.pool
  const {tokenId, quantity} = orderData.amounts.buy
  const poolSupply = tokenId === pool?.tokenA.tokenId ? pool?.tokenA.quantity : pool?.tokenB.quantity
  const hasSupply = !Quantities.isGreaterThan(quantity, poolSupply ?? Quantities.zero)

  const notEnoughSupplyError =
    (!Quantities.isZero(quantity) && !hasSupply) || (isSellTouched && isBuyTouched && pool === undefined)
      ? strings.notEnoughSupply
      : ''

  return notEnoughSupplyError
}

const useNotEnoughBalanceError = (): string => {
  const strings = useStrings()
  const {orderData} = useSwap()
  const {isBuyTouched} = useSwapTouched()
  const wallet = useSelectedWallet()
  const {tokenId, quantity} = orderData.amounts.sell
  const balance = useBalance({wallet, tokenId})

  const hasBalance = !Quantities.isGreaterThan(
    Quantities.sum([
      tokenId === wallet.primaryTokenInfo.id ? orderData.amounts.sell.quantity : Quantities.zero,
      orderData.selectedPoolCalculation?.cost.batcherFee.quantity ?? Quantities.zero,
      orderData.selectedPoolCalculation?.cost.frontendFeeInfo.fee.quantity ?? Quantities.zero,
      orderData.selectedPoolCalculation?.pool.deposit.quantity ?? Quantities.zero,
    ]),
    balance,
  )

  console.log('isBuyTouched', orderData.selectedPoolCalculation?.pool.deposit.quantity)

  const notEnoughBalanceError =
    !Quantities.isZero(quantity) && !hasBalance && isBuyTouched ? strings.notEnoughBalance : ''

  return notEnoughBalanceError
}

const useNoPoolError = () => {
  const strings = useStrings()
  const {orderData} = useSwap()
  const {isBuyTouched} = useSwapTouched()

  console.log('orderData.amounts.buy', orderData.amounts.buy)

  const noPoolError = orderData.selectedPoolCalculation === undefined && isBuyTouched ? strings.noPool : ''

  return noPoolError
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  scroll: {
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    paddingTop: 10,
  },
  flex: {
    flex: 1,
  },
  actions: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER_GRAY,
  },
})
