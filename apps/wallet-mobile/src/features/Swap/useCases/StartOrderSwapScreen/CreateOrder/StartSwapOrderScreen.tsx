import {isString} from '@yoroi/common'
import {usePortfolioTokenInfo} from '@yoroi/portfolio'
import {makeLimitOrder, makePossibleMarketOrder, useSwap, useSwapCreateOrder, useSwapPoolsByPair} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {Alert, StyleSheet, useWindowDimensions, View, ViewProps} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {Button, useModal} from '../../../../../components'
import {Space} from '../../../../../components/Space/Space'
import {frontendFeeAddressMainnet, frontendFeeAddressPreprod} from '../../../../../kernel/env'
import {useIsKeyboardOpen} from '../../../../../kernel/keyboard/useIsKeyboardOpen'
import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../../kernel/navigation'
import {NotEnoughMoneyToSendError} from '../../../../../yoroi-wallets/cardano/types'
import {YoroiEntry} from '../../../../../yoroi-wallets/types'
import {asQuantity, Quantities} from '../../../../../yoroi-wallets/utils'
import {useDisableSearchOnBar} from '../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {createOrderEntry, makePossibleFrontendFeeEntry} from '../../../common/entries'
import {getPriceImpactRisk} from '../../../common/helpers'
import {useNavigateTo} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'
import {useSwapForm} from '../../../common/SwapFormProvider'
import {useSwapTx} from '../../../common/useSwapTx'
import {AmountActions} from './Actions/AmountActions/AmountActions'
import {OrderActions} from './Actions/OrderActions/OrderActions'
import {EditBuyAmount} from './EditBuyAmount/EditBuyAmount'
import {ShowPoolActions} from './EditPool/ShowPoolActions'
import {EditPrice} from './EditPrice/EditPrice'
import {EditSellAmount} from './EditSellAmount/EditSellAmount'
import {EditSlippage} from './EditSlippage/EditSlippage'
import {WarnLimitPrice} from './WarnLimitPrice/WarnLimitPrice'
import {WarnPriceImpact} from './WarnPriceImpact/WarnPriceImpact'
import {WarnSlippage} from './WarnSlippage/WarnSlippage'

const LIMIT_PRICE_WARNING_THRESHOLD = 0.1 // 10%
const BOTTOM_ACTION_SECTION = 180

export const StartSwapOrderScreen = () => {
  const [contentHeight, setContentHeight] = React.useState(0)
  const strings = useStrings()
  const styles = useStyles()
  const navigateTo = useNavigateTo()
  const {navigateToTxHistory} = useWalletNavigation()
  const {orderData, unsignedTxChanged, poolPairsChanged} = useSwap()
  const {wallet} = useSelectedWallet()
  const {track} = useMetrics()
  const {openModal} = useModal()
  const {height: deviceHeight} = useWindowDimensions()
  const priceImpactRisk = getPriceImpactRisk(Number(orderData.selectedPoolCalculation?.prices.priceImpact))
  const isKeyboardOpen = useIsKeyboardOpen()

  const {
    sellQuantity: {isTouched: isSellTouched},
    buyQuantity: {isTouched: isBuyTouched},
    sellAmountErrorChanged,
    poolDefaulted,
    canSwap,
  } = useSwapForm()

  useSwapPoolsByPair(
    {
      tokenA: orderData.amounts.sell?.info.id ?? '.',
      tokenB: orderData.amounts.buy?.info.id ?? '.',
    },
    {
      enabled:
        isBuyTouched &&
        isSellTouched &&
        orderData.amounts.sell?.info.id != null &&
        orderData.amounts.buy?.info.id != null,
      onSuccess: (pools) => {
        poolPairsChanged(pools)
      },
    },
  )

  useDisableSearchOnBar({
    title: strings.swapTitle,
    isChild: true,
    onBack: navigateToTxHistory,
  })

  const {tokenInfo: sellTokenInfo} = usePortfolioTokenInfo({
    getTokenInfo: wallet.networkManager.tokenManager.api.tokenInfo,
    id: orderData.amounts.sell?.info.id ?? 'unknown.',
    network: wallet.networkManager.network,
    primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
  })
  const {tokenInfo: buyTokenInfo} = usePortfolioTokenInfo({
    getTokenInfo: wallet.networkManager.tokenManager.api.tokenInfo,
    id: orderData.amounts.buy?.info.id ?? 'unknown.',
    network: wallet.networkManager.network,
    primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
  })

  React.useEffect(() => {
    if (orderData.selectedPoolId === orderData.bestPoolCalculation?.pool.poolId) poolDefaulted()
  }, [orderData.selectedPoolId, orderData.bestPoolCalculation, poolDefaulted])

  const {createUnsignedTx, isLoading} = useSwapTx({
    onSuccess: (yoroiUnsignedTx) => {
      unsignedTxChanged(yoroiUnsignedTx)
      swap()
    },
    onError: (error) => {
      if (error instanceof NotEnoughMoneyToSendError) {
        sellAmountErrorChanged(strings.notEnoughFeeBalance)
        return
      }

      Alert.alert(strings.generalErrorTitle, strings.generalErrorMessage(error.message))
    },
  })

  const {createOrderData} = useSwapCreateOrder({
    onSuccess: (orderResponse: Swap.CreateOrderResponse) => {
      const {amounts, selectedPoolCalculation} = orderData
      if (
        orderResponse?.contractAddress === undefined ||
        selectedPoolCalculation?.pool === undefined ||
        !isString(orderResponse?.datum) ||
        amounts?.buy == null ||
        amounts?.sell == null
      ) {
        Alert.alert(strings.generalErrorTitle, strings.generalTxErrorMessage)
        return
      }

      const {contractAddress, datum: datumData} = orderResponse
      const datum: YoroiEntry['datum'] = datumData != null ? {data: datumData} : undefined
      const orderAmounts = {
        sell: {
          tokenId: amounts.sell.info.id,
          quantity: amounts.sell.quantity,
        },
        buy: {
          tokenId: amounts.buy.info.id,
          quantity: amounts.buy.quantity,
        },
      }
      const orderEntry = createOrderEntry(
        orderAmounts,
        selectedPoolCalculation.pool,
        contractAddress,
        wallet.portfolioPrimaryTokenInfo.id,
        datum,
      )

      const isMainnet = wallet.isMainnet
      const frontendFee = selectedPoolCalculation.cost.frontendFeeInfo.fee
      const frontendFeeDepositAddress = isMainnet ? frontendFeeAddressMainnet : frontendFeeAddressPreprod
      const frontendFeeEntry = makePossibleFrontendFeeEntry(frontendFee, frontendFeeDepositAddress)

      const entries = frontendFeeEntry != null ? [orderEntry, frontendFeeEntry] : [orderEntry]

      createUnsignedTx({entries})
    },
    onError: (error: Error | string) => {
      Alert.alert(
        strings.generalErrorTitle,
        strings.generalErrorMessage(error instanceof Error ? error.message : error),
      )
    },
  })

  const swap = () => {
    if (orderData.selectedPoolCalculation === undefined) return
    track.swapOrderSelected({
      from_asset: [
        {
          asset_name: sellTokenInfo?.name,
          asset_ticker: sellTokenInfo?.ticker,
          policy_id: sellTokenInfo?.id.split('.')[0],
        },
      ],
      to_asset: [
        {asset_name: buyTokenInfo?.name, asset_ticker: buyTokenInfo?.ticker, policy_id: buyTokenInfo?.id.split('.')[0]},
      ],
      order_type: orderData.type,
      slippage_tolerance: orderData.slippage,
      from_amount: orderData.amounts.sell?.quantity.toString() ?? '0',
      to_amount: orderData.amounts.buy?.quantity.toString() ?? '0',
      pool_source: orderData.selectedPoolCalculation.pool.provider,
      swap_fees: Number(
        Quantities.denominated(
          asQuantity(orderData.selectedPoolCalculation.pool.batcherFee.quantity.toString()),
          Number(wallet.primaryTokenInfo.decimals),
        ),
      ),
    })

    navigateTo.confirmTx()
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
    if (orderData.amounts.sell == null || orderData.amounts.buy == null) {
      Alert.alert(strings.generalErrorTitle, strings.generalTxErrorMessage)
      return
    }

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
        orderDetails.selectedPool,
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

    if (priceImpactRisk === 'high' && orderData.type === 'market') {
      openModal(
        strings.warning,
        <WarnPriceImpact onContinue={createUnsignedSwapTx} priceImpactRisk={priceImpactRisk} />,
        400,
      )
      return
    }

    if (orderData.type === 'limit' && orderData.limitPrice !== undefined) {
      const marketPrice = new BigNumber(orderData.selectedPoolCalculation.prices.market)
      const limitPrice = new BigNumber(orderData.limitPrice)

      if (limitPrice.isGreaterThan(marketPrice.times(1 + LIMIT_PRICE_WARNING_THRESHOLD))) {
        openModal(
          strings.limitPriceWarningTitle,
          <WarnLimitPrice orderData={orderData} onConfirm={createUnsignedSwapTx} />,
          400,
        )
        return
      }
    }

    const minReceived = Quantities.denominated(
      asQuantity(orderData.selectedPoolCalculation.buyAmountWithSlippage.quantity.toString()),
      buyTokenInfo?.decimals ?? 0,
    )
    const buyTokenSwapTicker = buyTokenInfo?.ticker ?? buyTokenInfo?.name ?? ''

    if (Quantities.isZero(minReceived)) {
      openModal(
        strings.slippageWarningTitle,
        <WarnSlippage onConfirm={createUnsignedSwapTx} slippage={orderData.slippage} ticker={buyTokenSwapTicker} />,
        350,
      )
      return
    }

    createUnsignedSwapTx()
  }

  const disabled = isLoading || !canSwap

  return (
    <View style={[styles.root, styles.flex]}>
      <ScrollView style={styles.padding}>
        <Space height="sm" />

        <View
          onLayout={(event) => {
            const {height} = event.nativeEvent.layout
            setContentHeight(height + BOTTOM_ACTION_SECTION)
          }}
        >
          <OrderActions />

          <EditSellAmount />

          <Space height="lg" />

          <AmountActions />

          <Space height="lg" />

          <EditBuyAmount />

          <Space height="lg" />

          <EditPrice />

          <EditSlippage />

          <ShowPoolActions />
        </View>
      </ScrollView>

      <Actions style={[(deviceHeight < contentHeight || isKeyboardOpen) && styles.actionBorder]}>
        <Button testID="swapButton" shelleyTheme title={strings.swapTitle} onPress={handleOnSwap} disabled={disabled} />
      </Actions>
    </View>
  )
}

const Actions = ({style, ...props}: ViewProps) => {
  const styles = useStyles()
  return <View style={[styles.actions, style]} {...props} />
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
      ...atoms.pb_lg,
    },
    flex: {
      ...atoms.flex_1,
    },
    padding: {
      ...atoms.px_lg,
    },
    actions: {
      ...atoms.pt_lg,
      ...atoms.px_lg,
    },
    actionBorder: {
      ...atoms.border_t,
      borderTopColor: color.gray_200,
    },
  })
  return styles
}
