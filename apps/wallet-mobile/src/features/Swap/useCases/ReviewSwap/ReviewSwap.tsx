import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, useWindowDimensions, View, ViewProps} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../components/Button/Button'
import {KeyboardAvoidingView} from '../../../../components/KeyboardAvoidingView/KeyboardAvoidingView'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {undefinedToken} from '../../common/constants'
import {useNavigateTo} from '../../common/navigation'
import {ProtocolAvatar} from '../../common/Protocol/ProtocolAvatar'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'
import {TransactionSummary} from './TransactionSummary'

const BOTTOM_ACTION_SECTION = 220

export const ReviewSwap = () => {
  const [contentHeight, setContentHeight] = React.useState(0)
  const styles = useStyles()
  const {height: deviceHeight} = useWindowDimensions()
  const strings = useStrings()
  const {track} = useMetrics()
  const {navigateToTxReview} = useWalletNavigation()
  const navigateTo = useNavigateTo()

  const swapForm = useSwap()

  if (swapForm.createTx === undefined) return null
  const tokenInInfo = swapForm.tokenInfos.get(swapForm.tokenInInput.tokenId ?? undefinedToken)
  const tokenOutInfo = swapForm.tokenInfos.get(swapForm.tokenOutInput.tokenId ?? undefinedToken)

  const trackSwapOrderSubmitted = () => {
    track.swapOrderSubmitted({
      from_asset: [
        {
          asset_name: tokenInInfo?.name,
          asset_ticker: tokenInInfo?.ticker,
          policy_id: tokenInInfo?.id.split('.')[0],
        },
      ],
      to_asset: [
        {asset_name: tokenOutInfo?.name, asset_ticker: tokenOutInfo?.ticker, policy_id: tokenOutInfo?.id.split('.')[0]},
      ],
      order_type: swapForm.orderType,
      slippage_tolerance: swapForm.slippageInput.value,
      from_amount: String(swapForm.createTx?.totalInput ?? 0),
      to_amount: String(swapForm.createTx?.totalOutput ?? 0),
      pool_source: swapForm.createTx?.splits[0]?.poolId ?? '',
      swap_fees: Number(swapForm.createTx?.totalFee),
    })
  }

  const onSwapTxSuccess = () => {
    trackSwapOrderSubmitted()
    swapForm.action({type: 'ResetAmounts'})
    navigateTo.submittedTx()
  }

  const onSwapTxError = () => {
    navigateTo.failedTx()
  }

  const onNext = () => {
    const protocol = swapForm.createTx?.splits[0]?.protocol

    navigateToTxReview({
      onSuccess: onSwapTxSuccess,
      onError: onSwapTxError,
      cbor: swapForm.createTx?.cbor,
      receiverCustomTitle: protocol !== undefined ? <ProtocolAvatar protocol={protocol} /> : undefined,
      details: {component: <TransactionSummary swapForm={swapForm} />, title: strings.swapDetailsTitle, height: 600},
    })
  }

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
              <TransactionSummary swapForm={swapForm} />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      <Actions
        style={{
          ...(deviceHeight < contentHeight && styles.actionBorder),
        }}
      >
        <Button testID="swapButton" title={strings.next} onPress={onNext} />
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
