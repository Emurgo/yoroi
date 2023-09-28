import {makeLimitOrder, makePossibleMarketOrder, useSwap, useSwapCreateOrder, useSwapPoolsByPair} from '@yoroi/swap'
import {Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import React, {useEffect, useMemo, useState} from 'react'
import {KeyboardAvoidingView, Platform, StyleSheet, View, ViewProps} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {Button, Spacer} from '../../../../../components'
import {LoadingOverlay} from '../../../../../components/LoadingOverlay'
import {useMetrics} from '../../../../../metrics/metricsManager'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {useTokenInfos} from '../../../../../yoroi-wallets/hooks'
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
  const {createOrder, selectedPoolChanged, unsignedTxChanged, txPayloadChanged} = useSwap()
  const wallet = useSelectedWallet()
  const {track} = useMetrics()

  const tokenInfos = useTokenInfos({
    wallet,
    tokenIds: [createOrder.amounts.buy.tokenId, createOrder.amounts.sell.tokenId],
  })
  const [showLimitPriceWarning, setShowLimitPriceWarning] = useState(false)
  const {isBuyTouched, isSellTouched, poolDefaulted} = useSwapTouched()
  const {poolList} = useSwapPoolsByPair({
    tokenA: createOrder.amounts.sell.tokenId ?? '',
    tokenB: createOrder.amounts.buy.tokenId ?? '',
  })

  const bestPool = useMemo(() => {
    if (poolList !== undefined && poolList.length > 0) {
      return poolList.sort((a, b) => a.price - b.price).find(() => true)
    }
    return undefined
  }, [poolList])

  useEffect(() => {
    selectedPoolChanged(bestPool)
    poolDefaulted()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolDefaulted, selectedPoolChanged, bestPool?.poolId, bestPool?.price])

  const {createUnsignedTx, isLoading} = useSwapTx({
    onSuccess: (yoroiUnsignedTx) => {
      unsignedTxChanged(yoroiUnsignedTx)
      swap()
      setShowLimitPriceWarning(false)
    },
    onError: (error) => {
      console.log(error)
    },
  })

  const {createOrderData} = useSwapCreateOrder({
    onSuccess: (data: Swap.CreateOrderResponse) => {
      if (data?.contractAddress !== undefined && createOrder.selectedPool !== undefined) {
        const {amounts, limitPrice, address, slippage, selectedPool} = createOrder
        const entry = createYoroiEntry(
          {
            amounts,
            limitPrice,
            address,
            slippage,
            selectedPool,
          },
          data.contractAddress,
          wallet,
        )
        const datum = {data: data.datum}
        txPayloadChanged({datum: data.datum, datumHash: data.datumHash, contractAddress: data.contractAddress})
        createUnsignedTx({entry, datum})
      }
    },
    onError: (error) => {
      console.log(error)
    },
  })

  const disabled =
    !isBuyTouched ||
    !isSellTouched ||
    Quantities.isZero(createOrder.amounts.buy.quantity) ||
    Quantities.isZero(createOrder.amounts.sell.quantity) ||
    (createOrder.type === 'limit' && createOrder.limitPrice !== undefined && Quantities.isZero(createOrder.limitPrice))

  const swap = () => {
    const sellTokenInfo = tokenInfos.find((tokenInfo) => tokenInfo.id === createOrder.amounts.sell.tokenId)
    const buyTokenInfo = tokenInfos.find((tokenInfo) => tokenInfo.id === createOrder.amounts.buy.tokenId)

    if (!sellTokenInfo || !buyTokenInfo || createOrder?.selectedPool === undefined) return

    track.swapOrderSelected({
      from_asset: [
        {asset_name: sellTokenInfo.name, asset_ticker: sellTokenInfo.ticker, policy_id: sellTokenInfo.group},
      ],
      to_asset: [{asset_name: buyTokenInfo.name, asset_ticker: buyTokenInfo.ticker, policy_id: buyTokenInfo.group}],
      order_type: createOrder.type,
      slippage_tolerance: createOrder.slippage,
      from_amount: createOrder.amounts.sell.quantity,
      to_amount: createOrder.amounts.buy.quantity,
      pool_source: createOrder.selectedPool.provider,
      swap_fees: Number(
        Quantities.denominated(createOrder.selectedPool.batcherFee.quantity, Number(wallet.primaryTokenInfo.decimals)),
      ),
    })

    navigation.confirmTx()
  }

  const createUnsignedSwapTx = () => {
    const {amounts} = createOrder
    const orderDetails = {
      sell: amounts.sell,
      buy: amounts.buy,
      pools: poolList,
      selectedPool: createOrder.selectedPool,
      slippage: createOrder.slippage,
      address: wallet.externalAddresses[0],
    }

    if (orderDetails.pools === undefined || orderDetails.selectedPool === undefined) return

    if (createOrder.type === 'market') {
      const orderResult: Swap.CreateOrderData | undefined = makePossibleMarketOrder(
        orderDetails.sell,
        orderDetails.buy,
        orderDetails.pools,
        orderDetails.slippage,
        orderDetails.address,
      )
      if (orderResult) createSwapOrder(orderResult)
    }

    if (createOrder.type === 'limit') {
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

  const handleOnSwap = () => {
    if (createOrder.type === 'limit' && createOrder.limitPrice !== undefined) {
      const marketPrice = BigNumber(createOrder.marketPrice)
      const limitPrice = BigNumber(createOrder.limitPrice)

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

            <EditSellAmount />

            <Spacer height={16} />

            <ShowTokenActions />

            <Spacer height={16} />

            <EditBuyAmount />

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
