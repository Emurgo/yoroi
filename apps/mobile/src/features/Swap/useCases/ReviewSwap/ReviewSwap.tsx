import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, useWindowDimensions, View, ViewProps} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {Button} from '../../../../ui/Button/Button'
import {KeyboardAvoidingView} from '../../../../ui/KeyboardAvoidingView'
import {ProtocolAvatar} from '../../../../ui/ProtocolAvatar/ProtocolAvatar'
import {TransactionSummary} from '../../../../ui/TransactionSummary/TransactionSummary'
import {undefinedToken} from '../../common/constants'
import {useNavigateTo} from '../../common/navigation'
import {useStrings} from '../../common/strings'
import {useSwap} from '../../common/SwapProvider'

const BOTTOM_ACTION_SECTION = 220

export const ReviewSwap = () => {
  const [contentHeight, setContentHeight] = React.useState(0)
  const {color, atoms} = useTheme()
  const {height: deviceHeight} = useWindowDimensions()
  const strings = useStrings()
  const {track} = useMetrics()
  const {navigateToTxReview} = useWalletNavigation()
  const navigateTo = useNavigateTo()

  const swapForm = useSwap()

  if (swapForm.createTx === undefined) return null
  const tokenInInfo = swapForm.tokenInfos.get(
    swapForm.tokenInInput.tokenId ?? undefinedToken,
  )
  const tokenOutInfo = swapForm.tokenInfos.get(
    swapForm.tokenOutInput.tokenId ?? undefinedToken,
  )

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
        {
          asset_name: tokenOutInfo?.name,
          asset_ticker: tokenOutInfo?.ticker,
          policy_id: tokenOutInfo?.id.split('.')[0],
        },
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
    swapForm.action({type: 'ResetForm'})
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
      receiverCustomTitle:
        protocol !== undefined ? (
          <ProtocolAvatar protocol={protocol} />
        ) : undefined,
      details: {
        component: <TransactionSummary swapForm={swapForm} />,
        title: strings.swapDetailsTitle,
        height: 600,
      },
    })
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[styles.root, atoms.pt_lg, {backgroundColor: color.bg_color_max}]}
    >
      <View style={[styles.container, {backgroundColor: color.bg_color_max}]}>
        <KeyboardAvoidingView keyboardVerticalOffset={120}>
          <ScrollView style={[styles.scroll, atoms.px_lg]}>
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
          ...(deviceHeight < contentHeight && {
            borderTopWidth: 1,
            borderTopColor: color.gray_200,
          }),
        }}
      >
        <Button testID="swapButton" title={strings.next} onPress={onNext} />
      </Actions>
    </SafeAreaView>
  )
}

const Actions = ({style, ...props}: ViewProps) => {
  const {color, atoms} = useTheme()
  return (
    <View
      style={[style, atoms.p_lg, {backgroundColor: color.bg_color_max}]}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  root: {
    ...a.flex_1,
  },
  container: {
    ...a.flex_1,
    ...a.justify_between,
  },
  actions: {},
  scroll: {},
  actionBorder: {},
})
