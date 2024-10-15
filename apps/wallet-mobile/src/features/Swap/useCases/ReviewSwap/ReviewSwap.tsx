import {getPoolUrlByProvider, useSwap} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
import {capitalize} from 'lodash'
import React from 'react'
import {InteractionManager, StyleSheet, useWindowDimensions, View, ViewProps} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components/Button/Button'
import {KeyboardAvoidingView} from '../../../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {YoroiSignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {asQuantity, Quantities} from '../../../../yoroi-wallets/utils/utils'
import {useReviewTx} from '../../../ReviewTx/common/ReviewTxProvider'
import {LiquidityPool} from '../../common/LiquidityPool/LiquidityPool'
import {useNavigateTo} from '../../common/navigation'
import {PoolIcon} from '../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../common/strings'
import {TransactionSummary} from './TransactionSummary'

const BOTTOM_ACTION_SECTION = 220

export const ReviewSwap = () => {
  const [contentHeight, setContentHeight] = React.useState(0)
  const strings = useStrings()
  const styles = useStyles()
  const navigate = useNavigateTo()
  const {track} = useMetrics()
  const {height: deviceHeight} = useWindowDimensions()
  const {navigateToTxReview} = useWalletNavigation()
  const {unsignedTxChanged, onSuccessChanged, onErrorChanged, customReceiverTitleChanged, detailsChanged} =
    useReviewTx()

  const {unsignedTx, orderData} = useSwap()
  const sellTokenInfo = orderData.amounts.sell?.info
  const buyTokenInfo = orderData.amounts.buy?.info

  const minReceived = Quantities.denominated(
    asQuantity(orderData.selectedPoolCalculation?.buyAmountWithSlippage?.quantity.toString() ?? 0),
    buyTokenInfo?.decimals ?? 0,
  )

  const couldReceiveNoAssets = Quantities.isZero(minReceived)

  const trackSwapOrderSubmitted = () => {
    if (orderData.selectedPoolCalculation === undefined) return
    track.swapOrderSubmitted({
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
      swap_fees: Number(orderData.selectedPoolCalculation.cost.batcherFee),
    })
  }

  const onSwapTxError = () => {
    navigate.failedTx()
  }

  const onSwapTxSuccess = (signedTx: YoroiSignedTx) => {
    trackSwapOrderSubmitted()
    InteractionManager.runAfterInteractions(() => {
      navigate.submittedTx(signedTx.signedTx.id)
    })
  }

  const onNext = () => {
    let liquidityPool: React.ReactNode = null
    if (orderData.selectedPoolCalculation) {
      const poolIcon = <PoolIcon providerId={orderData.selectedPoolCalculation.pool.provider} size={18} />
      const poolProviderFormatted = capitalize(orderData.selectedPoolCalculation.pool.provider)
      const poolUrl = getPoolUrlByProvider(orderData.selectedPoolCalculation.pool.provider)

      liquidityPool = (
        <LiquidityPool liquidityPoolIcon={poolIcon} liquidityPoolName={poolProviderFormatted} poolUrl={poolUrl} />
      )
    }

    if (liquidityPool != null) customReceiverTitleChanged(liquidityPool)
    detailsChanged({component: <TransactionSummary orderData={orderData} />, title: strings.swapDetailsTitle})
    unsignedTxChanged(unsignedTx)
    onSuccessChanged(onSwapTxSuccess)
    onErrorChanged(onSwapTxError)
    navigateToTxReview()
  }

  const isButtonDisabled = couldReceiveNoAssets

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.root}>
      <View style={styles.container}>
        <KeyboardAvoidingView keyboardVerticalOffset={120}>
          <ScrollView style={styles.scroll}>
            <View
              onLayout={(event) => {
                const {height} = event.nativeEvent.layout
                setContentHeight(height + BOTTOM_ACTION_SECTION)
              }}
            >
              <TransactionSummary orderData={orderData} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <Actions
        style={{
          ...(deviceHeight < contentHeight && styles.actionBorder),
        }}
      >
        <Button disabled={isButtonDisabled} testID="swapButton" title={strings.next} onPress={onNext} />
      </Actions>
    </SafeAreaView>
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
      ...atoms.flex_1,
      ...atoms.pt_lg,
      backgroundColor: color.bg_color_max,
    },
    container: {
      ...atoms.flex_1,
      ...atoms.justify_between,
      backgroundColor: color.bg_color_max,
    },
    actions: {
      ...atoms.p_lg,
      backgroundColor: color.bg_color_max,
    },
    scroll: {
      ...atoms.px_lg,
    },
    actionBorder: {
      borderTopWidth: 1,
      borderTopColor: color.gray_200,
    },
  })
  return styles
}
